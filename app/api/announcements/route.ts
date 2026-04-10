import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** セッションからadminロールを検証 */
async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const body = await request.clone().json().catch(() => ({}));
  const sessionUserId = body._sessionUserId;
  if (!sessionUserId) return null;
  const { data } = await supabaseAdmin
    .from("otetsudai_users")
    .select("id, role")
    .eq("id", sessionUserId)
    .eq("role", "admin")
    .single();
  return data?.id || null;
}

/** GET: アクティブなお知らせ取得 */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("otetsudai_announcements")
    .select("*")
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/** POST: お知らせ新規作成（admin専用） */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const adminId = body._sessionUserId;

  // admin検証
  if (!adminId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const { data: admin } = await supabaseAdmin
    .from("otetsudai_users")
    .select("id")
    .eq("id", adminId)
    .eq("role", "admin")
    .single();
  if (!admin) {
    return NextResponse.json({ error: "管理者権限がありません" }, { status: 403 });
  }

  const { title, body: announcementBody, target_role, priority, expires_at } = body;

  if (!title || !announcementBody || !target_role) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("otetsudai_announcements")
    .insert({
      title,
      body: announcementBody,
      target_role,
      priority: priority || "normal",
      expires_at: expires_at || null,
      created_by: adminId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/** PATCH: お知らせ更新（admin専用） */
export async function PATCH(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "管理者権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  delete updates._sessionUserId;

  if (!id) {
    return NextResponse.json({ error: "idが必要です" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("otetsudai_announcements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/** DELETE: お知らせ削除（admin専用） */
export async function DELETE(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "管理者権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "idが必要です" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("otetsudai_announcements")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
