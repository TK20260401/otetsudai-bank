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

export function InvestPortfolio({ childId, investBalance }: Props) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolios();
  }, [childId]);

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
    setSyncing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stock-sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        await loadPortfolios();
      }
    } catch {
      // Edge Function未デプロイ時はサイレント
    } finally {
      setSyncing(false);
    }
  }

  function calcGainLoss(p: Portfolio): { amount: number; percent: string; isUp: boolean } {
    if (!p.current_price) return { amount: 0, percent: "0.00%", isUp: true };
    const gain = (p.current_price - p.buy_price) * p.shares;
    const percent = ((p.current_price - p.buy_price) / p.buy_price * 100).toFixed(2);
    return { amount: Math.floor(gain), percent: `${percent}%`, isUp: gain >= 0 };
  }

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>🌱 とうしポートフォリオ</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-green-600"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? "こうしんちゅう..." : "🔄 さいしんかかく"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            まだとうしはありません。
            <br />
            おやがせっていすると、ここにひょうじされます。
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
                      {p.symbol} ・ {p.shares}かぶ
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
                      {isUp ? "▲" : "▼"} ¥{Math.abs(amount).toLocaleString()} ({percent})
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
