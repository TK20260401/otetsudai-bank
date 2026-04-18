"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { PixelShieldIcon, PixelRefreshIcon } from "@/components/pixel-icons";

type MaintenanceData = {
  enabled: boolean;
  message: string;
  scheduled_end: string | null;
};

const CACHE_KEY = "maintenance_check";
const CACHE_TTL = 30_000; // 30秒

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [maintenance, setMaintenance] = useState<MaintenanceData | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // /admin ページではチェックしない
    if (pathname?.startsWith("/admin")) {
      setChecked(true);
      return;
    }

    const session = getSession();
    // adminは常にアクセス可
    if (session?.role === "admin") {
      setChecked(true);
      return;
    }

    // キャッシュチェック
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          if (data?.enabled) setMaintenance(data);
          setChecked(true);
          return;
        }
      }
    } catch { /* ignore */ }

    // APIチェック
    fetch("/api/settings?key=maintenance_mode")
      .then((r) => r.json())
      .then((res) => {
        const data = res.value as MaintenanceData;
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        if (data?.enabled) setMaintenance(data);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [pathname]);

  if (!checked) return null;

  if (maintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-slate-700 mb-3">
            メンテナンスちゅう
          </h1>
          <p className="text-base text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
            {maintenance.message}
          </p>
          {maintenance.scheduled_end && (
            <p className="text-sm text-slate-400 mb-4">
              終了予定: {new Date(maintenance.scheduled_end).toLocaleString("ja-JP", {
                month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
              })}ごろ
            </p>
          )}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><PixelShieldIcon size={14} /> データはすべてあんぜんです</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              メンテナンスがおわったら、またあそべるようになります
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300"
            onClick={() => {
              sessionStorage.removeItem(CACHE_KEY);
              window.location.reload();
            }}
          >
            <span className="flex items-center gap-1"><PixelRefreshIcon size={14} /> さいどくみこみ</span>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
