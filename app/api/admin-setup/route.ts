import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * POST /api/admin-setup
 * 管理者アカウント初期セットアップ（1回限り使用）
 */
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const email = "admin@snafty.io";
  const password = "20260410@snafty";

  // 既存チェック
  const { data: existing } = await supabase
    .from("otetsudai_users")
    .select("id")
    .eq("role", "admin")
    .single();

  if (existing) {
    return NextResponse.json({ error: "管理者は既に存在します" }, { status: 400 });
  }

  // Supabase Auth でユーザー作成（GoTrue経由で正規のハッシュ生成）
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || "Auth登録失敗" }, { status: 500 });
  }

  // otetsudai_usersにadminレコード作成
  const { data: adminUser, error: userError } = await supabase
    .from("otetsudai_users")
    .insert({
      family_id: null,
      role: "admin",
      name: "システム管理者",
      auth_id: authData.user.id,
    })
    .select()
    .single();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "管理者アカウント作成完了",
    userId: adminUser.id,
    authId: authData.user.id,
    email,
  });
}
