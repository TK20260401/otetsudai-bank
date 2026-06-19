"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { Task, TaskLog, Wallet, Transaction, SpendRequest, SavingGoal, Badge as BadgeType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskIconSvg from "@/components/task-icon-svg";

import GameStatusHeader from "@/components/game-status-header";
import RpgCard from "@/components/rpg-card";
import RpgButton from "@/components/rpg-button";
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
import RewardSequence from "@/components/reward-sequence";
import { getLevelProgress } from "@/lib/levels";
import { SelfQuestForm } from "@/components/self-quest-form";
import { LevelDisplay } from "@/components/level-display";
import { StampNotifications } from "@/components/stamp-notifications";
import { FamilyStampRelay } from "@/components/family-stamp-relay";
import { checkAndAwardBadges } from "@/lib/badges";
import { InvestPortfolio } from "@/components/invest-portfolio";
import { MoneyTree } from "@/components/money-tree";
import { FamilyChallengeCard } from "@/components/family-challenge-card";
import { InvestOrderDialog } from "@/components/invest-order-dialog";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { PixelCrossedSwordsIcon, PixelBarChartIcon, PixelFlameIcon, PixelChestOpenIcon, PixelCartIcon, PixelPiggyIcon, PixelSeedlingIcon, PixelCoinIcon, PixelScrollIcon, PixelStarIcon, PixelLightbulbIcon, PixelLetterIcon, PixelRefreshIcon, PixelConfettiIcon, PixelShieldIcon, PixelChatIcon } from "@/components/pixel-icons";
import QuestCardFrame from "@/components/quest-card-frame";
import { getQuestCardTier } from "@/lib/rpg-stats";
import PetDisplay from "@/components/pet-display";
import PetManagementDialog from "@/components/pet-management-dialog";
import TrophyCaseDialog from "@/components/trophy-case-dialog";
import DailyLoginModal from "@/components/daily-login-modal";
import { getDailyLoginStatus } from "@/lib/daily-login";
import ShopDialog from "@/components/shop-dialog";
import { getEquippedTitle, RARITY_COLORS, type ShopItem } from "@/lib/shop";
import EggDropAnimation from "@/components/egg-drop-animation";
import { getActivePet, processQuestCompletionForPets, hatchEgg, type PetType, type PetQuestResult } from "@/lib/pets";
import type { Pet } from "@/lib/types";

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
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petManageOpen, setPetManageOpen] = useState(false);
  const [trophyOpen, setTrophyOpen] = useState(false);
  const [dailyLoginOpen, setDailyLoginOpen] = useState(false);
  const [dailyLoginChecked, setDailyLoginChecked] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [equippedTitle, setEquippedTitle] = useState<ShopItem | null>(null);
  const [eggDrop, setEggDrop] = useState<PetType | null>(null);
  const [petResult, setPetResult] = useState<PetQuestResult | null>(null);
  const [selfQuestOpen, setSelfQuestOpen] = useState(false);
  const [pendingProposals, setPendingProposals] = useState(0);
  const [rejectedLogs, setRejectedLogs] = useState<(TaskLog & { task?: Task })[]>([]);
  const [pendingPayments, setPendingPayments] = useState<SpendRequest[]>([]);
  const [paidRecent, setPaidRecent] = useState<SpendRequest[]>([]);
  const [investOrderOpen, setInvestOrderOpen] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState({ quests: 0, earned: 0, streak: 0 });
  const [activeChallenge, setActiveChallenge] = useState<import("@/lib/types").FamilyChallenge | null>(null);
  const [familyChildren, setFamilyChildren] = useState<import("@/lib/types").User[]>([]);

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

    // 家族チャレンジ + メンバー取得
    if (session?.familyId) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const [chRes, memRes] = await Promise.all([
        supabase
          .from("otetsudai_family_challenges")
          .select("*")
          .eq("family_id", session.familyId)
          .lte("start_date", todayStr)
          .gte("end_date", todayStr)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("otetsudai_users")
          .select("*")
          .eq("family_id", session.familyId)
          .eq("role", "child"),
      ]);
      setActiveChallenge(chRes.data?.[0] || null);
      setFamilyChildren(memRes.data || []);
    }

    // ペット読み込み
    const pet = await getActivePet(childId);
    setActivePet(pet);

    // 装備中タイトル読み込み
    const title = await getEquippedTitle(childId);
    setEquippedTitle(title);

    setLoading(false);
  }, [childId, session?.familyId]);

  useEffect(() => {
    if (!session || session.role !== "child") {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    if (dailyLoginChecked) return;
    if (!wallet) return;
    setDailyLoginChecked(true);
    getDailyLoginStatus(childId).then((s) => {
      if (s.canClaimToday) setDailyLoginOpen(true);
    });
  }, [wallet, childId, dailyLoginChecked]);

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

    // ペット処理
    if (session?.familyId) {
      const result = await processQuestCompletionForPets(childId, session.familyId);
      setPetResult(result);
    }

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
      {(() => {
        const lv = getLevelProgress(total).current.level;
        const exp = getLevelProgress(total).progress;
        const hp = Math.min(100, Math.round((weeklySummary.streak / 7) * 100));
        return (
          <GameStatusHeader
            title={<span className="flex items-center gap-1"><PixelCrossedSwordsIcon size={16} /> バンク</span>}
            userName={session?.name}
            level={lv}
            hp={hp}
            mp={Math.min(10, weeklySummary.streak)}
            exp={exp}
            gold={total}
            backHref="/"
          />
        );
      })()}
      <p className="text-xs text-muted-foreground mb-3">{new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" })}</p>

      {/* レベル表示 */}
      <LevelDisplay childId={childId} />

      {/* 装備中タイトル */}
      {equippedTitle && (
        <div
          className="mx-auto mb-2 inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 text-xs font-bold"
          style={{
            borderColor: RARITY_COLORS[equippedTitle.rarity].border,
            backgroundColor: RARITY_COLORS[equippedTitle.rarity].bg,
            color: RARITY_COLORS[equippedTitle.rarity].text,
            display: "inline-flex",
          }}
        >
          <span>{equippedTitle.emoji}</span>
          <span>{equippedTitle.label}</span>
        </div>
      )}

      {/* ペット表示 */}
      <div className="mb-3 flex justify-center items-center gap-3">
        <PetDisplay
          pet={activePet}
          onTapEgg={async () => {
            if (activePet) {
              await hatchEgg(activePet.id);
              loadData();
            }
          }}
          onManage={() => setPetManageOpen(true)}
        />
        <button
          onClick={() => setShopOpen(true)}
          className="text-xs text-primary hover:text-accent border border-primary/40 rounded-full px-3 py-1 transition-colors"
          aria-label="ショップを ひらく"
        >
          🏪 ショップ
        </button>
      </div>

      <PetManagementDialog
        open={petManageOpen}
        onClose={() => setPetManageOpen(false)}
        childId={childId}
        onChanged={loadData}
      />

      {/* おやからのスタンプ通知 */}
      <StampNotifications childId={childId} />

      {/* 家族チャレンジ */}
      {activeChallenge && session?.familyId && (
        <FamilyChallengeCard
          challenge={activeChallenge}
          children={familyChildren}
          familyId={session.familyId}
        />
      )}

      {/* ファミリースタンプリレー */}
      {session?.familyId && (
        <FamilyStampRelay userId={childId} familyId={session.familyId} />
      )}

      {/* 装備（バッジ）表示 — 常時表示 */}
      <div className="mb-3">
        <button
          onClick={() => setTrophyOpen(true)}
          className="w-full text-left"
          aria-label="トロフィーケースをひらく"
        >
          {badges.length > 0 ? (
            <BadgeDisplay badges={badges} />
          ) : (
            <div className="bg-muted rounded-xl p-4 border border-border text-center hover:border-primary/50 transition-colors">
              <p className="text-sm font-bold text-muted-foreground mb-2 flex items-center justify-center gap-1"><PixelShieldIcon size={16} /> <R k="装備" r="そうび" /></p>
              <div className="flex justify-center gap-3 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground text-lg">？</div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70">クエストをクリアして <R k="装備" r="そうび" />をあつめよう！</p>
            </div>
          )}
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-1">
          タップで トロフィーケースを ひらく
        </p>
      </div>

      <TrophyCaseDialog
        open={trophyOpen}
        onClose={() => setTrophyOpen(false)}
        childId={childId}
      />

      <DailyLoginModal
        open={dailyLoginOpen}
        onClose={() => setDailyLoginOpen(false)}
        childId={childId}
        walletId={wallet?.id ?? null}
        onClaimed={loadData}
      />

      <ShopDialog
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        childId={childId}
        walletId={wallet?.id ?? null}
        spendingBalance={wallet?.spending_balance ?? 0}
        onChanged={loadData}
      />

      {/* 週次サマリー */}
      {weeklySummary.quests > 0 && (
        <RpgCard
          tier="violet"
          className="mb-4"
          title={<><PixelBarChartIcon size={16} /> こんしゅうの きろく</>}
        >
          <div className="flex justify-around py-1">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{weeklySummary.quests}</p>
              <p className="text-xs text-muted-foreground">クエスト</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">¥{weeklySummary.earned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground"><R k="稼" r="かせ" />いだ</p>
            </div>
            {weeklySummary.streak > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-accent flex items-center justify-center gap-0.5"><PixelFlameIcon size={18} />{weeklySummary.streak}</p>
                <p className="text-xs text-muted-foreground"><R k="連続" r="れんぞく" /><R k="日" r="にち" /></p>
              </div>
            )}
          </div>
        </RpgCard>
      )}

      {/* Piggy Bank */}
      <RpgCard tier="gold" className="mb-4">
        <div className="p-4 text-center">
          <div className={`mb-2 flex items-center justify-center gap-1 transition-transform duration-500 ${total >= 5000 ? "scale-125" : total >= 1000 ? "scale-110" : "scale-100"}`}>
            <PixelChestOpenIcon size={48} />
            {total >= 5000 && <PixelStarIcon size={20} />}
          </div>
          <p className="text-3xl font-bold text-primary drop-shadow-[0_2px_8px_rgba(255,166,35,0.55)]">
            ¥{total.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mb-4"><R k="全部" r="ぜんぶ" />のお<R k="金" r="かね" /></p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary/60 rounded-xl p-2 border border-border">
              <p className="text-[10px] text-[#ff6b6b] font-semibold">
                <span className="flex items-center gap-0.5"><PixelCartIcon size={12} /> <R k="取" r="とり" /><R k="引" r="ひき" /></span>
              </p>
              <p className="text-base font-bold text-[#ff6b6b]">
                ¥{(wallet?.spending_balance ?? 0).toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight">しょうにんと とりひき</p>
              <RpgButton
                tier="ruby"
                size="sm"
                fullWidth
                className="mt-1 h-6 px-1 text-[10px]"
                onClick={() => { setSpendOpen(true); setSpendError(""); setSpendSuccess(false); }}
              >
                <PixelCartIcon size={10} /> <R k="使" r="つか" />う
              </RpgButton>
            </div>
            <div className="bg-secondary/60 rounded-xl p-2 border border-border">
              <p className="text-[10px] text-[#5dade2] font-semibold">
                <span className="flex items-center gap-0.5"><PixelPiggyIcon size={12} /> <R k="金" r="きん" /><R k="庫" r="こ" /></span>
              </p>
              <p className="text-base font-bold text-[#5dade2]">
                ¥{(wallet?.saving_balance ?? 0).toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight">たからを しまう</p>
            </div>
            <div className="bg-secondary/60 rounded-xl p-2 border border-border">
              <p className="text-[10px] text-[#58d68d] font-semibold">
                <span className="flex items-center gap-0.5"><PixelSeedlingIcon size={12} /> <R k="錬" r="れん" /><R k="成" r="せい" /></span>
              </p>
              <p className="text-base font-bold text-[#58d68d]">
                ¥{(wallet?.invest_balance ?? 0).toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight">お金を そだてる</p>
            </div>
          </div>

        </div>
      </RpgCard>

      {/* 貯金目標 */}
      <SavingGoalSection
        childId={childId}
        savingBalance={wallet?.saving_balance || 0}
        goals={savingGoals}
        onUpdate={loadData}
      />

      {/* ふやすの木 */}
      {wallet && (
        <div className="mb-4">
          <MoneyTree investBalance={wallet.invest_balance ?? 0} />
        </div>
      )}

      {/* 投資ポートフォリオ（全員に常時表示） */}
      {wallet && (
        <div className="mb-4">
          <InvestPortfolio
            childId={childId}
            investBalance={wallet.invest_balance ?? 0}
          />
          {(wallet.invest_balance ?? 0) > 0 && (
            <RpgButton
              tier="emerald"
              size="lg"
              fullWidth
              className="mt-2"
              onClick={() => setInvestOrderOpen(true)}
            >
              <PixelSeedlingIcon size={16} /> <R k="株" r="かぶ" />を <R k="買" r="か" />いたい！
            </RpgButton>
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
          <RpgCard
            tier="gold"
            className="mb-4"
            title={<><PixelCrossedSwordsIcon size={16} /> <R k="今日" r="きょう" />のクエスト</>}
          >
            <div className="space-y-2 py-1">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TaskIconSvg title={task.title} size={24} />
                    <span className="text-sm font-medium text-card-foreground"><AutoRuby text={task.title} /></span>
                  </div>
                  <RpgButton
                    tier="emerald"
                    size="sm"
                    onClick={() => handleComplete(task)}
                    disabled={submitting === task.id}
                  >
                    {submitting === task.id ? "..." : "クリア！"}
                  </RpgButton>
                </div>
              ))}
            </div>
          </RpgCard>
        );
      })()}

      {/* じぶんクエストを つくる */}
      <div className="mb-4">
        <RpgButton
          tier="violet"
          size="lg"
          fullWidth
          onClick={() => setSelfQuestOpen(true)}
        >
          <PixelLightbulbIcon size={18} /> <R k="自分" r="じぶん" />クエストを <R k="作" r="つく" />る
        </RpgButton>
        {pendingProposals > 0 && (
          <p className="text-center text-xs text-amber-600 mt-1">
            <span className="inline-flex items-center gap-0.5"><PixelLetterIcon size={12} /> {pendingProposals}<R k="件" r="けん" />の <R k="提案" r="ていあん" />が <R k="承認待" r="しょうにんま" />ちだよ</span>
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
        <TabsList variant="rpg" className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks"><span className="flex items-center gap-1"><PixelCrossedSwordsIcon size={14} /> クエスト</span></TabsTrigger>
          <TabsTrigger value="history"><span className="flex items-center gap-1"><PixelScrollIcon size={14} /> <R k="履歴" r="りれき" /></span></TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks" className="space-y-3 mt-3">
          {tasks.length === 0 ? (
            <Card className="border-primary/30 bg-card">
              <CardContent className="p-6 text-center text-muted-foreground">
                <R k="今" r="いま" />できるクエストはないよ 😴
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <QuestCardFrame key={task.id} tier={getQuestCardTier(task)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5"><TaskIconSvg title={task.title} size={32} /></span>
                      <div>
                        <p className="font-semibold text-lg"><AutoRuby text={task.title} /></p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            <AutoRuby text={task.description} />
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30">
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
                    <RpgButton
                      tier="emerald"
                      size="md"
                      onClick={() => handleComplete(task)}
                      disabled={submitting === task.id}
                    >
                      {submitting === task.id ? "..." : <>クリア！<PixelCrossedSwordsIcon size={14} /></>}
                    </RpgButton>
                  </div>
              </QuestCardFrame>
            ))
          )}
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history" className="mt-3">
          <RpgCard
            tier="silver"
            title={<><PixelScrollIcon size={16} /> <R k="最近" r="さいきん" />の<R k="履歴" r="りれき" /></>}
          >
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                まだ<R k="履歴" r="りれき" />がないよ
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        <span className="inline-flex mr-1">{tx.type === "earn"
                          ? <PixelCoinIcon size={14} />
                          : tx.type === "spend"
                            ? <PixelCartIcon size={14} />
                            : <PixelPiggyIcon size={14} />}</span>
                        <AutoRuby text={tx.description || tx.type} />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${tx.type === "earn" ? "text-[#58d68d]" : "text-[#ff6b6b]"}`}
                    >
                      {tx.type === "earn" ? "+" : "-"}¥
                      {tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </RpgCard>
        </TabsContent>
      </Tabs>
      {/* おしはらい ステータス */}
      {pendingPayments.length > 0 && (
        <Card className="mt-4 border-primary/60 bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-1"><PixelCoinIcon size={16} /> <R k="親" r="おや" />が お<R k="金" r="かね" />を <R k="準備" r="じゅんび" /> しているよ</p>
            {pendingPayments.map((sp) => (
              <div key={sp.id} className="text-sm mb-1 p-2 rounded-lg bg-secondary/60 border border-border">
                <span className="font-bold text-accent">¥{sp.amount.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1.5">{sp.purpose}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {paidRecent.length > 0 && (
        <Card className="mt-4 border-[#2ecc71]/40 bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#58d68d] mb-2 flex items-center gap-1"><PixelConfettiIcon size={16} /> お<R k="金" r="かね" />を もらったよ！</p>
            {paidRecent.map((sp) => (
              <div key={sp.id} className="text-sm mb-1 p-2 rounded-lg bg-secondary/60 border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#58d68d]">¥{sp.amount.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1.5">{sp.purpose}</span>
                </div>
                <span className="text-xs text-[#58d68d]">
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
        <Card className="mt-4 border-[#e74c3c]/40 bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#ff6b6b] mb-2 flex items-center gap-1"><PixelRefreshIcon size={16} /> やり<R k="直" r="なお" />し クエスト</p>
            {rejectedLogs.map((log) => (
              <div key={log.id} className="text-sm mb-2 p-2 rounded-lg bg-secondary/60 border border-border">
                <p className="font-semibold text-card-foreground">{log.task?.title}</p>
                {log.reject_reason ? (
                  <p className="text-xs text-[#ff6b6b] mt-0.5">💬 {log.reject_reason}</p>
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
        <Card className="mt-4 border-[#3498db]/40 bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#5dade2] mb-2 flex items-center gap-1"><PixelRefreshIcon size={16} /> <R k="使" r="つか" />う リクエストの やり<R k="直" r="なお" />し</p>
            {rejectedSpends.map((sr) => (
              <div key={sr.id} className="text-sm mb-2 p-2 rounded-lg bg-secondary/60 border border-border">
                <p className="font-semibold text-card-foreground">
                  ¥{sr.amount.toLocaleString()} — {sr.purpose}
                </p>
                {sr.reject_reason ? (
                  <p className="text-xs text-[#5dade2] mt-0.5">💬 {sr.reject_reason}</p>
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
            <DialogTitle><span className="flex items-center gap-1"><PixelCartIcon size={18} /> お<R k="金" r="かね" />を<R k="使" r="つか" />う</span></DialogTitle>
          </DialogHeader>
          {spendSuccess ? (
            <div className="text-center py-4">
              <div className="mb-2 flex justify-center"><PixelLetterIcon size={40} /></div>
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
              <RpgButton
                tier="sapphire"
                size="lg"
                fullWidth
                onClick={handleSpendRequest}
              >
                <R k="親" r="おや" />に お<R k="願" r="ねが" />いする
              </RpgButton>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RewardSequence
        show={showCoinAnim}
        level={wallet ? getLevelProgress(wallet.spending_balance + wallet.saving_balance + (wallet.invest_balance ?? 0)).current.level : 1}
        onComplete={() => {
          setShowCoinAnim(false);
          if (petResult?.eggDropped) {
            setEggDrop(petResult.eggDropped);
            setPetResult(null);
          }
        }}
      />

      {/* 卵ドロップ演出 */}
      {eggDrop && (
        <EggDropAnimation
          show
          petType={eggDrop}
          onComplete={() => { setEggDrop(null); loadData(); }}
        />
      )}
    </div>
  );
}
