import Link from "next/link";

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
            クエストをクリアして コインを かせごう！
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            お手伝い＝クエスト！稼いで、貯めて、増やすマネー冒険アプリ
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/signup">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:scale-105">
                ⚔️ ぼうけんをはじめる
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all">
                🔑 ログイン
              </button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white/80 rounded-xl p-4 border border-emerald-100 shadow-sm">
              <div className="text-3xl mb-2">⚔️</div>
              <h3 className="font-bold text-emerald-800 mb-1">クエスト</h3>
              <p className="text-xs text-muted-foreground">
                おてつだい＝クエスト。クリアするとごほうびコインがもらえる！
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-amber-100 shadow-sm">
              <div className="text-3xl mb-2">🐷</div>
              <h3 className="font-bold text-amber-800 mb-1">ちょきんばこ</h3>
              <p className="text-xs text-muted-foreground">
                かせいだコインを「つかえるお金」と「ちょきん」に自動分割
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-violet-100 shadow-sm">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-bold text-violet-800 mb-1">バッジ</h3>
              <p className="text-xs text-muted-foreground">
                クエストをこなしてバッジを集めよう。めざせクエストマスター！
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
        おこづかいクエスト v0.4
      </footer>
    </div>
  );
}
