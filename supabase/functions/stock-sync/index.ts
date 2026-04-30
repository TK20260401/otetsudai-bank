/**
 * Supabase Edge Function: stock-sync
 *
 * Yahoo Finance API（無料・認証不要）で株価を取得し、otetsudai_stock_prices を更新する。
 * JP 銘柄（1306.T / 1321.T 等）と米国株を一律に Yahoo で取得し、Alpha Vantage 制約を回避。
 *
 * 環境変数:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — Supabase接続
 *   ALPHA_VANTAGE_API_KEY — 不要（Yahoo に切替済み、変数は無視される）
 *
 * エンドポイント:
 *   POST /stock-sync — 全プリセット銘柄の株価を同期
 *
 * 切替経緯（2026-04-30）:
 *   Alpha Vantage 無料枠は東証銘柄（.T サフィックス）の GLOBAL_QUOTE で
 *   "quote not found" を返すケースが頻発。Yahoo Finance の chart エンドポイントは
 *   JP/US 両対応＋認証不要＋並列取得可能のため、レート制限の 12.5s sleep も撤廃。
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

// Yahoo は User-Agent を見るため必須
const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
};

/** Yahoo Finance chart API で1銘柄の現在価格を取得（認証不要、JP/US 両対応） */
async function fetchYahooQuote(
  symbol: string
): Promise<{ price: number; changePercent: number; currency: string } | null> {
  const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  try {
    const res = await fetch(url, { headers: YAHOO_HEADERS });
    if (!res.ok) {
      console.error(`[stock-sync] Yahoo ${symbol}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.meta) {
      console.error(`[stock-sync] Yahoo ${symbol}: no result`);
      return null;
    }
    const meta = result.meta;
    const price = meta.regularMarketPrice;
    if (typeof price !== "number" || price <= 0) {
      console.error(`[stock-sync] Yahoo ${symbol}: invalid price`, meta);
      return null;
    }
    const previousClose =
      typeof meta.chartPreviousClose === "number"
        ? meta.chartPreviousClose
        : typeof meta.previousClose === "number"
          ? meta.previousClose
          : price;
    const changePercent =
      previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0;
    const currency = meta.currency || "USD";
    return { price, changePercent, currency };
  } catch (err) {
    console.error(`[stock-sync] Yahoo ${symbol} error:`, err);
    return null;
  }
}

/** Yahoo Finance で USD/JPY レートを取得 */
async function fetchUsdJpy(): Promise<number> {
  const quote = await fetchYahooQuote("JPY=X");
  if (quote && quote.price > 0) return quote.price;
  console.warn("[stock-sync] USD/JPY fetch failed, using fallback 150");
  return 150;
}

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. USD/JPY レートを取得
    const usdJpy = await fetchUsdJpy();
    console.log(`[stock-sync] USD/JPY = ${usdJpy}`);

    // 2. 全プリセット銘柄を取得
    const { data: stocks, error: stockError } = await supabase
      .from("otetsudai_stock_prices")
      .select("*")
      .eq("is_preset", true);

    if (stockError) {
      return new Response(JSON.stringify({ error: stockError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!stocks || stocks.length === 0) {
      return new Response(
        JSON.stringify({ message: "プリセット銘柄がありません", updated: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. 全銘柄を並列取得（Yahoo はレート制限が緩いため Promise.all で並列化）
    const quotes = await Promise.all(
      stocks.map((s: { symbol: string }) => fetchYahooQuote(s.symbol))
    );

    // 4. DB を更新
    const results: { symbol: string; status: string; price_jpy?: number }[] = [];
    let updated = 0;

    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      const quote = quotes[i];

      if (quote) {
        const isJpy = stock.currency === "JPY" || quote.currency === "JPY";
        const priceJpy = isJpy
          ? Math.round(quote.price)
          : Math.round(quote.price * usdJpy);

        const { error: updateError } = await supabase
          .from("otetsudai_stock_prices")
          .update({
            price: quote.price,
            price_jpy: priceJpy,
            change_percent: quote.changePercent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", stock.id);

        if (updateError) {
          results.push({
            symbol: stock.symbol,
            status: `update error: ${updateError.message}`,
          });
        } else {
          results.push({
            symbol: stock.symbol,
            status: "ok",
            price_jpy: priceJpy,
          });
          updated++;
        }
      } else {
        results.push({ symbol: stock.symbol, status: "fetch failed" });
      }
    }

    // 5. ポートフォリオの現在価格も更新
    const { data: portfolios } = await supabase
      .from("otetsudai_invest_portfolios")
      .select("*")
      .gt("shares", 0);

    if (portfolios && portfolios.length > 0) {
      // stock_prices から最新価格をマップ化
      const priceMap: Record<string, number> = {};
      for (let i = 0; i < stocks.length; i++) {
        const q = quotes[i];
        if (q) priceMap[stocks[i].symbol] = q.price;
      }

      const walletTotals: Record<string, number> = {};
      for (const p of portfolios) {
        const currentPrice = priceMap[p.symbol];
        if (currentPrice === undefined) continue;
        const value = Math.floor(currentPrice * p.shares);
        walletTotals[p.wallet_id] =
          (walletTotals[p.wallet_id] || 0) + value;

        await supabase
          .from("otetsudai_invest_portfolios")
          .update({
            current_price: currentPrice,
            current_value: value,
            updated_at: new Date().toISOString(),
          })
          .eq("id", p.id);
      }

      for (const [walletId, total] of Object.entries(walletTotals)) {
        await supabase
          .from("otetsudai_wallets")
          .update({ invest_balance: total })
          .eq("id", walletId);
      }
    }

    // 6. 同期ログ記録
    await supabase.from("otetsudai_stock_sync_log").insert({
      synced_at: new Date().toISOString(),
      symbols_count: stocks.length,
      success_count: updated,
      usd_jpy_rate: usdJpy,
    });

    return new Response(
      JSON.stringify({
        message: "株価同期完了 (Yahoo Finance)",
        updated,
        total: stocks.length,
        usd_jpy: usdJpy,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
