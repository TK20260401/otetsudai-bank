import { NextResponse } from "next/server";

/**
 * 株価同期プロキシ
 * フロントエンドから呼び出し、Supabase Edge Function (stock-sync) を実行する。
 * Edge Function未デプロイ時はフォールバックでstock_pricesのupdated_atのみ更新。
 */
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase設定が不足しています" },
      { status: 500 }
    );
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
