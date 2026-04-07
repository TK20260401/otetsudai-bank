import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="text-7xl mb-4">🏦</div>
          <h1 className="text-4xl font-extrabold text-amber-800 mb-2">
            おてつだいバンク
          </h1>
          <p className="text-lg text-amber-700 mb-1">
            おてつだいで コインを ためよう！
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            お手伝い × マネー教育アプリ — 日本の家庭のための BusyKid
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/signup">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition-all hover:scale-105">
                ✨ はじめる
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-all">
                🔑 ログイン
              </button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white/80 rounded-xl p-4 border border-amber-100 shadow-sm">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-bold text-amber-800 mb-1">おてつだいリスト</h3>
              <p className="text-xs text-muted-foreground">
                お手伝いごとにごほうびを設定。毎日・毎週のくりかえしもOK
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-amber-100 shadow-sm">
              <div className="text-3xl mb-2">🐷</div>
              <h3 className="font-bold text-amber-800 mb-1">ちょきんばこ</h3>
              <p className="text-xs text-muted-foreground">
                かせいだコインを「つかえるお金」と「ちょきん」に自動分割
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-amber-100 shadow-sm">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-bold text-amber-800 mb-1">おやが承認</h3>
              <p className="text-xs text-muted-foreground">
                おてつだい完了もお金をつかうのも、おやの承認があってはじめてOK
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        <Link href="/help" className="hover:text-amber-600">📖 つかいかた</Link>
        <span className="mx-2">|</span>
        おてつだいバンク v0.2
      </footer>
    </div>
  );
}
