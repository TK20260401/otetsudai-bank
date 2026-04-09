"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Portfolio = {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  buy_price: number;
  current_price: number | null;
  current_value: number;
  updated_at: string;
};

type Props = {
  childId: string;
  investBalance: number;
};

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5分

export function InvestPortfolio({ childId, investBalance }: Props) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cooldownRemain, setCooldownRemain] = useState(0);

  useEffect(() => {
    loadPortfolios();
  }, [childId]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemain <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemain((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemain]);

  async function loadPortfolios() {
    const { data } = await supabase
      .from("otetsudai_invest_portfolios")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    if (data) {
      setPortfolios(data);
      if (data.length > 0 && data[0].updated_at) {
        setLastSync(data[0].updated_at);
      }
    }
  }

  async function handleSync() {
    // Cooldown check
    if (lastSync) {
      const elapsed = Date.now() - new Date(lastSync).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) {
        const remain = SYNC_COOLDOWN_MS - elapsed;
        setCooldownRemain(remain);
        setSyncMessage({
          type: "error",
          text: `あと ${Math.ceil(remain / 60000)}ぷんで こうしん できます`,
        });
        return;
      }
    }

    setSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch("/api/stock-sync", { cache: "no-store" });
      if (!res.ok) {
        setSyncMessage({
          type: "error",
          text: "⚠️ こうしん しっぱい。もういちど ためしてね",
        });
        setSyncing(false);
        return;
      }
      const data = await res.json();

      if (data) {
        await loadPortfolios();
        setSyncMessage({
          type: "success",
          text: `✅ さいしん かかく に こうしん！（${data.count || 0}めいがら）`,
        });
        setLastSync(new Date().toISOString());
        setCooldownRemain(SYNC_COOLDOWN_MS);
      } else {
        setSyncMessage({
          type: "error",
          text: `⚠️ こうしん しっぱい: ${data.error || "もういちど ためしてね"}`,
        });
      }
    } catch {
      setSyncMessage({
        type: "error",
        text: "⚠️ かかくの こうしん に しっぱい しました",
      });
    } finally {
      setSyncing(false);
    }
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (!syncMessage) return;
    const timer = setTimeout(() => setSyncMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [syncMessage]);

  function calcGainLoss(p: Portfolio): { amount: number; percent: string; isUp: boolean } {
    if (!p.current_price) return { amount: 0, percent: "0.00%", isUp: true };
    const gain = (p.current_price - p.buy_price) * p.shares;
    const percent = ((p.current_price - p.buy_price) / p.buy_price * 100).toFixed(2);
    return { amount: Math.floor(gain), percent: `${percent}%`, isUp: gain >= 0 };
  }

  const isCoolingDown = cooldownRemain > 0;

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>🌱 とうしポートフォリオ</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-green-600 disabled:opacity-50"
            onClick={handleSync}
            disabled={syncing || isCoolingDown}
          >
            {syncing ? (
              <span className="animate-pulse">こうしん ちゅう...</span>
            ) : isCoolingDown ? (
              `⏳ あと${Math.ceil(cooldownRemain / 60000)}ぷん`
            ) : (
              "🔄 さいしんかかく"
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 同期メッセージ */}
        {syncMessage && (
          <div
            className={`text-xs text-center p-2 rounded-lg mb-3 ${
              syncMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {syncMessage.text}
          </div>
        )}

        {/* 総評価額 */}
        <div className="bg-green-50 rounded-xl p-3 mb-3 text-center border border-green-100">
          <p className="text-xs text-green-600 font-semibold">ふやすウォレット</p>
          <p className="text-2xl font-bold text-green-700">
            ¥{investBalance.toLocaleString()}
          </p>
          {lastSync && (
            <p className="text-[10px] text-muted-foreground mt-1">
              さいしゅうこうしん: {new Date(lastSync).toLocaleString("ja-JP")}
            </p>
          )}
        </div>

        {/* ポートフォリオ一覧 */}
        {portfolios.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            まだ とうしは ありません。
            <br />
            「かぶを かいたい！」ボタンで はじめよう！
          </p>
        ) : (
          <div className="space-y-2">
            {portfolios.map((p) => {
              const { amount, percent, isUp } = calcGainLoss(p);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-green-100"
                >
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.symbol} ・ {p.shares.toFixed(2)}かぶ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      ¥{(p.current_value || 0).toLocaleString()}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        isUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isUp ? "📈" : "📉"} ¥{Math.abs(amount).toLocaleString()} ({percent})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
