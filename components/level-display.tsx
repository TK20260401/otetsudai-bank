"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLevelProgress } from "@/lib/levels";
import { Progress } from "@/components/ui/progress";
import { R } from "@/components/ruby-text";

type Props = {
  childId: string;
};

export function LevelDisplay({ childId }: Props) {
  const [totalEarned, setTotalEarned] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      // 承認済みタスクログから累計獲得額を計算
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
      setLoaded(true);
    }
    load();
  }, [childId]);

  if (!loaded) return null;

  const { current, next, progress, remaining } = getLevelProgress(totalEarned);

  return (
    <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-3 mb-4 border border-amber-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{current.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-bold text-amber-800">
              Lv.{current.level} {current.title}
            </p>
            <p className="text-xs text-amber-600">
              <R k="合計" r="ごうけい" /> ¥{totalEarned.toLocaleString()}
            </p>
          </div>
          {next ? (
            <>
              <Progress value={progress} className="h-2 mt-1" />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                <R k="次" r="つぎ" />の レベル「{next.icon} {next.title}」まで あと ¥{remaining.toLocaleString()}
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
