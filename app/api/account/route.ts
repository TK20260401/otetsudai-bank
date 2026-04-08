import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(request: Request) {
  const { family_id, auth_id } = await request.json();

  if (!family_id) {
    return NextResponse.json({ error: "family_id is required" }, { status: 400 });
  }

  // Soft delete family
  const { error: deleteError } = await supabaseAdmin.rpc("soft_delete_family", {
    p_family_id: family_id,
  });

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  // Supabase Auth ユーザー削除（service role keyが必要）
  if (auth_id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await supabaseAdmin.auth.admin.deleteUser(auth_id);
  }

  return NextResponse.json({ success: true });
}
