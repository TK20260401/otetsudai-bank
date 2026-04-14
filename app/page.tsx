"use client";

import Link from "next/link";
import { R } from "@/components/ruby-text";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="text-7xl mb-4">⚔️</div>
          <h1 className="text-4xl font-extrabold text-emerald-800 mb-2">
            おこづかいクエスト
          </h1>
          <p className="text-lg text-emerald-700 mb-1">
            クエストをクリアして コインを <R k="稼" r="かせ" />ごう！
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            お<R k="手伝" r="てつだ" />い＝クエスト！<R k="稼" r="かせ" />いで、<R k="貯" r="た" />めて、<R k="増" r="ふ" />やすマネー<R k="冒険" r="ぼうけん" />アプリ
          </p>

          {/* UD対応：大きなボタン + アイコン + カラーで意味を伝える */}
          <div className="flex flex-col gap-4 justify-center mb-10">
            <Link href="/login">
              <button
                className="w-full px-8 py-5 rounded-2xl text-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                aria-label="ログイン"
              >
                <span className="text-3xl" aria-hidden="true">🔑</span>
                <span>ログイン</span>
              </button>
            </Link>
          </div>

          {/* UD対応フィーチャーカード：赤・青・緑の3色でSpend/Save/Investを視覚的に表現 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-xl" aria-hidden="true">💰</div>
                <h3 className="font-bold text-red-700"><R k="使" r="つか" />う</h3>
              </div>
              <p className="text-xs text-red-600/80">
                <R k="稼" r="かせ" />いだコインで <R k="好" r="す" />きなものを <R k="買" r="か" />おう！
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl" aria-hidden="true">🐷</div>
                <h3 className="font-bold text-blue-700"><R k="貯" r="た" />める</h3>
              </div>
              <p className="text-xs text-blue-600/80">
                <R k="貯金" r="ちょきん" />して <R k="大" r="おお" />きな <R k="夢" r="ゆめ" />を <R k="叶" r="かな" />えよう！
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl" aria-hidden="true">🌱</div>
                <h3 className="font-bold text-green-700"><R k="増" r="ふ" />やす</h3>
              </div>
              <p className="text-xs text-green-600/80">
                コインを<R k="育" r="そだ" />てて もっと <R k="増" r="ふ" />やそう！
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
