import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /auth/confirm
 * Supabase メール認証コールバック
 * メール内リンクから token_hash + type を受け取り、認証を完了させる
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "email" | "recovery" | null;
  const redirectTo = new URL("/login", request.url);

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error) {
      // 認証成功 → ログイン画面へ（成功メッセージ付き）
      redirectTo.searchParams.set("verified", "true");
      return NextResponse.redirect(redirectTo);
    }
  }

  // 認証失敗 → ログイン画面へ（エラーメッセージ付き）
  redirectTo.searchParams.set("verified", "error");
  return NextResponse.redirect(redirectTo);
}
