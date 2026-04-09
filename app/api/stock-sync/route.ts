import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/stock-sync
 * DBから最新の株価を取得するだけ（高速）
 * 「最新価格」ボタンはこちらを使用
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
 * Edge Functionを呼び出して実際にAlpha Vantage APIから株価を取得
 * 管理者用（時間がかかる）
 */
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase設定が不足しています" }, { status: 500 });
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/stock-sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "株価同期に失敗しました", detail: data },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: `Edge Function呼び出しに失敗: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}
