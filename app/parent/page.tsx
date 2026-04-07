"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { User, TaskLog, Task, Wallet } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatWidget from "@/components/chat-widget";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function ParentDashboard() {
  const router = useRouter();
  const [children, setChildren] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [pendingLogs, setPendingLogs] = useState<(TaskLog & { task: Task; child: User })[]>([]);
  const [stats, setStats] = useState({ totalApproved: 0, totalEarned: 0, weeklyCount: 0 });
  const [loading, setLoading] = useState(true);

  const session = getSession();

  const loadData = useCallback(async () => {
    if (!session) return;

    const [childRes, walletRes, logsRes, approvedRes] = await Promise.all([
      supabase
        .from("otetsudai_users")
        .select("*")
        .eq("family_id", session.familyId)
        .eq("role", "child"),
      supabase
        .from("otetsudai_wallets")
        .select("*"),
      supabase
        .from("otetsudai_task_logs")
        .select("*, task:otetsudai_tasks(*), child:child_id(id, name, role)")
        .eq("status", "pending")
        .order("completed_at", { ascending: false }),
      supabase
        .from("otetsudai_task_logs")
        .select("*, task:otetsudai_tasks(*)")
        .eq("status", "approved"),
    ]);

    setChildren(childRes.data || []);

    const walletMap: Record<string, Wallet> = {};
    (walletRes.data || []).forEach((w: Wallet) => {
      walletMap[w.child_id] = w;
    });
    setWallets(walletMap);

    setPendingLogs((logsRes.data as (TaskLog & { task: Task; child: User })[]) || []);

    const approved = approvedRes.data || [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStats({
      totalApproved: approved.length,
      totalEarned: approved.reduce((sum: number, l: TaskLog & { task: Task }) => sum + (l.task?.reward_amount || 0), 0),
      weeklyCount: approved.filter((l: TaskLog) => new Date(l.approved_at!) > weekAgo).length,
    });

    setLoading(false);
  }, [session?.familyId]);

  useEffect(() => {
    if (!session || session.role !== "parent") {
      router.push("/");
      return;
    }
    loadData();
  }, []);

  async function handleApprove(log: TaskLog & { task: Task }) {
    if (!session) return;
    const { error } = await supabase
      .from("otetsudai_task_logs")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: session.userId,
      })
      .eq("id", log.id);

    if (error) return;

    // Update wallet
    const childWallet = wallets[log.child_id];
    if (childWallet) {
      const reward = log.task.reward_amount;
      const savingPortion = Math.floor((reward * childWallet.split_ratio) / 100);
      const spendingPortion = reward - savingPortion;

      await supabase
        .from("otetsudai_wallets")
        .update({
          spending_balance: childWallet.spending_balance + spendingPortion,
          saving_balance: childWallet.saving_balance + savingPortion,
        })
        .eq("id", childWallet.id);

      await supabase.from("otetsudai_transactions").insert({
        wallet_id: childWallet.id,
        type: "earn",
        amount: reward,
        description: `${log.task.title} 承認`,
        task_log_id: log.id,
      });
    }

    loadData();
  }

  async function handleReject(logId: string) {
    await supabase
      .from("otetsudai_task_logs")
      .update({ status: "rejected" })
      .eq("id", logId);
    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-800">🏦 おやダッシュボード</h1>
          <p className="text-sm text-muted-foreground">{session?.name} さん</p>
        </div>
        <div className="flex gap-2">
          <Link href="/parent/tasks">
            <Button variant="outline" size="sm" className="border-amber-300">
              📋 タスク管理
            </Button>
          </Link>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.totalApproved}</p>
            <p className="text-xs text-muted-foreground">承認済み</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">¥{stats.totalEarned.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">総獲得</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.weeklyCount}</p>
            <p className="text-xs text-muted-foreground">今週</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card className="mb-6 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            ⏳ 承認待ち
            {pendingLogs.length > 0 && (
              <Badge variant="destructive">{pendingLogs.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              承認待ちはありません 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {pendingLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <div>
                    <p className="font-semibold">{log.task?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      🧒 {log.child?.name} ・ ¥{log.task?.reward_amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.completed_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleApprove(log)}
                    >
                      ✓ 承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(log.id)}
                    >
                      ✗
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      {/* Children Wallets */}
      <h2 className="text-lg font-bold text-amber-800 mb-3">💰 こどもの残高</h2>
      <div className="grid gap-3">
        {children.map((child) => {
          const wallet = wallets[child.id];
          const total = wallet
            ? wallet.spending_balance + wallet.saving_balance
            : 0;
          const savingPercent = wallet && total > 0
            ? Math.round((wallet.saving_balance / total) * 100)
            : 0;

          return (
            <Card key={child.id} className="border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">🧒 {child.name}</span>
                  <span className="text-xl font-bold text-amber-700">
                    ¥{total.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div className="bg-blue-50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">つかえるお金</p>
                    <p className="font-bold text-blue-600">
                      ¥{wallet?.spending_balance.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">ちょきん</p>
                    <p className="font-bold text-green-600">
                      ¥{wallet?.saving_balance.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">貯蓄率</span>
                  <Progress value={savingPercent} className="flex-1 h-2" />
                  <span className="text-xs font-semibold">{savingPercent}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ChatWidget role="parent" />
    </div>
  );
}
