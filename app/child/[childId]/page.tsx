"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { Task, Wallet, Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      router.push("/");
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
    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse">よみこみ中...</div>
      </div>
    );
  }

  const total = wallet
    ? wallet.spending_balance + wallet.saving_balance
    : 0;
  const savingGoal = 5000;
  const savingPercent = wallet
    ? Math.min(Math.round((wallet.saving_balance / savingGoal) * 100), 100)
    : 0;

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-amber-800">
          🧒 {session?.name} のバンク
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearSession();
            router.push("/");
          }}
        >
          ログアウト
        </Button>
      </div>

      {/* Piggy Bank */}
      <Card className="mb-4 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-2">🐷</div>
          <p className="text-3xl font-bold text-amber-700">
            ¥{total.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mb-4">ぜんぶのおかね</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-blue-500 font-semibold">
                💳 つかえるお金
              </p>
              <p className="text-xl font-bold text-blue-600">
                ¥{wallet?.spending_balance.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-green-500 font-semibold">
                🏦 ちょきん
              </p>
              <p className="text-xl font-bold text-green-600">
                ¥{wallet?.saving_balance.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Saving Goal */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                ちょきんもくひょう ¥{savingGoal.toLocaleString()}
              </span>
              <span className="font-semibold">{savingPercent}%</span>
            </div>
            <Progress value={savingPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">📋 おてつだい</TabsTrigger>
          <TabsTrigger value="history">📜 りれき</TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks" className="space-y-3 mt-3">
          {tasks.length === 0 ? (
            <Card className="border-amber-200">
              <CardContent className="p-6 text-center text-muted-foreground">
                いまできるおてつだいはないよ 😴
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                          ¥{task.reward_amount.toLocaleString()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {task.recurrence === "daily"
                            ? "まいにち"
                            : task.recurrence === "weekly"
                              ? "まいしゅう"
                              : "1かい"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white h-12 px-4 text-base"
                      onClick={() => handleComplete(task)}
                      disabled={submitting === task.id}
                    >
                      {submitting === task.id ? "..." : "できた！✓"}
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
              <CardTitle className="text-base">さいきんのりれき</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  まだりれきがないよ
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
                          {tx.description || tx.type}
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
    </div>
  );
}
