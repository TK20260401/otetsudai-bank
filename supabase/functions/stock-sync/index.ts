/**
 * Supabase Edge Function: stock-sync
 *
 * Alpha Vantage APIを使い、Investウォレットの仮想株価を取得・同期する。
 * Cron（pg_cron）またはクライアントから呼び出して使用。
 *
 * 環境変数:
 *   ALPHA_VANTAGE_API_KEY — Alpha Vantage の無料APIキー
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — Supabase接続
 *
 * エンドポイント:
 *   GET  /stock-sync?symbol=7203.T      → 単一銘柄の株価取得
 *   POST /stock-sync                     → 全ウォレットの invest_balance を同期
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  currency: string;
  timestamp: string;
}

/** Alpha Vantage から株価を取得 */
async function fetchStockQuote(
  symbol: string,
  apiKey: string
): Promise<StockQuote> {
  const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  const quote = data["Global Quote"];
  if (!quote || !quote["05. price"]) {
    throw new Error(`株価を取得できませんでした: ${symbol}`);
  }

  return {
    symbol: quote["01. symbol"],
    price: parseFloat(quote["05. price"]),
    change: parseFloat(quote["09. change"]),
    changePercent: quote["10. change percent"],
    currency: symbol.endsWith(".T") ? "JPY" : "USD",
    timestamp: quote["07. latest trading day"],
  };
}

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("ALPHA_VANTAGE_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ALPHA_VANTAGE_API_KEY が設定されていません" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // GET: 単一銘柄の株価取得
    if (req.method === "GET") {
      const url = new URL(req.url);
      const symbol = url.searchParams.get("symbol") || "7203.T"; // デフォルト: トヨタ
      const quote = await fetchStockQuote(symbol, apiKey);
      return new Response(JSON.stringify(quote), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: 全ウォレットの invest_balance を株価同期
    if (req.method === "POST") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // invest_portfolios テーブルから全ポートフォリオ取得
      const { data: portfolios, error: portError } = await supabase
        .from("otetsudai_invest_portfolios")
        .select("*")
        .gt("shares", 0);

      if (portError) {
        return new Response(JSON.stringify({ error: portError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!portfolios || portfolios.length === 0) {
        return new Response(
          JSON.stringify({ message: "同期対象のポートフォリオはありません", updated: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ユニークな銘柄の株価を一括取得
      const symbols = [...new Set(portfolios.map((p: { symbol: string }) => p.symbol))];
      const quotes: Record<string, StockQuote> = {};

      for (const symbol of symbols) {
        try {
          quotes[symbol] = await fetchStockQuote(symbol, apiKey);
        } catch {
          console.error(`Failed to fetch ${symbol}`);
        }
      }

      // ウォレットごとに invest_balance を計算・更新
      const walletTotals: Record<string, number> = {};
      for (const p of portfolios) {
        const quote = quotes[p.symbol];
        if (!quote) continue;
        const value = Math.floor(quote.price * p.shares);
        walletTotals[p.wallet_id] = (walletTotals[p.wallet_id] || 0) + value;

        // ポートフォリオの現在価格を更新
        await supabase
          .from("otetsudai_invest_portfolios")
          .update({
            current_price: quote.price,
            current_value: value,
            updated_at: new Date().toISOString(),
          })
          .eq("id", p.id);
      }

      // ウォレットの invest_balance を更新
      for (const [walletId, total] of Object.entries(walletTotals)) {
        await supabase
          .from("otetsudai_wallets")
          .update({ invest_balance: total })
          .eq("id", walletId);
      }

      return new Response(
        JSON.stringify({
          message: "株価同期完了",
          updated: Object.keys(walletTotals).length,
          quotes,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
