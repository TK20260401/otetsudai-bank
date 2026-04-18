"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLevelProgress } from "@/lib/levels";
import { Progress } from "@/components/ui/progress";
import { R, RubyStr } from "@/components/ruby-text";
import CharacterSvg from "@/components/character-svg";
import { PixelSwordIcon } from "@/components/pixel-icons";
import RpgStatusBar from "@/components/rpg-status-bar";
import EquipmentView from "@/components/equipment-view";
import { calculateRpgStats } from "@/lib/rpg-stats";

type Mood = "active" | "normal" | "lonely";

type Props = {
  childId: string;
};

export function LevelDisplay({ childId }: Props) {
  const [totalEarned, setTotalEarned] = useState(0);
  const [mood, setMood] = useState<Mood>("normal");
  const [loaded, setLoaded] = useState(false);
  const [daysActive7, setDaysActive7] = useState(0);
  const [savingWeeks, setSavingWeeks] = useState(0);
  const [totalQuests, setTotalQuests] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("otetsudai_task_logs")
        .select("*, task:otetsudai_tasks(reward_amount)")
        .eq("child_id", childId)
        .eq("status", "approved");

      const total = (data || []).reduce(
        (sum: number, log: { task?: { reward_amount: number } }) =>
          sum + (log.task?.reward_amount || 0),
        0
      );
      setTotalEarned(total);

      // 機嫌判定：直近のクエスト活動に基づく
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const recentLogs = (data || []).filter(
        (log: { approved_at?: string }) =>
          log.approved_at && new Date(log.approved_at) >= threeDaysAgo
      );
      if (recentLogs.length >= 1) {
        setMood("active");
      } else {
        setMood(data && data.length > 0 ? "lonely" : "normal");
      }

      // HP: 過去7日間のアクティブ日数
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeDays = new Set(
        (data || [])
          .filter((log: { approved_at?: string }) => log.approved_at && new Date(log.approved_at) >= sevenDaysAgo)
          .map((log: { approved_at?: string }) => new Date(log.approved_at!).toDateString())
      );
      setDaysActive7(activeDays.size);

      setTotalQuests((data || []).length);

      // ストリーク計算
      const allLogDays = [...new Set(
        (data || []).filter((l: { approved_at?: string }) => l.approved_at)
          .map((l: { approved_at?: string }) => new Date(l.approved_at!).toDateString())
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      let streak = 0;
      const today = new Date(); today.setHours(0,0,0,0);
      const check = new Date(today);
      if (allLogDays.length > 0 && allLogDays[0] !== check.toDateString()) check.setDate(check.getDate() - 1);
      while (allLogDays.includes(check.toDateString())) { streak++; check.setDate(check.getDate() - 1); }
      setStreakDays(streak);

      // バッジ数
      const { count: bc } = await supabase.from("otetsudai_badges").select("id", { count: "exact", head: true }).eq("child_id", childId);
      setBadgeCount(bc || 0);

      // MP: 簡易的に直近の貯金アクティビティ週数（ログ日数/7の概算）
      const allDays = new Set(
        (data || [])
          .filter((log: { approved_at?: string }) => log.approved_at)
          .map((log: { approved_at?: string }) => {
            const d = new Date(log.approved_at!);
            return `${d.getFullYear()}-W${Math.ceil((d.getDate()) / 7)}`;
          })
      );
      setSavingWeeks(Math.min(allDays.size, 10));

      setLoaded(true);
    }
    load();
  }, [childId]);

  if (!loaded) return null;

  const { current, next, progress, remaining } = getLevelProgress(totalEarned);

  const greeting =
    mood === "active"
      ? current.greetingActive
      : mood === "lonely"
        ? current.greetingLonely
        : current.greeting;

  const moodBorder =
    mood === "active"
      ? "border-[#2ecc71]/50 shadow-[0_0_14px_rgba(46,204,113,0.25)]"
      : mood === "lonely"
        ? "border-[#3498db]/40 shadow-[0_0_12px_rgba(52,152,219,0.22)]"
        : "border-primary/50 shadow-[0_0_14px_rgba(255,166,35,0.28)]";

  return (
    <div className={`bg-card rounded-xl p-4 mb-4 border-2 ${moodBorder}`}>
      <div className="flex items-start gap-3">
        {/* キャラクターSVG表示 */}
        <div className="flex flex-col items-center gap-1 min-w-[72px]">
          <CharacterSvg level={current.level} mood={mood} size={72} />
          <span className="text-[10px] text-muted-foreground"><RubyStr text={current.appearance} /></span>
        </div>

        {/* ステータス */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-bold text-primary text-sm leading-relaxed break-words drop-shadow-[0_1px_4px_rgba(255,166,35,0.35)]">
              Lv.{current.level} <RubyStr text={current.title} />
            </p>
          </div>

          {/* セリフ吹き出し */}
          <div className="relative bg-secondary/60 rounded-lg px-3 py-1.5 mt-1 mb-2 border border-primary/30">
            <div className="absolute -left-1.5 top-2 w-0 h-0 border-t-4 border-t-transparent border-r-6 border-r-secondary/60 border-b-4 border-b-transparent" />
            <p className="text-xs text-card-foreground">「<RubyStr text={greeting} />」</p>
          </div>

          {/* RPGステータスゲージ */}
          <RpgStatusBar
            hp={Math.round((daysActive7 / 7) * 100)}
            mp={savingWeeks}
            exp={progress}
          />
          {/* 装備ステータス */}
          <EquipmentView
            stats={calculateRpgStats({
              level: current.level,
              totalQuests,
              badgeCount,
              streakDays,
              daysActiveInLast7: daysActive7,
              savingStreakWeeks: savingWeeks,
              expProgress: progress,
            })}
            appearance={current.appearance ? current.appearance.replace(/\[([^\]|]+)\|[^\]]+\]/g, "$1") : ""}
          />
          {next ? (
            <p className="text-[10px] text-muted-foreground mt-1">
              <R k="次" r="つぎ" />のレベルまで あと ¥{remaining.toLocaleString()}
            </p>
          ) : (
            <p className="text-[10px] text-accent mt-1 font-semibold">
              <R k="最高" r="さいこう" /> レベル <R k="達成" r="たっせい" />！
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
