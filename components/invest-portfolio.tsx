"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { R } from "@/components/ruby-text";

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
          text: `あと ${Math.ceil(remain / 60000)}分で 更新 できます`,
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
          text: "⚠️ 更新 失敗。もう一度 試してね",
        });
        setSyncing(false);
        return;
      }
      const data = await res.json();

      if (data) {
        await loadPortfolios();
        setSyncMessage({
          type: "success",
          text: `✅ 最新 価格 に 更新！（${data.count || 0}銘柄）`,
        });
        setLastSync(new Date().toISOString());
        setCooldownRemain(SYNC_COOLDOWN_MS);
      } else {
        setSyncMessage({
          type: "error",
          text: `⚠️ 更新 失敗: ${data.error || "もう一度 試してね"}`,
        });
      }
    } catch {
      setSyncMessage({
        type: "error",
        text: "⚠️ 価格の 更新 に 失敗 しました",
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
          <span>🌱 <R k="投資" r="とうし" />ポートフォリオ</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-green-600 disabled:opacity-50"
            onClick={handleSync}
            disabled={syncing || isCoolingDown}
          >
            {syncing ? (
              <span className="animate-pulse"><R k="更新" r="こうしん" /> <R k="中" r="ちゅう" />...</span>
            ) : isCoolingDown ? (
              `⏳ あと${Math.ceil(cooldownRemain / 60000)}分`
            ) : (
              <>🔄 <R k="最新" r="さいしん" /><R k="価格" r="かかく" /></>
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
          <p className="text-xs text-green-600 font-semibold"><R k="増" r="ふ" />やすウォレット</p>
          <p className="text-2xl font-bold text-green-700">
            ¥{investBalance.toLocaleString()}
          </p>
          {lastSync && (
            <p className="text-[10px] text-muted-foreground mt-1">
              <R k="最終" r="さいしゅう" /><R k="更新" r="こうしん" />: {new Date(lastSync).toLocaleString("ja-JP")}
            </p>
          )}
        </div>

        {/* ポートフォリオ一覧 */}
        {portfolios.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 space-y-3">
            <p>
              まだ <R k="投資" r="とうし" />は ありません。
              <br />
              「<R k="株" r="かぶ" />を <R k="買" r="か" />いたい！」ボタンで <R k="始" r="はじ" />めよう！
            </p>
            <div className="bg-green-50 rounded-lg p-3 text-left text-xs text-green-800 space-y-2 border border-green-100">
              <p className="font-semibold text-green-700">🌱 <R k="投資" r="とうし" />の <R k="基本" r="きほん" /></p>
              <p>
                <R k="株" r="かぶ" />は「お<R k="店" r="みせ" />の <R k="一部" r="いちぶ" />を <R k="持" r="も" />つ」こと。
                <br />
                お<R k="店" r="みせ" />が <R k="頑張" r="がんば" />ると、<R k="株" r="かぶ" />の <R k="値段" r="ねだん" />が あがるよ！
              </p>
              <p>
                🐢 <span className="font-semibold"><R k="長" r="なが" />く <R k="持" r="も" />つのが コツ！</span>
                <br />
                すぐ <R k="売" r="う" />らないで、じっくり <R k="育" r="そだ" />てよう。
                <br />
                <R k="何" r="なん" /><R k="年" r="ねん" />も <R k="持" r="も" />ち<R k="続" r="つづ" />けると、すこしずつ <R k="増" r="ふ" />えていくよ。
              </p>
              <p>
                🎯 <span className="font-semibold"><R k="選" r="えら" />び<R k="方" r="かた" />の ポイント</span>
                <br />
                たくさん ありすぎると <R k="迷" r="まよ" />っちゃうから、
                <br />
                このアプリでは <R k="選" r="えら" />びやすい <R k="数" r="かず" />に しているよ。
                <br />
                まずは 1つ <R k="選" r="えら" />んで みよう！
              </p>
            </div>
          </div>
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
