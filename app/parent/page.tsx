"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { User, TaskLog, Task, Wallet, SpendRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import CommonHeader from "@/components/common-header";
import RewardSplitSlider from "@/components/reward-split-slider";
import { PaymentLinkDialog } from "@/components/payment-link";
import { AddChildDialog } from "@/components/add-child-dialog";
import { ApprovalDialog } from "@/components/approval-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function ParentDashboard() {
  const router = useRouter();
  const [children, setChildren] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [pendingLogs, setPendingLogs] = useState<(TaskLog & { task: Task; child: User })[]>([]);
  const [pendingSpends, setPendingSpends] = useState<(SpendRequest & { child: User })[]>([]);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ totalApproved: 0, totalEarned: 0, weeklyCount: 0, weeklyTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [editingRatio, setEditingRatio] = useState<string | null>(null);
  const [tempSaveRatio, setTempSaveRatio] = useState(30);
  const [tempInvestRatio, setTempInvestRatio] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState<(TaskLog & { task: Task; child: User }) | null>(null);
  const [questProposals, setQuestProposals] = useState<(Task & { child?: User })[]>([]);
  const [proposalRewards, setProposalRewards] = useState<Record<string, number>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [childMessages, setChildMessages] = useState<any[]>([]);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    amount: number;
    purpose: string;
    childName: string;
  }>({ open: false, amount: 0, purpose: "", childName: "" });

  const session = getSession();

  const loadData = useCallback(async () => {
    if (!session) return;

    // まず子供一覧を取得（IDリストで後続クエリをフィルタ）
    const { data: childData } = await supabase
      .from("otetsudai_users")
      .select("*")
      .eq("family_id", session.familyId)
      .eq("role", "child");
    const childList = childData || [];
    setChildren(childList);
    const childIds = childList.map((c: User) => c.id);

    // 子供IDリストが空なら残りのクエリは不要
    if (childIds.length === 0) {
      setWallets({});
      setPendingLogs([]);
      setPendingSpends([]);
      setStats({ totalApproved: 0, totalEarned: 0, weeklyCount: 0, weeklyTotal: 0 });
      setLoading(false);
      return;
    }

    const [walletRes, logsRes, approvedRes, spendRes] = await Promise.all([
      supabase
        .from("otetsudai_wallets")
        .select("*")
        .in("child_id", childIds),
      supabase
        .from("otetsudai_task_logs")
        .select("*, task:otetsudai_tasks(*), child:child_id(id, name, role)")
        .in("child_id", childIds)
        .eq("status", "pending")
        .order("completed_at", { ascending: false }),
      supabase
        .from("otetsudai_task_logs")
        .select("*, task:otetsudai_tasks(*)")
        .in("child_id", childIds)
        .eq("status", "approved"),
      supabase
        .from("otetsudai_spend_requests")
        .select("*, child:child_id(id, name, role)")
        .in("child_id", childIds)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    const walletMap: Record<string, Wallet> = {};
    (walletRes.data || []).forEach((w: Wallet) => {
      walletMap[w.child_id] = w;
    });
    setWallets(walletMap);

    setPendingLogs((logsRes.data as (TaskLog & { task: Task; child: User })[]) || []);
    setPendingSpends((spendRes.data as (SpendRequest & { child: User })[]) || []);

    // じぶんクエスト提案を取得
    const { data: proposals } = await supabase
      .from("otetsudai_tasks")
      .select("*, child:assigned_child_id(id, name, role)")
      .eq("family_id", session.familyId)
      .eq("proposal_status", "pending")
      .order("created_at", { ascending: false });
    const proposalData = (proposals as (Task & { child?: User })[]) || [];
    setQuestProposals(proposalData);
    // 報酬編集用の初期値
    const rewards: Record<string, number> = {};
    proposalData.forEach((p) => { rewards[p.id] = p.reward_amount; });
    setProposalRewards(rewards);

    // 子供からのメッセージを取得
    const { data: msgs } = await supabase
      .from("otetsudai_messages")
      .select("*, from_user:from_user_id(id, name, role)")
      .eq("family_id", session.familyId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10);
    setChildMessages(msgs || []);

    const approved = approvedRes.data || [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyApproved = approved.filter((l: TaskLog) => new Date(l.approved_at!) > weekAgo);
    setStats({
      totalApproved: approved.length,
      totalEarned: approved.reduce((sum: number, l: TaskLog & { task: Task }) => sum + (l.task?.reward_amount || 0), 0),
      weeklyCount: weeklyApproved.length,
      weeklyTotal: weeklyApproved.reduce((sum: number, l: TaskLog & { task: Task }) => sum + (l.task?.reward_amount || 0), 0),
    });

    setLoading(false);
  }, [session?.familyId]);

  useEffect(() => {
    if (!session || session.role !== "parent") {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  async function handleApprove(
    log: TaskLog & { task: Task },
    stamp: string | null,
    message: string
  ) {
    if (!session) return;
    const { error } = await supabase
      .from("otetsudai_task_logs")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: session.userId,
        approval_stamp: stamp,
        approval_message: message || null,
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

  async function handleApproveSpend(spend: SpendRequest & { child?: User }) {
    if (!session) return;
    await fetch("/api/spend-request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: spend.id, action: "approve", approved_by: session.userId }),
    });
    // 承認後に決済アプリ連携ダイアログを表示
    setPaymentDialog({
      open: true,
      amount: spend.amount,
      purpose: spend.purpose,
      childName: spend.child?.name || "",
    });
    loadData();
  }

  async function handleMarkRead(messageId: string) {
    await supabase
      .from("otetsudai_messages")
      .update({ is_read: true })
      .eq("id", messageId);
    loadData();
  }

  async function handleApproveProposal(taskId: string) {
    const adjustedReward = proposalRewards[taskId];
    await supabase
      .from("otetsudai_tasks")
      .update({
        proposal_status: "approved",
        is_active: true,
        reward_amount: adjustedReward,
      })
      .eq("id", taskId);
    loadData();
  }

  async function handleRejectProposal(taskId: string) {
    await supabase
      .from("otetsudai_tasks")
      .update({ proposal_status: "rejected" })
      .eq("id", taskId);
    loadData();
  }

  async function handleRejectSpend(spendId: string) {
    const reason = rejectReasons[spendId] || "";
    await fetch("/api/spend-request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: spendId, action: "reject", reject_reason: reason }),
    });
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
      <CommonHeader
        title="⚔️ クエストマスター"
        userName={session?.name}
        pendingCount={pendingLogs.length + pendingSpends.length + questProposals.length + childMessages.length}
        rightActions={
          <Link href="/parent/tasks">
            <Button variant="outline" size="sm" className="border-amber-300">
              📋 クエスト管理
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
            <p className="text-xs text-muted-foreground">今週の件数</p>
          </CardContent>
        </Card>
        <Card className="border-violet-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">¥{stats.weeklyTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">今週の支払い</p>
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
                      onClick={() => setApprovalTarget(log)}
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

      {/* 支出承認キュー */}
      {pendingSpends.length > 0 && (
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🛒 支出リクエスト
              <Badge variant="destructive">{pendingSpends.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingSpends.map((spend) => (
                <div
                  key={spend.id}
                  className="p-3 rounded-lg bg-blue-50 border border-blue-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">¥{spend.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        🧒 {spend.child?.name} ・ {spend.purpose}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(spend.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApproveSpend(spend)}
                      >
                        ✓ 承認
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectSpend(spend.id)}
                      >
                        ✗
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="却下理由（任意）"
                    value={rejectReasons[spend.id] || ""}
                    onChange={(e) => setRejectReasons((prev) => ({ ...prev, [spend.id]: e.target.value }))}
                    className="text-xs h-8"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* じぶんクエスト提案 */}
      {questProposals.length > 0 && (
        <Card className="mb-6 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ✨ クエストていあん
              <Badge variant="destructive">{questProposals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-3 rounded-lg bg-emerald-50 border border-emerald-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{proposal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        🧒 {proposal.child?.name}
                      </p>
                      {proposal.proposal_message && (
                        <p className="text-xs text-emerald-600 mt-1">
                          💬 「{proposal.proposal_message}」
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">ごほうび:</span>
                    <Input
                      type="number"
                      min={0}
                      step={10}
                      value={proposalRewards[proposal.id] ?? proposal.reward_amount}
                      onChange={(e) =>
                        setProposalRewards((prev) => ({
                          ...prev,
                          [proposal.id]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-24 h-8 text-sm text-center"
                    />
                    <span className="text-xs text-muted-foreground">えん</span>
                    {(proposalRewards[proposal.id] ?? proposal.reward_amount) !== proposal.reward_amount && (
                      <span className="text-[10px] text-amber-500">
                        （もとの ていあん: ¥{proposal.reward_amount}）
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white flex-1"
                      onClick={() => handleApproveProposal(proposal.id)}
                    >
                      ✓ 承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                      onClick={() => handleRejectProposal(proposal.id)}
                    >
                      ✗ 却下
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 子供からのメッセージ */}
      {childMessages.length > 0 && (
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💬 こどもからの メッセージ
              <Badge variant="destructive">{childMessages.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {childMessages.map((msg: { id: string; message: string; stamp: string | null; created_at: string; from_user?: { name: string } | { name: string }[] }) => {
                const fromName = Array.isArray(msg.from_user) ? msg.from_user[0]?.name : msg.from_user?.name;
                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {msg.stamp && <span className="text-2xl flex-shrink-0">{msg.stamp}</span>}
                        <div>
                          <p className="text-sm font-semibold text-blue-800">
                            🧒 {fromName || "こども"}
                          </p>
                          <p className="text-sm text-blue-700 whitespace-pre-wrap mt-0.5">
                            {msg.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(msg.created_at).toLocaleString("ja-JP")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-600 text-xs flex-shrink-0"
                        onClick={() => handleMarkRead(msg.id)}
                      >
                        ✓ よんだ
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                  <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
                    <div className="text-lg mb-0.5" aria-hidden="true">💰</div>
                    <p className="text-[10px] text-red-500 font-semibold">つかう</p>
                    <p className="font-bold text-red-600">
                      ¥{wallet?.spending_balance.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                    <div className="text-lg mb-0.5" aria-hidden="true">🐷</div>
                    <p className="text-[10px] text-blue-500 font-semibold">ためる</p>
                    <p className="font-bold text-blue-600">
                      ¥{wallet?.saving_balance.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
                    <div className="text-lg mb-0.5" aria-hidden="true">🌱</div>
                    <p className="text-[10px] text-green-500 font-semibold">ふやす</p>
                    <p className="font-bold text-green-600">
                      ¥{wallet?.invest_balance?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">貯蓄率</span>
                  <Progress value={savingPercent} className="flex-1 h-2" />
                  <span className="text-xs font-semibold">{savingPercent}%</span>
                </div>

                {/* 分割比率設定（UD対応スライダー） */}
                {editingRatio === child.id ? (
                  <div className="mt-3 p-4 rounded-xl bg-white border-2 border-amber-200">
                    <RewardSplitSlider
                      saveRatio={tempSaveRatio}
                      investRatio={tempInvestRatio}
                      onChange={(save, invest) => {
                        setTempSaveRatio(save);
                        setTempInvestRatio(invest);
                      }}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="ghost" onClick={() => setEditingRatio(null)}>キャンセル</Button>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={async () => {
                        if (wallet) {
                          await supabase.from("otetsudai_wallets").update({
                            save_ratio: tempSaveRatio,
                            invest_ratio: tempInvestRatio,
                            split_ratio: tempSaveRatio, // 後方互換
                          }).eq("id", wallet.id);
                          setEditingRatio(null);
                          loadData();
                        }
                      }}>保存</Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost" size="sm"
                    className="mt-2 w-full text-xs text-amber-600 hover:bg-amber-50"
                    onClick={() => {
                      setEditingRatio(child.id);
                      setTempSaveRatio(wallet?.save_ratio ?? wallet?.split_ratio ?? 30);
                      setTempInvestRatio(wallet?.invest_ratio ?? 0);
                    }}
                  >
                    ⚙️ 分割比率を変更
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* おこさま追加 */}
      {children.length < 5 && (
        <Button
          variant="outline"
          className="w-full mt-3 border-dashed border-amber-300 text-amber-600 h-12 text-base"
          onClick={() => setAddChildOpen(true)}
        >
          ＋ おこさまを ついか
        </Button>
      )}
      <AddChildDialog
        open={addChildOpen}
        onClose={() => setAddChildOpen(false)}
        familyId={session?.familyId || ""}
        onAdded={loadData}
      />

      {/* 承認スタンプダイアログ */}
      <ApprovalDialog
        open={!!approvalTarget}
        onClose={() => setApprovalTarget(null)}
        childName={approvalTarget?.child?.name || ""}
        taskTitle={approvalTarget?.task?.title || ""}
        reward={approvalTarget?.task?.reward_amount || 0}
        onApprove={(stamp, message) => {
          if (approvalTarget) {
            handleApprove(approvalTarget, stamp, message);
            setApprovalTarget(null);
          }
        }}
      />

      {/* 決済アプリ連携ダイアログ */}
      <PaymentLinkDialog
        open={paymentDialog.open}
        onClose={() => setPaymentDialog((p) => ({ ...p, open: false }))}
        amount={paymentDialog.amount}
        purpose={paymentDialog.purpose}
        childName={paymentDialog.childName}
      />

      {/* アカウント削除 */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        {!showDeleteConfirm ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️ アカウントを削除する
          </Button>
        ) : (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-red-600 mb-2">⚠️ アカウント削除</p>
              <p className="text-xs text-red-500 mb-3">
                削除すると、家族の全データ（クエスト・ウォレット・履歴）が失われます。この操作は取り消せません。
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                確認のため「削除する」と入力してください：
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="削除する"
                className="mb-3 text-sm"
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                  キャンセル
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteConfirmText !== "削除する" || deleting}
                  onClick={async () => {
                    if (!session) return;
                    setDeleting(true);
                    await fetch("/api/account", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ family_id: session.familyId, auth_id: session.authId }),
                    });
                    await supabase.auth.signOut();
                    clearSession();
                    router.push("/login");
                  }}
                >
                  {deleting ? "削除中..." : "完全に削除する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
