"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RpgCard from "@/components/rpg-card";
import RpgButton from "@/components/rpg-button";
import { PixelConfettiIcon } from "@/components/pixel-icons";

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
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md">
        <RpgCard
          tier="gold"
          title={
            <span className="flex items-center justify-center gap-2 w-full">
              <PixelConfettiIcon size={20} />
              登録かんりょう！
            </span>
          }
        >
          <div className="space-y-5">
            {/* 登録サマリー */}
            <div className="bg-secondary/60 rounded-xl p-4 border border-primary/40 space-y-2">
              {familyName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">おうちの名前</span>
                  <span className="font-semibold text-primary">{familyName}</span>
                </div>
              )}
              {parentName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">保護者</span>
                  <span className="font-semibold text-primary">{parentName}</span>
                </div>
              )}
            </div>

            {/* メール認証案内 */}
            <div className="bg-secondary/60 rounded-xl p-4 border border-[#3498db]/40">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm font-semibold text-[#5dade2]">
                    確認メールを送信しました
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    ご登録のメールアドレスに確認メールを送信しました。
                    メール内のリンクをクリックして、アカウントを有効化してください。
                  </p>
                </div>
              </div>
            </div>

            {/* セキュリティ説明 */}
            <div className="bg-muted rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                🔒 メール認証は、あなたのアカウントを守るための標準的なセキュリティ機能です。
                第三者による不正な登録を防ぎます。
              </p>
            </div>

            {/* アクションボタン */}
            <div className="space-y-2">
              <Link href="/login" className="block">
                <RpgButton tier="gold" size="lg" fullWidth>
                  ログインへすすむ
                </RpgButton>
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                メール認証がまだの場合も、一部の機能はお試しいただけます
              </p>
            </div>
          </div>
        </RpgCard>
      </div>
    </div>
  );
}
