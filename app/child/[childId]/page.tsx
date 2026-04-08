"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { Task, Wallet, Transaction, SpendRequest, SavingGoal, Badge as BadgeType } from "@/lib/types";
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
import { checkAndAwardBadges } from "@/lib/badges";

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
    if (!amount || amount <= 0) { setSpendError("きんがくをいれてね"); return; }
    if (!spendPurpose.trim()) { setSpendError("なにに つかうか いれてね"); return; }
    if (!wallet || amount > wallet.spending_balance) { setSpendError("おかねが たりないよ"); return; }
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
    ? wallet.spending_balance + wallet.saving_balance
    : 0;

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <CommonHeader title={`🧒 ${session?.name} のバンク`} />

      {/* バッジ表示 */}
      {badges.length > 0 && (
        <div className="mb-3">
          <BadgeDisplay badges={badges} />
        </div>
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
          <p className="text-sm text-muted-foreground mb-4">ぜんぶのおかね</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-blue-500 font-semibold">
                💳 つかえるお<R k="金" r="かね" />
              </p>
              <p className="text-xl font-bold text-blue-600">
                ¥{wallet?.spending_balance.toLocaleString() || 0}
              </p>
              <Button
                size="sm"
                className="mt-1 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs h-7"
                onClick={() => { setSpendOpen(true); setSpendError(""); setSpendSuccess(false); }}
              >
                🛒 つかう
              </Button>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-green-500 font-semibold">
                🏦 <R k="貯" r="ちょ" /><R k="金" r="きん" />
              </p>
              <p className="text-xl font-bold text-green-600">
                ¥{wallet?.saving_balance.toLocaleString() || 0}
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
                ☀️ きょうのクエスト
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
                いまできるクエストはないよ 😴
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
      {/* 却下された支出申請の通知 */}
      {rejectedSpends.length > 0 && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-red-600 mb-2">❌ <R k="却下" r="きゃっか" />されたリクエスト</p>
            {rejectedSpends.map((sr) => (
              <div key={sr.id} className="text-sm mb-1">
                <span className="text-red-500">¥{sr.amount.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1">{sr.purpose}</span>
                {sr.reject_reason && (
                  <p className="text-xs text-red-400 ml-4">→ {sr.reject_reason}</p>
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
            <DialogTitle>🛒 おかねをつかう</DialogTitle>
          </DialogHeader>
          {spendSuccess ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📨</div>
              <p className="font-semibold text-green-600">おやに おねがいしたよ！</p>
              <p className="text-sm text-muted-foreground"><R k="承認" r="しょうにん" />をまってね</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label><R k="金額" r="きんがく" />（えん）</Label>
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
                <Label>なにに つかう？</Label>
                <Input
                  value={spendPurpose}
                  onChange={(e) => setSpendPurpose(e.target.value)}
                  placeholder="れい: おかしを かいたい"
                  className="h-12"
                />
              </div>
              {spendError && <p className="text-destructive text-sm text-center">{spendError}</p>}
              <p className="text-xs text-muted-foreground text-center">
                つかえるお<R k="金" r="かね" />: ¥{wallet?.spending_balance.toLocaleString() || 0}
              </p>
              <Button
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg"
                onClick={handleSpendRequest}
              >
                おやに おねがいする
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CoinAnimation show={showCoinAnim} onComplete={() => setShowCoinAnim(false)} />
    </div>
  );
}
