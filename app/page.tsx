"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default function LandingPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      // ログイン済み → ロールに応じてリダイレクト
      if (session.role === "parent") {
        router.replace("/parent");
        return;
      }
      if (session.role === "child") {
        router.replace(`/child/${session.userId}`);
        return;
      }
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">読み込み中...</div>
      </div>
    );
  }

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
            クエストをクリアして コインを かせごう！
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            お手伝い＝クエスト！稼いで、貯めて、増やすマネー冒険アプリ
          </p>

          {/* UD対応：大きなボタン + アイコン + カラーで意味を伝える */}
          <div className="flex flex-col gap-4 justify-center mb-10">
            <Link href="/signup">
              <button
                className="w-full px-8 py-5 rounded-2xl text-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                aria-label="新規登録 - ぼうけんをはじめる"
              >
                <span className="text-3xl" aria-hidden="true">⚔️</span>
                <span>あたらしく はじめる</span>
              </button>
            </Link>
            <Link href="/login">
              <button
                className="w-full px-8 py-5 rounded-2xl text-xl font-bold border-3 border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
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
                <h3 className="font-bold text-red-700">つかう</h3>
              </div>
              <p className="text-xs text-red-600/80">
                かせいだコインで すきなものを かおう！
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl" aria-hidden="true">🐷</div>
                <h3 className="font-bold text-blue-700">ためる</h3>
              </div>
              <p className="text-xs text-blue-600/80">
                ちょきんして おおきな ゆめを かなえよう！
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl" aria-hidden="true">🌱</div>
                <h3 className="font-bold text-green-700">ふやす</h3>
              </div>
              <p className="text-xs text-green-600/80">
                コインをそだてて もっと ふやそう！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground space-x-2">
        <Link href="/help" className="hover:text-emerald-600">📖 つかいかた</Link>
        <span>|</span>
        <Link href="/privacy" className="hover:text-emerald-600">プライバシーポリシー</Link>
        <span>|</span>
        <Link href="/terms" className="hover:text-emerald-600">利用規約</Link>
        <span>|</span>
        おこづかいクエスト v0.5
      </footer>
    </div>
  );
}
