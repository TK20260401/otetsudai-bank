"use client";

import Link from "next/link";
import { R } from "@/components/ruby-text";
import PixelHeroSvg from "@/components/pixel-hero-svg";
import RpgButton from "@/components/rpg-button";
import RpgCard from "@/components/rpg-card";
import { PixelCoinIcon, PixelPiggyIcon, PixelSeedlingIcon, PixelFlameIcon, PixelCrossedSwordsIcon } from "@/components/pixel-icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="mb-4 flex justify-center gap-2"><PixelHeroSvg type="warrior" size={56} /><PixelHeroSvg type="mage" size={56} /></div>
          <h1 className="text-4xl font-extrabold text-primary mb-2 drop-shadow-[0_2px_8px_rgba(255,166,35,0.4)]">
            おこづかいクエスト
          </h1>
          <p className="text-lg text-accent mb-1">
            クエストをクリアして コインを <R k="稼" r="かせ" />ごう！
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            お<R k="手伝" r="てつだ" />い＝クエスト！<R k="稼" r="かせ" />いで、<R k="貯" r="た" />めて、<R k="増" r="ふ" />やすマネー<R k="冒険" r="ぼうけん" />アプリ
          </p>

          {/* UD対応：大きなボタン + アイコン + カラーで意味を伝える */}
          <div className="flex flex-col gap-4 justify-center mb-10">
            <Link href="/login">
              <RpgButton tier="gold" size="lg" fullWidth ariaLabel="ログイン">
                <span className="text-2xl" aria-hidden="true">🔑</span>
                <span className="text-lg">ログイン</span>
              </RpgButton>
            </Link>
          </div>

          {/* UD対応フィーチャーカード：赤・青・緑の3色でSpend/Save/Investを視覚的に表現 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <RpgCard tier="gold" variant="compact">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#e74c3c] flex items-center justify-center shadow-[0_0_10px_rgba(231,76,60,0.5)]" aria-hidden="true"><PixelCoinIcon size={20} /></div>
                <h3 className="font-bold text-[#ff6b6b]"><R k="使" r="つか" />う</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                <R k="稼" r="かせ" />いだコインで <R k="好" r="す" />きなものを <R k="買" r="か" />おう！
              </p>
            </RpgCard>
            <RpgCard tier="silver" variant="compact">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#3498db] flex items-center justify-center shadow-[0_0_10px_rgba(52,152,219,0.5)]" aria-hidden="true"><PixelPiggyIcon size={20} /></div>
                <h3 className="font-bold text-[#5dade2]"><R k="貯" r="た" />める</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                <R k="貯金" r="ちょきん" />して <R k="大" r="おお" />きな <R k="夢" r="ゆめ" />を <R k="叶" r="かな" />えよう！
              </p>
            </RpgCard>
            <RpgCard tier="violet" variant="compact">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#2ecc71] flex items-center justify-center shadow-[0_0_10px_rgba(46,204,113,0.5)]" aria-hidden="true"><PixelSeedlingIcon size={20} /></div>
                <h3 className="font-bold text-[#58d68d]"><R k="増" r="ふ" />やす</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                コインを<R k="育" r="そだ" />てて もっと <R k="増" r="ふ" />やそう！
              </p>
            </RpgCard>
          </div>

          {/* 追加機能訴求 */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="bg-card rounded-xl p-3 border border-primary/40">
              <div className="mb-1 flex justify-center"><PixelFlameIcon size={24} /></div>
              <p className="text-xs font-bold text-primary"><R k="連続" r="れんぞく" />ストリーク</p>
              <p className="text-[10px] text-muted-foreground"><R k="毎日" r="まいにち" /><R k="続" r="つづ" />けると<R k="記録" r="きろく" />が<R k="増" r="ふ" />える！</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-ring/40">
              <div className="mb-1 flex justify-center"><PixelCrossedSwordsIcon size={24} /></div>
              <p className="text-xs font-bold text-ring">レベルアップ</p>
              <p className="text-[10px] text-muted-foreground">クエストで<R k="強" r="つよ" />くなろう！</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-accent/40">
              <div className="text-2xl mb-1">🏅</div>
              <p className="text-xs font-bold text-accent"><R k="装備" r="そうび" />コレクション</p>
              <p className="text-[10px] text-muted-foreground">バッジを<R k="集" r="あつ" />めよう！</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground space-x-4">
        <a href="/terms" className="hover:underline">利用規約</a>
        <a href="/privacy" className="hover:underline">プライバシーポリシー</a>
      </footer>
    </div>
  );
}
