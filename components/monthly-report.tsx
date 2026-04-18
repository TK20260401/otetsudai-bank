"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { PixelBarChartIcon, PixelTargetIcon, PixelCoinIcon, PixelFlameIcon, PixelCrossedSwordsIcon, PixelConfettiIcon, PixelPiggyIcon, PixelLightbulbIcon } from "@/components/pixel-icons";
import CharacterSvg from "@/components/character-svg";
import type { User, Wallet } from "@/lib/types";

type Props = {
  child: User;
  wallet: Wallet | null;
};

type ReportData = {
  questsCompleted: number;
  totalEarned: number;
  maxStreak: number;
  levelStart: number;
  levelEnd: number;
  savingGoalsAchieved: number;
  savingGoalsTotal: number;
  topQuest: string | null;
  topQuestCount: number;
};

const LEVEL_THRESHOLDS = [0, 100, 500, 1500, 3000, 5000, 10000];
function getLevel(total: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end, label: `${now.getFullYear()}年 ${now.getMonth() + 1}月` };
}

function generateComment(data: ReportData): string {
  const parts: string[] = [];
  if (data.questsCompleted >= 20) parts.push("たくさんクエストをがんばったね！");
  else if (data.questsCompleted >= 10) parts.push("コツコツがんばったね！");
  else if (data.questsCompleted > 0) parts.push("クエストにちょうせんできたね！");
  if (data.levelEnd > data.levelStart) parts.push(`レベルが${data.levelEnd - data.levelStart}つ上がったよ！`);
  if (data.maxStreak >= 5) parts.push(`${data.maxStreak}日連続はすごい！`);
  if (data.savingGoalsAchieved > 0) parts.push("貯金の目標も達成したね！");
  if (data.topQuest) parts.push(`「${data.topQuest}」が一番たくさんクリアしたクエストだよ`);
  return parts.length > 0 ? parts.join(" ") : "今月もがんばろう！";
}

export function MonthlyReport({ child, wallet }: Props) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { start, end, label } = getMonthRange();

  useEffect(() => {
    async function load() {
      const { data: logs } = await supabase
        .from("otetsudai_task_logs")
        .select("*, task:otetsudai_tasks(title, reward_amount)")
        .eq("child_id", child.id)
        .eq("status", "approved")
        .gte("approved_at", start.toISOString())
        .lte("approved_at", end.toISOString());

      const approvedLogs = logs || [];
      const questsCompleted = approvedLogs.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalEarned = approvedLogs.reduce((sum: number, l: any) => sum + (l.task?.reward_amount || 0), 0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const questCounts: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      approvedLogs.forEach((l: any) => {
        const title = l.task?.title || "";
        if (title) questCounts[title] = (questCounts[title] || 0) + 1;
      });
      const topEntry = Object.entries(questCounts).sort((a, b) => b[1] - a[1])[0];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const days = new Set(approvedLogs.filter((l: any) => l.approved_at).map((l: any) => new Date(l.approved_at).toDateString()));
      let maxStreak = 0;
      let currentStreak = 0;
      const d = new Date(start);
      while (d <= end) {
        if (days.has(d.toDateString())) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
        else currentStreak = 0;
        d.setDate(d.getDate() + 1);
      }

      const { data: goals } = await supabase.from("otetsudai_saving_goals").select("is_achieved").eq("child_id", child.id);
      const savingGoalsTotal = goals?.length || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savingGoalsAchieved = goals?.filter((g: any) => g.is_achieved).length || 0;

      const totalBalance = wallet ? wallet.spending_balance + wallet.saving_balance + wallet.invest_balance : 0;
      const levelEnd = getLevel(totalBalance);
      const levelStart = getLevel(Math.max(0, totalBalance - totalEarned));

      setData({ questsCompleted, totalEarned, maxStreak, levelStart, levelEnd, savingGoalsAchieved, savingGoalsTotal, topQuest: topEntry?.[0] ?? null, topQuestCount: topEntry?.[1] ?? 0 });
      setLoading(false);
    }
    load();
  }, [child.id, wallet]);

  if (loading || !data) return null;

  const comment = generateComment(data);

  return (
    <Card className="mt-3 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardContent className="p-4">
        <p className="text-sm font-bold text-purple-700 text-center flex items-center justify-center gap-1">
          <PixelBarChartIcon size={18} /> {child.name}の成長レポート
        </p>
        <p className="text-[11px] text-muted-foreground text-center mb-2">{label}</p>

        {/* レベル変化のキャラクター表示 */}
        {data.levelEnd > data.levelStart ? (
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex flex-col items-center opacity-50">
              <CharacterSvg level={Math.min(data.levelStart, 7)} mood="normal" size={40} />
              <span className="text-[9px] text-muted-foreground">Lv.{data.levelStart}</span>
            </div>
            <span className="text-amber-500 font-bold text-lg">→</span>
            <div className="flex flex-col items-center">
              <CharacterSvg level={Math.min(data.levelEnd, 7)} mood="active" size={48} />
              <span className="text-[9px] font-bold text-amber-600">Lv.{data.levelEnd}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <CharacterSvg level={Math.min(data.levelEnd, 7)} mood="normal" size={48} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/60 rounded-xl p-2 text-center flex flex-col items-center">
            <PixelTargetIcon size={20} />
            <p className="text-base font-bold text-gray-800">{data.questsCompleted}</p>
            <p className="text-[10px] text-muted-foreground">クエスト</p>
          </div>
          <div className="bg-white/60 rounded-xl p-2 text-center flex flex-col items-center">
            <PixelCoinIcon size={20} />
            <p className="text-base font-bold text-gray-800">¥{data.totalEarned.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">稼いだ</p>
          </div>
          <div className="bg-white/60 rounded-xl p-2 text-center flex flex-col items-center">
            <PixelFlameIcon size={20} />
            <p className="text-base font-bold text-gray-800">{data.maxStreak}日</p>
            <p className="text-[10px] text-muted-foreground">最高連続</p>
          </div>
          <div className="bg-white/60 rounded-xl p-2 text-center flex flex-col items-center">
            <PixelCrossedSwordsIcon size={20} />
            <p className="text-base font-bold text-gray-800">
              Lv.{data.levelStart === data.levelEnd ? data.levelEnd : `${data.levelStart}→${data.levelEnd}`}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {data.levelEnd > data.levelStart ? <span className="flex items-center gap-0.5"><PixelConfettiIcon size={12} /> UP!</span> : "レベル"}
            </p>
          </div>
        </div>

        {data.savingGoalsTotal > 0 && (
          <p className="text-xs text-center text-amber-700 font-bold mb-2 flex items-center justify-center gap-1">
            <PixelPiggyIcon size={16} /> 貯金目標: {data.savingGoalsAchieved}/{data.savingGoalsTotal} 達成
          </p>
        )}

        <div className="bg-white/50 rounded-xl p-3">
          <p className="text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1"><PixelLightbulbIcon size={14} /> コメント:</p>
          <p className="text-xs text-gray-700">「{comment}」</p>
        </div>
      </CardContent>
    </Card>
  );
}
