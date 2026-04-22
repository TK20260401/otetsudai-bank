import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function DELETE(request: Request) {
  const { family_id, auth_id } = await request.json();

  if (!family_id) {
    return NextResponse.json({ error: "family_id is required" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Soft delete family
  const { error: deleteError } = await supabaseAdmin.rpc("soft_delete_family", {
    p_family_id: family_id,
  });

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  // Supabase Auth ユーザー削除
  if (auth_id) {
    await supabaseAdmin.auth.admin.deleteUser(auth_id);
  }

  return NextResponse.json({ success: true });
}
