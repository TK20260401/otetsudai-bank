"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { User, TaskLog, Task, Wallet, SpendRequest, InvestOrder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import CommonHeader from "@/components/common-header";
import RewardSplitSlider from "@/components/reward-split-slider";
import { PaymentLinkDialog } from "@/components/payment-link";
import { AddChildDialog } from "@/components/add-child-dialog";
import { ApprovalDialog } from "@/components/approval-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnnouncementBanner } from "@/components/announcement-banner";

/** メールアドレス形式なら表示名として不適切と判断 */
function displayName(name: string | undefined | null): string {
  if (!name) return "なまえ未設定";
  if (name.includes("@")) return name.split("@")[0];
  return name;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [children, setChildren] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [pendingLogs, setPendingLogs] = useState<(TaskLog & { task: Task; child: User })[]>([]);
  const [pendingSpends, setPendingSpends] = useState<(SpendRequest & { child: User })[]>([]);
  const [unpaidSpends, setUnpaidSpends] = useState<(SpendRequest & { child: User })[]>([]);
  const [stats, setStats] = useState({ totalApproved: 0, totalEarned: 0 });
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
  const [pendingInvestOrders, setPendingInvestOrders] = useState<(InvestOrder & { child?: User })[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [childMessages, setChildMessages] = useState<any[]>([]);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    amount: number;
    purpose: string;
    childName: string;
  }>({ open: false, amount: 0, purpose: "", childName: "" });
  const [taskCount, setTaskCount] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState({ quests: 0, earned: 0 });

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

    // クエスト数を取得
    const { count: tCount } = await supabase
      .from("otetsudai_tasks")
      .select("*", { count: "exact", head: true })
      .eq("family_id", session.familyId)
      .eq("is_active", true);
    setTaskCount(tCount || 0);

    // 子供IDリストが空なら残りのクエリは不要
    if (childIds.length === 0) {
      setWallets({});
      setPendingLogs([]);
      setPendingSpends([]);
      setStats({ totalApproved: 0, totalEarned: 0 });
      setLoading(false);
      return;
    }

    const [walletRes, logsRes, approvedRes, spendRes, unpaidRes] = await Promise.all([
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
      // 承認済み・未送金の支出リクエスト
      supabase
        .from("otetsudai_spend_requests")
        .select("*, child:child_id(id, name, role)")
        .in("child_id", childIds)
        .eq("status", "approved")
        .eq("payment_status", "pending_payment")
        .order("approved_at", { ascending: false }),
    ]);

    const walletMap: Record<string, Wallet> = {};
    (walletRes.data || []).forEach((w: Wallet) => {
      walletMap[w.child_id] = w;
    });
    setWallets(walletMap);

    setPendingLogs((logsRes.data as (TaskLog & { task: Task; child: User })[]) || []);
    setPendingSpends((spendRes.data as (SpendRequest & { child: User })[]) || []);
    setUnpaidSpends((unpaidRes.data as (SpendRequest & { child: User })[]) || []);

    // じぶんクエスト提案を取得
    const { data: proposals } = await supabase
      .from("otetsudai_tasks")
      .select("*, child:assigned_child_id(id, name, role)")
      .eq("family_id", session.familyId)
      .eq("proposal_status", "pending")
      .order("created_at", { ascending: false });
    const proposalData = (proposals as (Task & { child?: User })[]) || [];
    setQuestProposals(proposalData);
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

    // 投資注文（pending）を取得
    const { data: investOrders } = await supabase
      .from("otetsudai_invest_orders")
      .select("*, child:child_id(id, name, role)")
      .in("child_id", childIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingInvestOrders((investOrders as (InvestOrder & { child?: User })[]) || []);

    const approved = approvedRes.data || [];
    setStats({
      totalApproved: approved.length,
      totalEarned: approved.reduce((sum: number, l: TaskLog & { task: Task }) => sum + (l.task?.reward_amount || 0), 0),
    });

    // 週次サマリー
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyApproved = approved.filter(
      (l: TaskLog) => l.approved_at && new Date(l.approved_at) >= weekStart
    );
    setWeeklySummary({
      quests: weeklyApproved.length,
      earned: weeklyApproved.reduce((sum: number, l: TaskLog & { task: Task }) => sum + (l.task?.reward_amount || 0), 0),
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

    // ウォレット更新（3分割: save_ratio / invest_ratio / 残りがspend）
    const childWallet = wallets[log.child_id];
    if (childWallet) {
      const reward = log.task.reward_amount;
      const saveRatio = childWallet.save_ratio ?? childWallet.split_ratio ?? 0;
      const investRatio = childWallet.invest_ratio ?? 0;
      const savingPortion = Math.floor((reward * saveRatio) / 100);
      const investPortion = Math.floor((reward * investRatio) / 100);
      const spendingPortion = reward - savingPortion - investPortion;

      await supabase
        .from("otetsudai_wallets")
        .update({
          spending_balance: childWallet.spending_balance + spendingPortion,
          saving_balance: childWallet.saving_balance + savingPortion,
          invest_balance: childWallet.invest_balance + investPortion,
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

  async function handleReject(logId: string, reason?: string) {
    await supabase
      .from("otetsudai_task_logs")
      .update({ status: "rejected", reject_reason: reason || null })
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
    setPaymentDialog({
      open: true,
      amount: spend.amount,
      purpose: spend.purpose,
      childName: displayName(spend.child?.name),
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

  async function handleMarkPaid(spendId: string, method: string) {
    await fetch("/api/spend-request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: spendId, action: "mark_paid", payment_method: method }),
    });
    loadData();
  }

  async function handleApproveInvestOrder(order: InvestOrder & { child?: User }) {
    if (!session) return;
    // invest_balanceから減算
    const childWallet = wallets[order.child_id];
    if (!childWallet || childWallet.invest_balance < order.amount) return;

    // 株価取得（stock_pricesテーブルから）
    const { data: stockData } = await supabase
      .from("otetsudai_stock_prices")
      .select("price")
      .eq("symbol", order.symbol)
      .single();
    const price = stockData?.price || 1;
    const shares = order.amount / price;

    // 注文を約定
    await supabase
      .from("otetsudai_invest_orders")
      .update({
        status: "executed",
        executed_price: price,
        executed_shares: shares,
        approved_at: new Date().toISOString(),
        approved_by: session.userId,
      })
      .eq("id", order.id);

    // ウォレットのinvest_balanceを減算
    await supabase
      .from("otetsudai_wallets")
      .update({ invest_balance: childWallet.invest_balance - order.amount })
      .eq("id", childWallet.id);

    // ポートフォリオに追加
    await supabase.from("otetsudai_invest_portfolios").insert({
      wallet_id: childWallet.id,
      child_id: order.child_id,
      symbol: order.symbol,
      name: order.name,
      shares,
      buy_price: price,
      current_price: price,
      current_value: order.amount,
    });

    // トランザクション記録
    await supabase.from("otetsudai_transactions").insert({
      wallet_id: childWallet.id,
      type: "invest",
      amount: order.amount,
      description: `${order.name} を ¥${order.amount} で こうにゅう`,
    });

    loadData();
  }

  async function handleRejectInvestOrder(orderId: string) {
    await supabase
      .from("otetsudai_invest_orders")
      .update({ status: "rejected" })
      .eq("id", orderId);
    loadData();
  }

  async function handleRejectSpend(spendId: string, reason?: string) {
    await fetch("/api/spend-request", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: spendId, action: "reject", reject_reason: reason || "" }),
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

  const totalPending = pendingLogs.length + pendingSpends.length + questProposals.length + childMessages.length + pendingInvestOrders.length;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <AnnouncementBanner role="parent" />
      <CommonHeader
        title="⚔️ クエストマスター"
        userName={displayName(session?.name)}
        pendingCount={totalPending}
        rightActions={
          <Link href="/parent/tasks">
            <Button variant="outline" size="sm" className="border-amber-300">
              📋 クエスト管理
            </Button>
          </Link>
        }
      />

      {/* ──── ウェルカム / 空状態 ──── */}
      {children.length === 0 ? (
        <Card className="mb-6 border-dashed border-2 border-amber-300 bg-amber-50/50">
          <CardContent className="py-10 text-center space-y-3">
            <div className="text-5xl">👨‍👩‍👧‍👦</div>
            <p className="text-lg font-bold text-amber-800">
              ようこそ クエストマスター！
            </p>
            <p className="text-sm text-muted-foreground">
              まずは お子さまを 追加して<br />冒険を はじめましょう！
            </p>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white text-base h-12 px-8"
              onClick={() => setAddChildOpen(true)}
            >
              ＋ お子さまを 追加
            </Button>
          </CardContent>
        </Card>
      ) : taskCount === 0 && totalPending === 0 ? (
        <Card className="mb-6 border-dashed border-2 border-emerald-300 bg-emerald-50/50">
          <CardContent className="py-8 text-center space-y-3">
            <div className="text-5xl">⚔️</div>
            <p className="text-lg font-bold text-emerald-800">
              クエストを つくって<br />冒険を はじめよう！
            </p>
            <p className="text-sm text-muted-foreground">
              お子さまが 挑戦する クエスト（お手伝い）を つくりましょう
            </p>
            <Link href="/parent/tasks">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-base h-12 px-8">
                📋 クエストを つくる
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* ──── 週次サマリー ──── */}
      {weeklySummary.quests > 0 && (
        <Card className="mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-amber-800 mb-2">📊 今週の家族記録</p>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">{weeklySummary.quests}</p>
                <p className="text-xs text-muted-foreground">クエスト完了</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">¥{weeklySummary.earned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">支払い</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ──── 承認待ちサマリー ──── */}
      {totalPending > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-100/70 border border-amber-200 text-center">
          <p className="text-lg font-bold text-amber-800">
            📬 {totalPending}件の 承認待ち！
          </p>
        </div>
      )}

      {/* ──── クエスト完了 承認キュー ──── */}
      {pendingLogs.length > 0 && (
        <Card className="mb-4 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              ⏳ クエスト かんりょう
              <Badge variant="destructive">{pendingLogs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-amber-50 border border-amber-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{log.task?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        🧒 {displayName(log.child?.name)} ・ ¥{log.task?.reward_amount}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-3 flex-shrink-0 ml-2"
                      onClick={() => setApprovalTarget(log)}
                    >
                      ✓ 承認
                    </Button>
                  </div>
                  {/* やりなおしプリセット理由 */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "🔄 やり直し", reason: "" },
                      { label: "もう少し 丁寧に", reason: "もう少し 丁寧に やってみよう" },
                      { label: "最後まで やろう", reason: "最後まで やりきろう！" },
                      { label: "時間を かけてね", reason: "もう少し 時間を かけてみよう" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="text-[11px] px-2.5 py-1 rounded-full border border-amber-200 text-amber-700 bg-white hover:bg-amber-100 active:scale-95 transition-all"
                        onClick={() => handleReject(log.id, preset.reason)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ──── 支出リクエスト ──── */}
      {pendingSpends.length > 0 && (
        <Card className="mb-4 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              🛒 つかいたい リクエスト
              <Badge variant="destructive">{pendingSpends.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingSpends.map((spend) => (
                <div
                  key={spend.id}
                  className="p-3 rounded-xl bg-blue-50 border border-blue-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm">¥{spend.amount.toLocaleString()} — {spend.purpose}</p>
                      <p className="text-xs text-muted-foreground">
                        🧒 {displayName(spend.child?.name)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-3 flex-shrink-0 ml-2"
                      onClick={() => handleApproveSpend(spend)}
                    >
                      ✓ OK
                    </Button>
                  </div>
                  {/* やりなおしプリセット理由 */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "🔄 今は やめておこう", reason: "" },
                      { label: "高すぎるよ", reason: "金額を 見直してみよう" },
                      { label: "理由を くわしく", reason: "もう少し くわしく 教えてね" },
                      { label: "貯めてからね", reason: "もう少し 貯めてからにしよう" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="text-[11px] px-2.5 py-1 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-100 active:scale-95 transition-all"
                        onClick={() => handleRejectSpend(spend.id, preset.reason)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ──── じぶんクエスト提案 ──── */}
      {questProposals.length > 0 && (
        <Card className="mb-4 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              ✨ クエスト ていあん
              <Badge variant="destructive">{questProposals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {questProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-100"
                >
                  <div className="mb-2">
                    <p className="font-bold text-sm">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      🧒 {displayName(proposal.child?.name)}
                    </p>
                    {proposal.proposal_message && (
                      <p className="text-xs text-emerald-600 mt-1">
                        💬 「{proposal.proposal_message}」
                      </p>
                    )}
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
                      className="w-20 h-8 text-sm text-center"
                    />
                    <span className="text-xs text-muted-foreground">えん</span>
                    {(proposalRewards[proposal.id] ?? proposal.reward_amount) !== proposal.reward_amount && (
                      <span className="text-[10px] text-amber-500">
                        （もと: ¥{proposal.reward_amount}）
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1 h-9"
                      onClick={() => handleApproveProposal(proposal.id)}
                    >
                      ✓ 承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-200 text-amber-600 hover:bg-amber-50 flex-1 h-9"
                      onClick={() => handleRejectProposal(proposal.id)}
                    >
                      🔄 こんどにしよう
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ──── 子供からのメッセージ ──── */}
      {childMessages.length > 0 && (
        <Card className="mb-4 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
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
                    className="p-3 rounded-xl bg-blue-50 border border-blue-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {msg.stamp && <span className="text-2xl flex-shrink-0">{msg.stamp}</span>}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-blue-800">
                            🧒 {displayName(fromName)}
                          </p>
                          {msg.message && (
                            <p className="text-sm text-blue-700 whitespace-pre-wrap mt-0.5 break-words">
                              {msg.message}
                            </p>
                          )}
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

      {/* ──── 投資注文 ──── */}
      {pendingInvestOrders.length > 0 && (
        <Card className="mb-4 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              🌱 とうし ちゅうもん
              <Badge className="bg-green-500">{pendingInvestOrders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingInvestOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl bg-green-50 border border-green-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm">{order.name}（{order.symbol}）</p>
                      <p className="text-xs text-muted-foreground">
                        🧒 {displayName(order.child?.name)} ・ ¥{order.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white flex-1 h-9"
                      onClick={() => handleApproveInvestOrder(order)}
                    >
                      ✓ 承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-200 text-amber-600 hover:bg-amber-50 flex-1 h-9"
                      onClick={() => handleRejectInvestOrder(order.id)}
                    >
                      🔄 こんどにしよう
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ──── 承認待ちゼロの場合 ──── */}
      {totalPending === 0 && children.length > 0 && taskCount > 0 && (
        <Card className="mb-4 border-emerald-100 bg-emerald-50/30">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-emerald-700">
              おつかれさま！
            </p>
            <p className="text-sm text-muted-foreground">
              承認待ちは ありません
            </p>
          </CardContent>
        </Card>
      )}

      {/* ──── お支払いまち（承認済み・未送金） ──── */}
      {unpaidSpends.length > 0 && (
        <Card className="mb-4 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              💸 お支払い まち
              <Badge className="bg-orange-500">{unpaidSpends.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidSpends.map((spend) => (
                <div
                  key={spend.id}
                  className="p-3 rounded-xl bg-orange-50 border border-orange-100"
                >
                  <div className="mb-2">
                    <p className="font-bold text-sm">
                      ¥{spend.amount.toLocaleString()} — {spend.purpose}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🧒 {displayName(spend.child?.name)}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    どうやって お支払い しましたか？
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "PayPay", method: "paypay", icon: "📱" },
                      { label: "B/43", method: "b43", icon: "💳" },
                      { label: "LINE Pay", method: "linepay", icon: "💚" },
                      { label: "げんきん", method: "cash", icon: "💴" },
                      { label: "そのほか", method: "other", icon: "✅" },
                    ].map((opt) => (
                      <button
                        key={opt.method}
                        type="button"
                        className="text-[11px] px-3 py-1.5 rounded-full border border-orange-200 text-orange-700 bg-white hover:bg-orange-100 active:scale-95 transition-all"
                        onClick={() => handleMarkPaid(spend.id, opt.method)}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {/* ──── 子供カード ──── */}
      {children.length > 0 && (
        <>
          <h2 className="text-base font-bold text-amber-800 mb-3 flex items-center gap-1.5">
            💰 お子さまの 残高
          </h2>
          <div className="grid gap-3">
            {children.map((child) => {
              const wallet = wallets[child.id];
              const total = wallet
                ? wallet.spending_balance + wallet.saving_balance + (wallet.invest_balance || 0)
                : 0;

              return (
                <Card key={child.id} className="border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-base">🧒 {displayName(child.name)}</span>
                      {total > 0 ? (
                        <span className="text-xl font-bold text-amber-700">
                          ¥{total.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          まだ コインが ありません
                        </span>
                      )}
                    </div>

                    {/* 3色残高 */}
                    <div className="grid grid-cols-3 gap-1.5 text-sm mb-3">
                      <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
                        <div className="text-base" aria-hidden="true">💰</div>
                        <p className="text-[10px] text-red-500 font-semibold">使う</p>
                        <p className="font-bold text-red-600 text-sm">
                          ¥{wallet?.spending_balance.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                        <div className="text-base" aria-hidden="true">🐷</div>
                        <p className="text-[10px] text-blue-500 font-semibold">貯める</p>
                        <p className="font-bold text-blue-600 text-sm">
                          ¥{wallet?.saving_balance.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
                        <div className="text-base" aria-hidden="true">🌱</div>
                        <p className="text-[10px] text-green-500 font-semibold">増やす</p>
                        <p className="font-bold text-green-600 text-sm">
                          ¥{wallet?.invest_balance?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* 分割比率設定 */}
                    {editingRatio === child.id ? (
                      <div className="p-4 rounded-xl bg-white border-2 border-amber-200">
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
                                split_ratio: tempSaveRatio,
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
                        className="w-full text-xs text-amber-600 hover:bg-amber-50"
                        onClick={() => {
                          setEditingRatio(child.id);
                          setTempSaveRatio(wallet?.save_ratio ?? wallet?.split_ratio ?? 30);
                          setTempInvestRatio(wallet?.invest_ratio ?? 0);
                        }}
                      >
                        ⚙️ 分割比率を 変更
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* おこさま追加 */}
      {children.length > 0 && children.length < 5 && (
        <Button
          variant="outline"
          className="w-full mt-3 border-dashed border-amber-300 text-amber-600 h-12 text-base"
          onClick={() => setAddChildOpen(true)}
        >
          ＋ お子さまを 追加
        </Button>
      )}
      <AddChildDialog
        open={addChildOpen}
        onClose={() => setAddChildOpen(false)}
        familyId={session?.familyId || ""}
        onAdded={loadData}
      />

      {/* 累計情報（さりげなく小さく表示） */}
      {stats.totalApproved > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          これまでの 承認: {stats.totalApproved}件 ・ 総額 ¥{stats.totalEarned.toLocaleString()}
        </p>
      )}

      {/* 承認スタンプダイアログ */}
      <ApprovalDialog
        open={!!approvalTarget}
        onClose={() => setApprovalTarget(null)}
        childName={displayName(approvalTarget?.child?.name)}
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
            🗑️ アカウントを 削除 する
          </Button>
        ) : (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-red-600 mb-2">⚠️ アカウント削除</p>
              <p className="text-xs text-red-500 mb-3">
                削除すると、家族の 全データ（クエスト・ウォレット・履歴）が なくなります。この操作は 取り消せません。
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                確認のため「削除する」と 入力 してください：
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
                  {deleting ? "削除中..." : "完全に 削除する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
