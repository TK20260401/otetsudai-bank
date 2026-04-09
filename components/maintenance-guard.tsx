"use client";

/**
 * メンテナンスモードガード
 *
 * 環境変数 NEXT_PUBLIC_MAINTENANCE_MODE=true のとき、
 * 全ページをメンテナンス画面に差し替える。
 * Vercel の環境変数で切り替え可能。
 */
export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const isMaintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (!isMaintenanceMode) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-2xl font-bold text-amber-800 mb-3">
          メンテナンスちゅう
        </h1>
        <p className="text-base text-amber-700 mb-6 leading-relaxed">
          いま、おこづかいクエストを
          <br />
          パワーアップしています！
          <br />
          もうすこしまってね。
        </p>
        <div className="bg-white/60 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-muted-foreground">
            🛡️ データはすべてあんぜんです
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            メンテナンスがおわったら、またあそべるようになります
          </p>
        </div>
      </div>
    </div>
  );
}
