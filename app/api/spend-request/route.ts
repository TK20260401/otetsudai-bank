import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 支出申請を作成
export async function POST(request: Request) {
  const { child_id, wallet_id, amount, purpose } = await request.json();

  if (!child_id || !wallet_id || !amount || !purpose) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  // 残高チェック
  const { data: wallet } = await supabase
    .from("otetsudai_wallets")
    .select("spending_balance")
    .eq("id", wallet_id)
    .single();

  if (!wallet || wallet.spending_balance < amount) {
    return NextResponse.json({ error: "残高が足りません" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("otetsudai_spend_requests")
    .insert({ child_id, wallet_id, amount, purpose, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// 承認・却下
export async function PUT(request: Request) {
  const { id, action, approved_by, reject_reason, payment_method } = await request.json();

  if (action === "approve") {
    // 申請情報取得
    const { data: req } = await supabase
      .from("otetsudai_spend_requests")
      .select("*")
      .eq("id", id)
      .single();
    if (!req) return NextResponse.json({ error: "申請が見つかりません" }, { status: 404 });

    // ウォレット残高を減算
    const { data: wallet } = await supabase
      .from("otetsudai_wallets")
      .select("*")
      .eq("id", req.wallet_id)
      .single();
    if (!wallet || wallet.spending_balance < req.amount) {
      return NextResponse.json({ error: "残高が足りません" }, { status: 400 });
    }

    await supabase
      .from("otetsudai_wallets")
      .update({ spending_balance: wallet.spending_balance - req.amount })
      .eq("id", wallet.id);

    // トランザクション記録
    await supabase.from("otetsudai_transactions").insert({
      wallet_id: wallet.id,
      type: "spend",
      amount: req.amount,
      description: req.purpose,
    });

    // 申請ステータス更新（承認→送金待ち）
    await supabase
      .from("otetsudai_spend_requests")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by,
        payment_status: "pending_payment",
      })
      .eq("id", id);

    return NextResponse.json({ success: true });
  }

  if (action === "reject") {
    await supabase
      .from("otetsudai_spend_requests")
      .update({ status: "rejected", reject_reason: reject_reason || null })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  // 送金完了記録
  if (action === "mark_paid") {
    await supabase
      .from("otetsudai_spend_requests")
      .update({
        payment_status: "paid",
        payment_method: payment_method || "other",
        paid_at: new Date().toISOString(),
      })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "無効なアクション" }, { status: 400 });
}
