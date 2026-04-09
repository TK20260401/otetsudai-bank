/**
 * Supabase Edge Function: stock-sync
 *
 * Alpha Vantage APIで株価を取得し、otetsudai_stock_pricesを更新する。
 * インデックスはETFで代替取得（Alpha Vantage制約回避）。
 *
 * 環境変数:
 *   ALPHA_VANTAGE_API_KEY — Alpha Vantage の無料APIキー
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — Supabase接続
 *
 * エンドポイント:
 *   POST /stock-sync — 全プリセット銘柄の株価を同期
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";
const RATE_LIMIT_DELAY_MS = 12500; // 5リクエスト/分 → 12.5秒間隔

/** Alpha Vantage GLOBAL_QUOTE で株価を取得 */
async function fetchQuote(
  symbol: string,
  apiKey: string
): Promise<{ price: number; changePercent: number } | null> {
  const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  const quote = data["Global Quote"];
  if (!quote || !quote["05. price"]) {
    console.error(`[stock-sync] ${symbol}: quote not found`, JSON.stringify(data).slice(0, 200));
    return null;
  }

  const price = parseFloat(quote["05. price"]);
  const changeStr = (quote["10. change percent"] || "0%").replace("%", "");
  const changePercent = parseFloat(changeStr) || 0;

  return { price, changePercent };
}

/** USD/JPY レートを取得 */
async function fetchUsdJpy(apiKey: string): Promise<number> {
  const url = `${ALPHA_VANTAGE_BASE}?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=JPY&apikey=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const rate = data?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];
    if (rate) return parseFloat(rate);
  } catch (err) {
    console.error("[stock-sync] USD/JPY fetch failed:", err);
  }
  return 150; // フォールバック
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("ALPHA_VANTAGE_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ALPHA_VANTAGE_API_KEY が設定されていません" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. USD/JPYレートを取得
    const usdJpy = await fetchUsdJpy(apiKey);
    console.log(`[stock-sync] USD/JPY = ${usdJpy}`);
    await sleep(RATE_LIMIT_DELAY_MS);

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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. 各銘柄の株価を取得（レート制限付き）
    const results: { symbol: string; status: string; price_jpy?: number }[] = [];
    let updated = 0;

    for (const stock of stocks) {
      const quote = await fetchQuote(stock.symbol, apiKey);

      if (quote) {
        const isJpy = stock.currency === "JPY";
        const priceJpy = isJpy ? quote.price : Math.round(quote.price * usdJpy);

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
          results.push({ symbol: stock.symbol, status: `update error: ${updateError.message}` });
        } else {
          results.push({ symbol: stock.symbol, status: "ok", price_jpy: priceJpy });
          updated++;
        }
      } else {
        results.push({ symbol: stock.symbol, status: "fetch failed" });
      }

      // レート制限: 最後の銘柄以外はsleep
      if (stock !== stocks[stocks.length - 1]) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    }

    // 4. ポートフォリオの現在価格も更新
    const { data: portfolios } = await supabase
      .from("otetsudai_invest_portfolios")
      .select("*")
      .gt("shares", 0);

    if (portfolios && portfolios.length > 0) {
      // stock_pricesから最新価格をマップ化
      const priceMap: Record<string, number> = {};
      for (const stock of stocks) {
        // 再取得して最新の price_jpy を使う
        const { data: freshStock } = await supabase
          .from("otetsudai_stock_prices")
          .select("price, price_jpy")
          .eq("symbol", stock.symbol)
          .single();
        if (freshStock) {
          priceMap[stock.symbol] = freshStock.price;
        }
      }

      const walletTotals: Record<string, number> = {};
      for (const p of portfolios) {
        const currentPrice = priceMap[p.symbol];
        if (currentPrice === undefined) continue;
        const value = Math.floor(currentPrice * p.shares);
        walletTotals[p.wallet_id] = (walletTotals[p.wallet_id] || 0) + value;

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

    // 5. 同期ログ記録
    await supabase.from("otetsudai_stock_sync_log").insert({
      synced_at: new Date().toISOString(),
      symbols_count: stocks.length,
      success_count: updated,
      usd_jpy_rate: usdJpy,
    });

    return new Response(
      JSON.stringify({
        message: "株価同期完了",
        updated,
        total: stocks.length,
        usd_jpy: usdJpy,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
