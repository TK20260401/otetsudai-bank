import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** GET: 設定値取得 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("otetsudai_settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/** PATCH: 設定値更新（admin専用） */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { key, value, _sessionUserId } = body;

  if (!key || value === undefined || !_sessionUserId) {
    return NextResponse.json({ error: "key, value, _sessionUserId are required" }, { status: 400 });
  }

  // admin検証
  const { data: admin } = await supabaseAdmin
    .from("otetsudai_users")
    .select("id")
    .eq("id", _sessionUserId)
    .eq("role", "admin")
    .single();

  if (!admin) {
    return NextResponse.json({ error: "管理者権限がありません" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("otetsudai_settings")
    .update({ value, updated_at: new Date().toISOString(), updated_by: _sessionUserId })
    .eq("key", key)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
