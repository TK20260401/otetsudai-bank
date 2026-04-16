"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { Task, TaskLog, Wallet, Transaction, SpendRequest, SavingGoal, Badge as BadgeType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTaskIcon } from "@/lib/task-icons";

import CommonHeader from "@/components/common-header";
import { R, AutoRuby } from "@/components/ruby-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SavingGoalSection from "@/components/saving-goal";
import BadgeDisplay from "@/components/badge-display";
import CoinAnimation from "@/components/coin-animation";
import { SelfQuestForm } from "@/components/self-quest-form";
import { LevelDisplay } from "@/components/level-display";
import { StampNotifications } from "@/components/stamp-notifications";
import { checkAndAwardBadges } from "@/lib/badges";
import { InvestPortfolio } from "@/components/invest-portfolio";
import { InvestOrderDialog } from "@/components/invest-order-dialog";
import { AnnouncementBanner } from "@/components/announcement-banner";

export default function ChildDashboard({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = use(params);
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [spendOpen, setSpendOpen] = useState(false);
  const [spendAmount, setSpendAmount] = useState("");
  const [spendPurpose, setSpendPurpose] = useState("");
  const [spendError, setSpendError] = useState("");
  const [spendSuccess, setSpendSuccess] = useState(false);
  const [rejectedSpends, setRejectedSpends] = useState<SpendRequest[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [selfQuestOpen, setSelfQuestOpen] = useState(false);
  const [pendingProposals, setPendingProposals] = useState(0);
  const [rejectedLogs, setRejectedLogs] = useState<(TaskLog & { task?: Task })[]>([]);
  const [pendingPayments, setPendingPayments] = useState<SpendRequest[]>([]);
  const [paidRecent, setPaidRecent] = useState<SpendRequest[]>([]);
  const [investOrderOpen, setInvestOrderOpen] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState({ quests: 0, earned: 0, streak: 0 });

  const session = getSession();

  const loadData = useCallback(async () => {
    if (!session) return;

    const [taskRes, walletRes, txRes] = await Promise.all([
      supabase
        .from("otetsudai_tasks")
        .select("*")
        .eq("family_id", session.familyId)
        .eq("is_active", true)
        .or(`assigned_child_id.is.null,assigned_child_id.eq.${childId}`),
      supabase
        .from("otetsudai_wallets")
        .select("*")
        .eq("child_id", childId)
        .single(),
      supabase
        .from("otetsudai_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setTasks(taskRes.data || []);
    setWallet(walletRes.data);

    // 却下された支出申請を取得
    const { data: rejects } = await supabase
      .from("otetsudai_spend_requests")
      .select("*")
      .eq("child_id", childId)
      .eq("status", "rejected")
      .order("created_at", { ascending: false })
      .limit(5);
    setRejectedSpends((rejects as SpendRequest[]) || []);

    // 送金待ち（承認済み・未送金）
    const { data: pendingPay } = await supabase
      .from("otetsudai_spend_requests")
      .select("*")
      .eq("child_id", childId)
      .eq("status", "approved")
      .eq("payment_status", "pending_payment")
      .order("approved_at", { ascending: false });
    setPendingPayments((pendingPay as SpendRequest[]) || []);

    // 最近の送金済み（直近5件）
    const { data: paidData } = await supabase
      .from("otetsudai_spend_requests")
      .select("*")
      .eq("child_id", childId)
      .eq("payment_status", "paid")
      .order("paid_at", { ascending: false })
      .limit(5);
    setPaidRecent((paidData as SpendRequest[]) || []);

    // 貯金目標を取得
    const { data: goals } = await supabase
      .from("otetsudai_saving_goals")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false });
    setSavingGoals((goals as SavingGoal[]) || []);

    // バッジ取得
    const { data: badgeData } = await supabase
      .from("otetsudai_badges")
      .select("*")
      .eq("child_id", childId);
    setBadges((badgeData as BadgeType[]) || []);

    // やりなおしクエスト（差し戻し）を取得
    const { data: rejLogs } = await supabase
      .from("otetsudai_task_logs")
      .select("*, task:otetsudai_tasks(*)")
      .eq("child_id", childId)
      .eq("status", "rejected")
      .order("completed_at", { ascending: false })
      .limit(5);
    setRejectedLogs((rejLogs as (TaskLog & { task?: Task })[]) || []);

    // じぶんクエスト提案中の数を取得
    const { count } = await supabase
      .from("otetsudai_tasks")
      .select("*", { count: "exact", head: true })
      .eq("created_by", childId)
      .eq("proposal_status", "pending");
    setPendingProposals(count || 0);

    // 週次サマリー
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const { data: weeklyLogs } = await supabase
      .from("otetsudai_task_logs")
      .select("*, task:otetsudai_tasks(reward_amount)")
      .eq("child_id", childId)
      .eq("status", "approved")
      .gte("approved_at", weekStart.toISOString());
    // ストリーク計算
    const { data: streakLogs } = await supabase
      .from("otetsudai_task_logs")
      .select("approved_at")
      .eq("child_id", childId)
      .eq("status", "approved")
      .not("approved_at", "is", null)
      .order("approved_at", { ascending: false })
      .limit(90);
    let streak = 0;
    if (streakLogs && streakLogs.length > 0) {
      const days = new Set(
        streakLogs.map((l: { approved_at: string }) => new Date(l.approved_at).toDateString())
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const check = new Date(today);
      if (!days.has(check.toDateString())) {
        check.setDate(check.getDate() - 1);
      }
      while (days.has(check.toDateString())) {
        streak++;
        check.setDate(check.getDate() - 1);
      }
    }
    setWeeklySummary({
      quests: weeklyLogs?.length || 0,
      earned: (weeklyLogs || []).reduce(
        (sum: number, log: { task?: { reward_amount: number } }) => sum + (log.task?.reward_amount || 0), 0
      ),
      streak,
    });

    // Filter transactions by this child's wallet
    if (walletRes.data) {
      setTransactions(
        (txRes.data || []).filter(
          (t: Transaction) => t.wallet_id === walletRes.data.id
        )
      );
    }

    setLoading(false);
  }, [childId, session?.familyId]);

  useEffect(() => {
    if (!session || session.role !== "child") {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  async function handleComplete(task: Task) {
    setSubmitting(task.id);

    await supabase.from("otetsudai_task_logs").insert({
      task_id: task.id,
      child_id: childId,
      status: "pending",
    });

    setSubmitting(null);
    setShowCoinAnim(true);
    await checkAndAwardBadges(childId);
    loadData();
  }

  async function handleSpendRequest() {
    const amount = parseInt(spendAmount);
    if (!amount || amount <= 0) { setSpendError("金額を入れてね"); return; }
    if (!spendPurpose.trim()) { setSpendError("何に使うか入れてね"); return; }
    if (!wallet || amount > wallet.spending_balance) { setSpendError("お金が足りないよ"); return; }
    setSpendError("");

    const res = await fetch("/api/spend-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        child_id: childId,
        wallet_id: wallet.id,
        amount,
        purpose: spendPurpose.trim(),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setSpendError(data.error || "しっぱいしたよ");
      return;
    }
    setSpendSuccess(true);
    setSpendAmount("");
    setSpendPurpose("");
    setTimeout(() => { setSpendOpen(false); setSpendSuccess(false); }, 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse">よみこみ<R k="中" r="ちゅう" />...</div>
      </div>
    );
  }

  const total = wallet
    ? wallet.spending_balance + wallet.saving_balance + (wallet.invest_balance ?? 0)
    : 0;

  return (
    <div className="min-h-screen px-4 py-4 max-w-lg mx-auto" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <AnnouncementBanner role="child" />
      <CommonHeader title={`🧒 ${session?.name} のバンク`} />
      <p className="text-xs text-muted-foreground mb-3 -mt-4">{new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" })}</p>

      {/* レベル表示 */}
      <LevelDisplay childId={childId} />

      {/* おやからのスタンプ通知 */}
      <StampNotifications childId={childId} />

      {/* 装備（バッジ）表示 — 常時表示 */}
      <div className="mb-3">
        {badges.length > 0 ? (
          <BadgeDisplay badges={badges} />
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
            <p className="text-sm font-bold text-gray-500 mb-2">⚔️ <R k="装備" r="そうび" /></p>
            <div className="flex justify-center gap-3 mb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg">？</div>
              ))}
            </div>
            <p className="text-xs text-gray-400">クエストをクリアして <R k="装備" r="そうび" />をあつめよう！</p>
          </div>
        )}
      </div>

      {/* 週次サマリー */}
      {weeklySummary.quests > 0 && (
        <Card className="mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-amber-800 mb-2">📊 こんしゅうの きろく</p>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">{weeklySummary.quests}</p>
                <p className="text-xs text-muted-foreground">クエスト</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">¥{weeklySummary.earned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground"><R k="稼" r="かせ" />いだ</p>
              </div>
              {weeklySummary.streak > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700">🔥{weeklySummary.streak}</p>
                  <p className="text-xs text-muted-foreground"><R k="連続" r="れんぞく" /><R k="日" r="にち" /></p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Piggy Bank */}
      <Card className="mb-4 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardContent className="p-6 text-center">
          <div className={`text-6xl mb-2 transition-transform duration-500 ${total >= 5000 ? "scale-125" : total >= 1000 ? "scale-110" : "scale-100"}`}>
            {total >= 5000 ? "🐷🌟" : total >= 1000 ? "🐷✨" : "🐷"}
          </div>
          <p className="text-3xl font-bold text-amber-700">
            ¥{total.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mb-4"><R k="全部" r="ぜんぶ" />のお<R k="金" r="かね" /></p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/70 rounded-xl p-2">
              <p className="text-[10px] text-red-500 font-semibold">
                💳 <R k="使" r="つか" />う
              </p>
              <p className="text-base font-bold text-red-600">
                ¥{(wallet?.spending_balance ?? 0).toLocaleString()}
              </p>
              <Button
                size="sm"
                className="mt-1 w-full bg-red-500 hover:bg-red-600 text-white text-[10px] h-6 px-1"
                onClick={() => { setSpendOpen(true); setSpendError(""); setSpendSuccess(false); }}
              >
                🛒 <R k="使" r="つか" />う
              </Button>
            </div>
            <div className="bg-white/70 rounded-xl p-2">
              <p className="text-[10px] text-blue-500 font-semibold">
                🐷 <R k="貯" r="た" />める
              </p>
              <p className="text-base font-bold text-blue-600">
                ¥{(wallet?.saving_balance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/70 rounded-xl p-2">
              <p className="text-[10px] text-green-500 font-semibold">
                🌱 <R k="増" r="ふ" />やす
              </p>
              <p className="text-base font-bold text-green-600">
                ¥{(wallet?.invest_balance ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* 貯金目標 */}
      <SavingGoalSection
        childId={childId}
        savingBalance={wallet?.saving_balance || 0}
        goals={savingGoals}
        onUpdate={loadData}
      />

      {/* 投資ポートフォリオ（全員に常時表示） */}
      {wallet && (
        <div className="mb-4">
          <InvestPortfolio
            childId={childId}
            investBalance={wallet.invest_balance ?? 0}
          />
          {(wallet.invest_balance ?? 0) > 0 && (
            <Button
              className="w-full mt-2 h-12 text-base font-bold bg-green-500 hover:bg-green-600 text-white rounded-2xl"
              onClick={() => setInvestOrderOpen(true)}
            >
              🌱 <R k="株" r="かぶ" />を <R k="買" r="か" />いたい！
            </Button>
          )}
        </div>
      )}
      <InvestOrderDialog
        open={investOrderOpen}
        onClose={() => setInvestOrderOpen(false)}
        childId={childId}
        walletId={wallet?.id || ""}
        investBalance={wallet?.invest_balance || 0}
        onCreated={loadData}
      />

      {/* きょうやること */}
      {(() => {
        const todayTasks = tasks.filter((t) =>
          t.recurrence === "daily" || (t.recurrence === "weekly" && new Date(t.created_at).getDay() === new Date().getDay())
        );
        if (todayTasks.length === 0) return null;
        return (
          <Card className="mb-4 border-amber-300">
            <CardContent className="p-4">
              <p className="text-base font-bold text-amber-800 mb-2">
                ☀️ <R k="今日" r="きょう" />のクエスト
              </p>
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTaskIcon(task.title)}</span>
                      <span className="text-sm font-medium"><AutoRuby text={task.title} /></span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white text-xs h-8"
                      onClick={() => handleComplete(task)}
                      disabled={submitting === task.id}
                    >
                      {submitting === task.id ? "..." : "クリア！"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* じぶんクエストを つくる */}
      <div className="mb-4">
        <Button
          className="w-full h-14 text-lg bg-emerald-500 hover:bg-emerald-600 text-white"
          onClick={() => setSelfQuestOpen(true)}
        >
          ✨ <R k="自分" r="じぶん" />クエストを <R k="作" r="つく" />る
        </Button>
        {pendingProposals > 0 && (
          <p className="text-center text-xs text-amber-600 mt-1">
            📨 {pendingProposals}<R k="件" r="けん" />の <R k="提案" r="ていあん" />が <R k="承認待" r="しょうにんま" />ちだよ
          </p>
        )}
      </div>
      <SelfQuestForm
        open={selfQuestOpen}
        onClose={() => setSelfQuestOpen(false)}
        childId={childId}
        familyId={session?.familyId || ""}
        onCreated={loadData}
      />

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">⚔️ クエスト</TabsTrigger>
          <TabsTrigger value="history">📜 <R k="履歴" r="りれき" /></TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks" className="space-y-3 mt-3">
          {tasks.length === 0 ? (
            <Card className="border-amber-200">
              <CardContent className="p-6 text-center text-muted-foreground">
                <R k="今" r="いま" />できるクエストはないよ 😴
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl mt-0.5">{getTaskIcon(task.title)}</span>
                      <div>
                        <p className="font-semibold text-lg"><AutoRuby text={task.title} /></p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            <AutoRuby text={task.description} />
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                            ¥{task.reward_amount.toLocaleString()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {task.recurrence === "daily"
                              ? <><R k="毎日" r="まいにち" /></>
                              : task.recurrence === "weekly"
                                ? <><R k="毎週" r="まいしゅう" /></>
                                : <>1<R k="回" r="かい" /></>}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white h-12 px-4 text-base"
                      onClick={() => handleComplete(task)}
                      disabled={submitting === task.id}
                    >
                      {submitting === task.id ? "..." : "クリア！⚔️"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history" className="mt-3">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-base"><R k="最近" r="さいきん" />の<R k="履歴" r="りれき" /></CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  まだ<R k="履歴" r="りれき" />がないよ
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-amber-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {tx.type === "earn"
                            ? "💰"
                            : tx.type === "spend"
                              ? "🛒"
                              : "🏦"}{" "}
                          <AutoRuby text={tx.description || tx.type} />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <span
                        className={`font-bold ${tx.type === "earn" ? "text-green-600" : "text-red-500"}`}
                      >
                        {tx.type === "earn" ? "+" : "-"}¥
                        {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* おしはらい ステータス */}
      {pendingPayments.length > 0 && (
        <Card className="mt-4 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-orange-700 mb-2">💰 <R k="親" r="おや" />が お<R k="金" r="かね" />を <R k="準備" r="じゅんび" /> しているよ</p>
            {pendingPayments.map((sp) => (
              <div key={sp.id} className="text-sm mb-1 p-2 rounded-lg bg-white/60">
                <span className="font-bold text-orange-800">¥{sp.amount.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1.5">{sp.purpose}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {paidRecent.length > 0 && (
        <Card className="mt-4 border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-emerald-700 mb-2">🎉 お<R k="金" r="かね" />を もらったよ！</p>
            {paidRecent.map((sp) => (
              <div key={sp.id} className="text-sm mb-1 p-2 rounded-lg bg-white/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-800">¥{sp.amount.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1.5">{sp.purpose}</span>
                </div>
                <span className="text-xs text-emerald-500">
                  {sp.payment_method === "paypay" ? "📱 PayPay" :
                   sp.payment_method === "b43" ? "💳 B/43" :
                   sp.payment_method === "linepay" ? "💚 LINE Pay" :
                   sp.payment_method === "cash" ? "💴 現金" : "✅"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* やりなおしクエスト（差し戻し） */}
      {rejectedLogs.length > 0 && (
        <Card className="mt-4 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-700 mb-2">🔄 やり<R k="直" r="なお" />し クエスト</p>
            {rejectedLogs.map((log) => (
              <div key={log.id} className="text-sm mb-2 p-2 rounded-lg bg-white/60">
                <p className="font-semibold text-amber-800">{log.task?.title}</p>
                {log.reject_reason ? (
                  <p className="text-xs text-amber-600 mt-0.5">💬 {log.reject_reason}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">もう<R k="一度" r="いちど" /> <R k="頑張" r="がんば" />ろう！</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* つかう リクエストの やりなおし */}
      {rejectedSpends.length > 0 && (
        <Card className="mt-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-blue-700 mb-2">🔄 <R k="使" r="つか" />う リクエストの やり<R k="直" r="なお" />し</p>
            {rejectedSpends.map((sr) => (
              <div key={sr.id} className="text-sm mb-2 p-2 rounded-lg bg-white/60">
                <p className="font-semibold text-blue-800">
                  ¥{sr.amount.toLocaleString()} — {sr.purpose}
                </p>
                {sr.reject_reason ? (
                  <p className="text-xs text-blue-600 mt-0.5">💬 {sr.reject_reason}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5"><R k="今度" r="こんど" />は <R k="別" r="べつ" />の <R k="使" r="つか" />い<R k="方" r="かた" />を <R k="考" r="かんが" />えてみよう！</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* つかうダイアログ */}
      <Dialog open={spendOpen} onOpenChange={setSpendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🛒 お<R k="金" r="かね" />を<R k="使" r="つか" />う</DialogTitle>
          </DialogHeader>
          {spendSuccess ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📨</div>
              <p className="font-semibold text-green-600"><R k="親" r="おや" />に お<R k="願" r="ねが" />いしたよ！</p>
              <p className="text-sm text-muted-foreground"><R k="承認" r="しょうにん" />を<R k="待" r="ま" />ってね</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label><R k="金額" r="きんがく" />（<R k="円" r="えん" />）</Label>
                <Input
                  type="number"
                  min={1}
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="100"
                  className="text-xl text-center h-12"
                />
              </div>
              <div>
                <Label><R k="何" r="なに" />に <R k="使" r="つか" />う？</Label>
                <Input
                  value={spendPurpose}
                  onChange={(e) => setSpendPurpose(e.target.value)}
                  placeholder="例: お菓子を買いたい"
                  className="h-12"
                />
              </div>
              {spendError && <p className="text-destructive text-sm text-center">{spendError}</p>}
              <p className="text-xs text-muted-foreground text-center">
                <R k="使" r="つか" />えるお<R k="金" r="かね" />: ¥{wallet?.spending_balance.toLocaleString() || 0}
              </p>
              <Button
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg"
                onClick={handleSpendRequest}
              >
                <R k="親" r="おや" />に お<R k="願" r="ねが" />いする
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CoinAnimation show={showCoinAnim} onComplete={() => setShowCoinAnim(false)} />
    </div>
  );
}
