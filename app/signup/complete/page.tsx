"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignupCompletePage() {
  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");

  useEffect(() => {
    try {
      const session = localStorage.getItem("otetsudai_session");
      if (session) {
        const parsed = JSON.parse(session);
        setParentName(parsed.name || "");
      }
      const signupInfo = sessionStorage.getItem("signup_info");
      if (signupInfo) {
        const parsed = JSON.parse(signupInfo);
        setFamilyName(parsed.familyName || "");
        sessionStorage.removeItem("signup_info");
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-emerald-50 to-amber-50">
      <Card className="w-full max-w-md shadow-xl border-emerald-300">
        <CardHeader className="text-center">
          <div className="text-6xl mb-3">🎉</div>
          <CardTitle className="text-2xl font-bold text-emerald-800">
            登録かんりょう！
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 登録サマリー */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-2">
            {familyName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">おうちの名前</span>
                <span className="font-semibold text-emerald-700">{familyName}</span>
              </div>
            )}
            {parentName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">保護者</span>
                <span className="font-semibold text-emerald-700">{parentName}</span>
              </div>
            )}
          </div>

          {/* メール認証案内 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  確認メールを送信しました
                </p>
                <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                  ご登録のメールアドレスに確認メールを送信しました。
                  メール内のリンクをクリックして、アカウントを有効化してください。
                </p>
              </div>
            </div>
          </div>

          {/* セキュリティ説明 */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs text-muted-foreground leading-relaxed">
              🔒 メール認証は、あなたのアカウントを守るための標準的なセキュリティ機能です。
              第三者による不正な登録を防ぎます。
            </p>
          </div>

          {/* アクションボタン */}
          <div className="space-y-2">
            <Link href="/login" className="block">
              <Button className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                ログインへすすむ
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              メール認証がまだの場合も、一部の機能はお試しいただけます
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
