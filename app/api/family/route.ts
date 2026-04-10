import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 家族データの完全削除（開発用）
 * カスケード順に全テーブルからデータを削除する
 */
export async function DELETE(request: Request) {
  const { family_id } = await request.json();

  if (!family_id) {
    return NextResponse.json({ error: "family_id is required" }, { status: 400 });
  }

  // 家族に属するユーザーIDを取得
  const { data: users } = await supabaseAdmin
    .from("otetsudai_users")
    .select("id")
    .eq("family_id", family_id);
  const userIds = (users || []).map((u: { id: string }) => u.id);

  if (userIds.length === 0) {
    // ユーザーがいなくても家族レコードは削除
    await supabaseAdmin.from("otetsudai_families").delete().eq("id", family_id);
    return NextResponse.json({ success: true });
  }

  // ウォレットIDを取得（トランザクション削除用）
  const { data: wallets } = await supabaseAdmin
    .from("otetsudai_wallets")
    .select("id")
    .in("child_id", userIds);
  const walletIds = (wallets || []).map((w: { id: string }) => w.id);

  const errors: string[] = [];

  // カスケード順に削除
  const deleteSteps: { table: string; filter: { col: string; values: string[] } }[] = [
    // トランザクション（wallet_id）
    ...(walletIds.length > 0
      ? [{ table: "otetsudai_transactions", filter: { col: "wallet_id", values: walletIds } }]
      : []),
    // 投資関連（child_id）
    { table: "otetsudai_invest_orders", filter: { col: "child_id", values: userIds } },
    // 支出申請（child_id）
    { table: "otetsudai_spend_requests", filter: { col: "child_id", values: userIds } },
    // ウォレット（child_id）
    { table: "otetsudai_wallets", filter: { col: "child_id", values: userIds } },
    // タスクログ（child_id）
    { table: "otetsudai_task_logs", filter: { col: "child_id", values: userIds } },
    // バッジ（child_id）
    { table: "otetsudai_badges", filter: { col: "child_id", values: userIds } },
    // 貯金目標（child_id）
    { table: "otetsudai_saving_goals", filter: { col: "child_id", values: userIds } },
    // メッセージ（family_id）
    { table: "otetsudai_messages", filter: { col: "family_id", values: [family_id] } },
    // タスク（family_id）
    { table: "otetsudai_tasks", filter: { col: "family_id", values: [family_id] } },
  ];

  for (const step of deleteSteps) {
    const { error } = await supabaseAdmin
      .from(step.table)
      .delete()
      .in(step.filter.col, step.filter.values);
    if (error) {
      errors.push(`${step.table}: ${error.message}`);
      console.error(`[family-delete] ${step.table} error:`, error.message);
    }
  }

  // Supabase Auth ユーザー削除
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // auth_idを持つユーザーを検索
    for (const userId of userIds) {
      const { data: user } = await supabaseAdmin
        .from("otetsudai_users")
        .select("auth_id")
        .eq("id", userId)
        .single();
      if (user?.auth_id) {
        const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(user.auth_id);
        if (authErr) {
          errors.push(`auth.users(${user.auth_id}): ${authErr.message}`);
          console.error(`[family-delete] auth user error:`, authErr.message);
        }
      }
    }
  }

  // ユーザー削除
  const { error: userError } = await supabaseAdmin
    .from("otetsudai_users")
    .delete()
    .eq("family_id", family_id);
  if (userError) {
    errors.push(`otetsudai_users: ${userError.message}`);
  }

  // 家族削除
  const { error: familyError } = await supabaseAdmin
    .from("otetsudai_families")
    .delete()
    .eq("id", family_id);
  if (familyError) {
    errors.push(`otetsudai_families: ${familyError.message}`);
  }

  if (errors.length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 207 });
  }

  return NextResponse.json({ success: true });
}
