import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/stock-sync
 * DBから最新の株価を取得するだけ（高速）
 */
export async function GET() {
  const { data, error } = await supabase
    .from("otetsudai_stock_prices")
    .select("symbol, price, price_jpy, change_percent, updated_at")
    .eq("is_preset", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ prices: data, count: data?.length || 0 });
}

/**
 * POST /api/stock-sync
 * Alpha Vantage APIから1銘柄ずつ価格取得（admin用）
 * { symbols: ["SPY"] } → 指定銘柄のみ更新
 * { symbols: undefined } は非推奨（フロントで1銘柄ずつ呼ぶ設計）
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ALPHA_VANTAGE_API_KEY未設定" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const symbols: string[] = body.symbols || [];

  if (symbols.length === 0) {
    return NextResponse.json({ error: "symbolsを指定してください" }, { status: 400 });
  }

  const updated: string[] = [];
  const failed: string[] = [];
  let usdJpy: number | null = null;

  // USD銘柄があれば為替レート取得
  const { data: stocks } = await supabase
    .from("otetsudai_stock_prices")
    .select("symbol, currency")
    .in("symbol", symbols);

  const hasUsd = (stocks || []).some((s) => s.currency === "USD");
  if (hasUsd) {
    try {
      const fxRes = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=JPY&apikey=${apiKey}`
      );
      const fxData = await fxRes.json();
      const rate = fxData?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];
      if (rate) usdJpy = parseFloat(rate);
    } catch { /* ignore */ }
  }

  for (const symbol of symbols) {
    try {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await res.json();

      // レート制限チェック
      if (data.Note || data.Information) {
        failed.push(symbol);
        break; // 制限到達で中断
      }

      const quote = data["Global Quote"];
      if (!quote || !quote["05. price"]) {
        failed.push(symbol);
        continue;
      }

      const price = parseFloat(quote["05. price"]);
      const changePercent = parseFloat((quote["10. change percent"] || "0").replace("%", ""));

      const stockInfo = (stocks || []).find((s) => s.symbol === symbol);
      const priceJpy = stockInfo?.currency === "USD" && usdJpy ? Math.round(price * usdJpy) : price;

      const { error } = await supabase
        .from("otetsudai_stock_prices")
        .update({
          price,
          price_jpy: priceJpy,
          change_percent: changePercent,
          updated_at: new Date().toISOString(),
        })
        .eq("symbol", symbol);

      if (error) {
        failed.push(symbol);
      } else {
        updated.push(symbol);
      }
    } catch {
      failed.push(symbol);
    }
  }

  return NextResponse.json({ updated, failed, usd_jpy: usdJpy });
}
