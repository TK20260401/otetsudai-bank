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

import GameStatusHeader from "@/components/game-status-header";
import RpgCard from "@/components/rpg-card";
import RpgButton from "@/components/rpg-button";
import RewardSplitSlider from "@/components/reward-split-slider";
import { PaymentLinkDialog } from "@/components/payment-link";
import { AddChildDialog } from "@/components/add-child-dialog";
import { ApprovalDialog } from "@/components/approval-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { FamilyStampRelay } from "@/components/family-stamp-relay";
import { MonthlyReport } from "@/components/monthly-report";
import { FamilyAdventureMap } from "@/components/family-adventure-map";
import { FamilyChallengeCard } from "@/components/family-challenge-card";
import { PixelCrossedSwordsIcon, PixelScrollIcon, PixelHourglassIcon, PixelCartIcon, PixelStarIcon, PixelChatIcon, PixelSeedlingIcon, PixelConfettiIcon, PixelBarChartIcon, PixelLetterIcon, PixelCoinIcon, PixelPiggyIcon, PixelChartIcon, PixelTrashIcon, PixelWarningIcon, PixelCheckIcon, PixelRefreshIcon } from "@/components/pixel-icons";

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
  const [familyName, setFamilyName] = useState("");
  const [activeChallenge, setActiveChallenge] = useState<import("@/lib/types").FamilyChallenge | null>(null);

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

    // 家族名取得
    if (session.familyId) {
      const { data: famData } = await supabase
        .from("otetsudai_families")
        .select("name")
        .eq("id", session.familyId)
        .single();
      if (famData) setFamilyName(famData.name);

      // アクティブな家族チャレンジ
      const todayStr = new Date().toISOString().slice(0, 10);
      const { data: challengeData } = await supabase
        .from("otetsudai_family_challenges")
        .select("*")
        .eq("family_id", session.familyId)
        .lte("start_date", todayStr)
        .gte("end_date", todayStr)
        .order("created_at", { ascending: false })
        .limit(1);
      setActiveChallenge(challengeData?.[0] || null);
    }

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
      <GameStatusHeader
        title={<span className="flex items-center gap-1"><PixelCrossedSwordsIcon size={18} /> クエストマスター</span>}
        userName={displayName(session?.name)}
        level={Math.max(1, children.length)}
        hp={Math.min(100, totalPending === 0 && children.length > 0 ? 100 : Math.max(30, 100 - totalPending * 10))}
        mp={Math.min(10, children.length * 2)}
        exp={Math.min(100, Math.round((weeklySummary.quests / Math.max(1, children.length * 7)) * 100))}
        gold={stats.totalEarned}
        pendingCount={totalPending}
        backHref="/"
        rightActions={
          <Link href="/parent/tasks">
            <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] border-primary/60 text-primary hover:bg-primary/10">
              <span className="flex items-center gap-0.5"><PixelScrollIcon size={12} /> 管理</span>
            </Button>
          </Link>
        }
      />

      {/* ──── ウェルカム / 空状態 ──── */}
      {children.length === 0 ? (
        <RpgCard tier="gold" className="mb-6">
          <div className="py-8 text-center space-y-3">
            <div className="text-5xl">👨‍👩‍👧‍👦</div>
            <p className="text-lg font-bold text-primary drop-shadow-[0_1px_6px_rgba(255,166,35,0.45)]">
              ようこそ クエストマスター！
            </p>
            <p className="text-sm text-muted-foreground">
              まずは お子さまを 追加して<br />冒険を はじめましょう！
            </p>
            <RpgButton tier="gold" size="lg" onClick={() => setAddChildOpen(true)}>
              ＋ お子さまを 追加
            </RpgButton>
          </div>
        </RpgCard>
      ) : taskCount === 0 && totalPending === 0 ? (
        <RpgCard tier="gold" className="mb-6">
          <div className="py-6 text-center space-y-3">
            <div className="text-5xl flex justify-center"><PixelCrossedSwordsIcon size={48} /></div>
            <p className="text-lg font-bold text-[#58d68d]">
              クエストを つくって<br />冒険を はじめよう！
            </p>
            <p className="text-sm text-muted-foreground">
              お子さまが 挑戦する クエスト（お手伝い）を つくりましょう
            </p>
            <Link href="/parent/tasks">
              <RpgButton tier="emerald" size="lg">
                <PixelScrollIcon size={16} /> クエストを つくる
              </RpgButton>
            </Link>
          </div>
        </RpgCard>
      ) : null}

      {/* ──── 週次サマリー ──── */}
      {weeklySummary.quests > 0 && (
        <RpgCard
          tier="violet"
          className="mb-4"
          title={<><PixelBarChartIcon size={18} /> 今週の家族記録</>}
        >
          <div className="flex justify-around py-1">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{weeklySummary.quests}</p>
              <p className="text-xs text-muted-foreground">クエスト完了</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">¥{weeklySummary.earned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">支払い</p>
            </div>
          </div>
        </RpgCard>
      )}

      {/* ──── 承認待ちサマリー ──── */}
      {totalPending > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-primary/10 border border-primary/40 text-center">
          <p className="text-lg font-bold text-primary flex items-center justify-center gap-1">
            <PixelLetterIcon size={20} /> {totalPending}件の 承認待ち！
          </p>
        </div>
      )}

      {/* ──── クエスト完了 承認キュー ──── */}
      {pendingLogs.length > 0 && (
        <RpgCard
          tier="gold"
          className="mb-4"
          title={<><PixelHourglassIcon size={18} /> クエスト かんりょう <Badge variant="destructive">{pendingLogs.length}</Badge></>}
        >
          <div className="space-y-3">
              {pendingLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-secondary/60 border border-primary/40"
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
                      className="bg-[#2ecc71] hover:bg-[#27ae60] text-white h-9 px-3 flex-shrink-0 ml-2"
                      onClick={() => setApprovalTarget(log)}
                    >
                      <span className="flex items-center gap-0.5"><PixelCheckIcon size={12} /> 承認</span>
                    </Button>
                  </div>
                  {/* やりなおしプリセット理由 */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "やり直し", reason: "" },
                      { label: "もう少し 丁寧に", reason: "もう少し 丁寧に やってみよう" },
                      { label: "最後まで やろう", reason: "最後まで やりきろう！" },
                      { label: "時間を かけてね", reason: "もう少し 時間を かけてみよう" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary bg-secondary/60 hover:bg-primary/20 active:scale-95 transition-all"
                        onClick={() => handleReject(log.id, preset.reason)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </RpgCard>
      )}

      {/* ──── 支出リクエスト ──── */}
      {pendingSpends.length > 0 && (
        <RpgCard
          tier="silver"
          className="mb-4"
          title={<><PixelCartIcon size={18} /> つかいたい リクエスト <Badge variant="destructive">{pendingSpends.length}</Badge></>}
        >
          <div className="space-y-2">
              {pendingSpends.map((spend) => (
                <div
                  key={spend.id}
                  className="p-3 rounded-xl bg-secondary/60 border border-[#3498db]/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-card-foreground">¥{spend.amount.toLocaleString()} — {spend.purpose}</p>
                      <p className="text-xs text-muted-foreground">
                        🧒 {displayName(spend.child?.name)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#2ecc71] hover:bg-[#27ae60] text-white h-9 px-3 flex-shrink-0 ml-2"
                      onClick={() => handleApproveSpend(spend)}
                    >
                      <span className="flex items-center gap-0.5"><PixelCheckIcon size={12} /> OK</span>
                    </Button>
                  </div>
                  {/* やりなおしプリセット理由 */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "今は やめておこう", reason: "" },
                      { label: "高すぎるよ", reason: "金額を 見直してみよう" },
                      { label: "理由を くわしく", reason: "もう少し くわしく 教えてね" },
                      { label: "貯めてからね", reason: "もう少し 貯めてからにしよう" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="text-[11px] px-2.5 py-1 rounded-full border border-[#3498db]/40 text-[#5dade2] bg-secondary/60 hover:bg-[#3498db]/20 active:scale-95 transition-all"
                        onClick={() => handleRejectSpend(spend.id, preset.reason)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </RpgCard>
      )}

      {/* ──── じぶんクエスト提案 ──── */}
      {questProposals.length > 0 && (
        <RpgCard
          tier="gold"
          className="mb-4"
          title={<><PixelStarIcon size={18} /> クエスト ていあん <Badge variant="destructive">{questProposals.length}</Badge></>}
        >
          <div className="space-y-2">
              {questProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-3 rounded-xl bg-secondary/60 border border-[#2ecc71]/40"
                >
                  <div className="mb-2">
                    <p className="font-bold text-sm text-card-foreground">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      🧒 {displayName(proposal.child?.name)}
                    </p>
                    {proposal.proposal_message && (
                      <p className="text-xs text-[#58d68d] mt-1">
                        <span className="inline-flex items-center gap-0.5"><PixelChatIcon size={14} /> 「{proposal.proposal_message}」</span>
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
                      <span className="text-[10px] text-primary">
                        （もと: ¥{proposal.reward_amount}）
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#2ecc71] hover:bg-[#27ae60] text-white flex-1 h-9"
                      onClick={() => handleApproveProposal(proposal.id)}
                    >
                      <span className="flex items-center gap-0.5"><PixelCheckIcon size={12} /> 承認</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/60 text-primary hover:bg-primary/10 flex-1 h-9"
                      onClick={() => handleRejectProposal(proposal.id)}
                    >
                      <span className="flex items-center gap-0.5"><PixelRefreshIcon size={12} /> こんどにしよう</span>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </RpgCard>
      )}

      {/* ──── 子供からのメッセージ ──── */}
      {childMessages.length > 0 && (
        <RpgCard
          tier="silver"
          className="mb-4"
          title={<><PixelChatIcon size={18} /> こどもからの メッセージ <Badge variant="destructive">{childMessages.length}</Badge></>}
        >
          <div className="space-y-2">
              {childMessages.map((msg: { id: string; message: string; stamp: string | null; created_at: string; from_user?: { name: string } | { name: string }[] }) => {
                const fromName = Array.isArray(msg.from_user) ? msg.from_user[0]?.name : msg.from_user?.name;
                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-secondary/60 border border-[#3498db]/40"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {msg.stamp && <span className="text-2xl flex-shrink-0">{msg.stamp}</span>}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#5dade2]">
                            🧒 {displayName(fromName)}
                          </p>
                          {msg.message && (
                            <p className="text-sm text-card-foreground whitespace-pre-wrap mt-0.5 break-words">
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
                        className="text-[#5dade2] hover:text-[#5dade2] hover:bg-[#3498db]/10 text-xs flex-shrink-0"
                        onClick={() => handleMarkRead(msg.id)}
                      >
                        <span className="flex items-center gap-0.5"><PixelCheckIcon size={12} /> よんだ</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </RpgCard>
      )}

      {/* ──── ファミリースタンプリレー ──── */}
      {session?.familyId && (
        <FamilyStampRelay userId={session.userId} familyId={session.familyId} isParent />
      )}

      {/* ──── 投資注文 ──── */}
      {pendingInvestOrders.length > 0 && (
        <RpgCard
          tier="violet"
          className="mb-4"
          title={<><PixelSeedlingIcon size={18} /> とうし ちゅうもん <Badge className="bg-[#2ecc71] text-white">{pendingInvestOrders.length}</Badge></>}
        >
            <div className="space-y-2">
              {pendingInvestOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl bg-secondary/60 border border-[#2ecc71]/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-card-foreground">{order.name}（{order.symbol}）</p>
                      <p className="text-xs text-muted-foreground">
                        🧒 {displayName(order.child?.name)} ・ ¥{order.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#2ecc71] hover:bg-[#27ae60] text-white flex-1 h-9"
                      onClick={() => handleApproveInvestOrder(order)}
                    >
                      <span className="flex items-center gap-0.5"><PixelCheckIcon size={12} /> 承認</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/60 text-primary hover:bg-primary/10 flex-1 h-9"
                      onClick={() => handleRejectInvestOrder(order.id)}
                    >
                      <span className="flex items-center gap-0.5"><PixelRefreshIcon size={12} /> こんどにしよう</span>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </RpgCard>
      )}

      {/* ──── 承認待ちゼロの場合 ──── */}
      {totalPending === 0 && children.length > 0 && taskCount > 0 && (
        <RpgCard tier="violet" className="mb-4">
          <div className="py-6 text-center">
            <div className="text-4xl mb-2 flex justify-center"><PixelConfettiIcon size={40} /></div>
            <p className="font-bold text-[#58d68d] drop-shadow-[0_1px_6px_rgba(46,204,113,0.4)]">
              おつかれさま！
            </p>
            <p className="text-sm text-muted-foreground">
              承認待ちは ありません
            </p>
          </div>
        </RpgCard>
      )}

      {/* ──── お支払いまち（承認済み・未送金） ──── */}
      {unpaidSpends.length > 0 && (
        <RpgCard
          tier="gold"
          className="mb-4"
          title={<><PixelCoinIcon size={18} /> お支払い まち <Badge className="bg-primary text-primary-foreground">{unpaidSpends.length}</Badge></>}
        >
          <div className="space-y-3">
              {unpaidSpends.map((spend) => (
                <div
                  key={spend.id}
                  className="p-3 rounded-xl bg-secondary/60 border border-primary/40"
                >
                  <div className="mb-2">
                    <p className="font-bold text-sm text-card-foreground">
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
                        className="text-[11px] px-3 py-1.5 rounded-full border border-primary/40 text-primary bg-secondary/60 hover:bg-primary/20 active:scale-95 transition-all"
                        onClick={() => handleMarkPaid(spend.id, opt.method)}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </RpgCard>
      )}

      <Separator className="my-6" />

      {/* ──── 冒険の地図 ──── */}
      {children.length > 0 && (
        <FamilyAdventureMap
          familyName={familyName || "かぞく"}
          children={children}
          wallets={wallets}
        />
      )}

      {/* ──── 家族チャレンジ ──── */}
      {session?.familyId && (
        <FamilyChallengeCard
          challenge={activeChallenge}
          children={children}
          familyId={session.familyId}
          isParent
          onCreated={loadData}
        />
      )}

      {/* ──── 子供カード ──── */}
      {children.length > 0 && (
        <>
          <h2 className="text-base font-bold text-primary mb-3 flex items-center gap-1.5">
            <PixelCoinIcon size={18} /> お子さまの 残高
          </h2>
          <div className="grid gap-3">
            {children.map((child) => {
              const wallet = wallets[child.id];
              const total = wallet
                ? wallet.spending_balance + wallet.saving_balance + (wallet.invest_balance || 0)
                : 0;

              return (
                <RpgCard key={child.id} tier="gold">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-base text-card-foreground">🧒 {displayName(child.name)}</span>
                      {total > 0 ? (
                        <span className="text-xl font-bold text-primary drop-shadow-[0_1px_6px_rgba(255,166,35,0.4)]">
                          ¥{total.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          まだ コインが ありません
                        </span>
                      )}
                    </div>

                    {/* 3色残高（RPG強テーマ並列表記） */}
                    <div className="grid grid-cols-3 gap-1.5 text-sm mb-3">
                      <div className="bg-secondary/60 rounded-lg p-2 text-center border border-[#e74c3c]/40">
                        <div className="text-base flex justify-center" aria-hidden="true"><PixelCoinIcon size={20} /></div>
                        <p className="text-[10px] text-[#ff6b6b] font-semibold">取引（使う）</p>
                        <p className="font-bold text-[#ff6b6b] text-sm">
                          ¥{wallet?.spending_balance.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-secondary/60 rounded-lg p-2 text-center border border-[#3498db]/40">
                        <div className="text-base flex justify-center" aria-hidden="true"><PixelPiggyIcon size={20} /></div>
                        <p className="text-[10px] text-[#5dade2] font-semibold">金庫（貯める）</p>
                        <p className="font-bold text-[#5dade2] text-sm">
                          ¥{wallet?.saving_balance.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-secondary/60 rounded-lg p-2 text-center border border-[#2ecc71]/40">
                        <div className="text-base flex justify-center" aria-hidden="true"><PixelSeedlingIcon size={20} /></div>
                        <p className="text-[10px] text-[#58d68d] font-semibold">錬成（増やす）</p>
                        <p className="font-bold text-[#58d68d] text-sm">
                          ¥{wallet?.invest_balance?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* 分割比率設定 */}
                    {editingRatio === child.id ? (
                      <div className="p-4 rounded-xl bg-secondary/60 border-2 border-primary/40">
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
                          <Button size="sm" className="bg-primary hover:bg-accent text-primary-foreground" onClick={async () => {
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
                        className="w-full text-xs text-primary hover:bg-primary/10"
                        onClick={() => {
                          setEditingRatio(child.id);
                          setTempSaveRatio(wallet?.save_ratio ?? wallet?.split_ratio ?? 30);
                          setTempInvestRatio(wallet?.invest_ratio ?? 0);
                        }}
                      >
                        分割比率を 変更
                      </Button>
                    )}

                    {/* 月次レポート */}
                    <MonthlyReport child={child} wallet={wallet || null} />
                  </div>
                </RpgCard>
              );
            })}
          </div>
        </>
      )}

      {/* おこさま追加 */}
      {children.length > 0 && children.length < 5 && (
        <div className="mt-3">
          <RpgButton tier="gold" size="md" fullWidth onClick={() => setAddChildOpen(true)}>
            ＋ お子さまを 追加
          </RpgButton>
        </div>
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
      <div className="mt-8 pt-4 border-t border-border">
        {!showDeleteConfirm ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#ff6b6b] hover:text-[#ff6b6b] hover:bg-[#e74c3c]/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <span className="flex items-center gap-1"><PixelTrashIcon size={14} /> アカウントを 削除 する</span>
          </Button>
        ) : (
          <Card className="border-[#e74c3c]/60 bg-card">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-[#ff6b6b] mb-2 flex items-center gap-1"><PixelWarningIcon size={16} /> アカウント削除</p>
              <p className="text-xs text-[#ff6b6b]/80 mb-3">
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
                  className="bg-[#e74c3c] hover:bg-[#c0392b] text-white"
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
