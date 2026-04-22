"use client";

import Link from "next/link";
import { R } from "@/components/ruby-text";
import PixelHeroSvg from "@/components/pixel-hero-svg";
import RpgButton from "@/components/rpg-button";
import RpgCard from "@/components/rpg-card";
import { PixelCoinIcon, PixelPiggyIcon, PixelSeedlingIcon, PixelKeyIcon } from "@/components/pixel-icons";

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

          {/* CTA: モバイル LandingScreen と統一。リロード・ブラウザバック時もこの画面が戻り先 */}
          <div className="flex flex-col gap-4 justify-center mb-6">
            <Link href="/login">
              <RpgButton tier="gold" size="lg" fullWidth ariaLabel="クエストをはじめる">
                <PixelKeyIcon size={22} />
                <span className="text-lg">クエストをはじめる！</span>
              </RpgButton>
            </Link>
          </div>

          {/* 3分割ウォレット：使う / 貯める / 増やす — 赤・青・緑の3色で直感訴求 */}
          <div className="grid grid-cols-3 gap-2 text-left">
            <RpgCard tier="gold" variant="compact">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#e74c3c] flex items-center justify-center shadow-[0_0_10px_rgba(231,76,60,0.5)]" aria-hidden="true"><PixelCoinIcon size={16} /></div>
                <h3 className="font-bold text-[#ff6b6b] text-sm"><R k="使" r="つか" />う</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                <R k="物" r="もの" />を <R k="買" r="か" />う
              </p>
            </RpgCard>
            <RpgCard tier="silver" variant="compact">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#3498db] flex items-center justify-center shadow-[0_0_10px_rgba(52,152,219,0.5)]" aria-hidden="true"><PixelPiggyIcon size={16} /></div>
                <h3 className="font-bold text-[#5dade2] text-sm"><R k="貯" r="た" />める</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                <R k="夢" r="ゆめ" />を <R k="叶" r="かな" />える
              </p>
            </RpgCard>
            <RpgCard tier="violet" variant="compact">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#2ecc71] flex items-center justify-center shadow-[0_0_10px_rgba(46,204,113,0.5)]" aria-hidden="true"><PixelSeedlingIcon size={16} /></div>
                <h3 className="font-bold text-[#58d68d] text-sm"><R k="増" r="ふ" />やす</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                お<R k="金" r="かね" />が<R k="育" r="そだ" />つ
              </p>
            </RpgCard>
          </div>

        </div>
      </section>
      <footer className="text-center text-[9px] text-muted-foreground/70 pb-4">
        CC BY-NC-SA 4.0 Snafty inc.
      </footer>
    </div>
  );
}
