"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLevelProgress } from "@/lib/levels";
import { Progress } from "@/components/ui/progress";
import { R, RubyStr } from "@/components/ruby-text";

type Mood = "active" | "normal" | "lonely";

type Props = {
  childId: string;
};

export function LevelDisplay({ childId }: Props) {
  const [totalEarned, setTotalEarned] = useState(0);
  const [mood, setMood] = useState<Mood>("normal");
  const [loaded, setLoaded] = useState(false);

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
        // 全くログがない場合はnormal（始めたばかり）、ログがあるのに最近ない場合はlonely
        setMood(data && data.length > 0 ? "lonely" : "normal");
      }

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

  const moodBg =
    mood === "active"
      ? "from-emerald-100 to-yellow-100 border-emerald-300"
      : mood === "lonely"
        ? "from-blue-50 to-gray-100 border-blue-200"
        : "from-amber-100 to-yellow-100 border-amber-200";

  const moodIndicator =
    mood === "active" ? "✨" : mood === "lonely" ? "💤" : "😊";

  return (
    <div className={`bg-gradient-to-r ${moodBg} rounded-xl p-4 mb-4 border`}>
      <div className="flex items-start gap-3">
        {/* キャラクター表示 */}
        <div className="flex flex-col items-center gap-1 min-w-[64px]">
          <div className="relative">
            <span className="text-5xl">{current.character}</span>
            <span className="absolute -top-1 -right-1 text-sm">{moodIndicator}</span>
          </div>
          <span className="text-[10px] text-muted-foreground"><RubyStr text={current.appearance} /></span>
        </div>

        {/* ステータス */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-bold text-amber-800 text-sm leading-relaxed break-words">
              Lv.{current.level} <RubyStr text={current.title} />
            </p>
          </div>

          {/* セリフ吹き出し */}
          <div className="relative bg-white/70 rounded-lg px-3 py-1.5 mt-1 mb-2">
            <div className="absolute -left-1.5 top-2 w-0 h-0 border-t-4 border-t-transparent border-r-6 border-r-white/70 border-b-4 border-b-transparent" />
            <p className="text-xs text-gray-700">「<RubyStr text={greeting} />」</p>
          </div>

          {next ? (
            <>
              <Progress value={progress} className="h-2" />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                <R k="次" r="つぎ" />のレベルまで あと ¥{remaining.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-[10px] text-amber-600 mt-1 font-semibold">
              <R k="最高" r="さいこう" /> レベル <R k="達成" r="たっせい" />！ 🎊
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
