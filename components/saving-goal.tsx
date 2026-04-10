"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SavingGoal } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { R } from "@/components/ruby-text";

type Props = {
  childId: string;
  savingBalance: number;
  goals: SavingGoal[];
  onUpdate: () => void;
};

export default function SavingGoalSection({ childId, savingBalance, goals, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  async function handleAdd() {
    const amount = parseInt(targetAmount);
    if (!title.trim() || !amount || amount <= 0) return;

    await supabase.from("otetsudai_saving_goals").insert({
      child_id: childId,
      title: title.trim(),
      target_amount: amount,
    });
    setTitle("");
    setTargetAmount("");
    setShowAdd(false);
    onUpdate();
  }

  const activeGoal = goals.find((g) => !g.is_achieved);
  const achievedGoals = goals.filter((g) => g.is_achieved);

  // 目標達成チェック
  if (activeGoal && savingBalance >= activeGoal.target_amount && !activeGoal.is_achieved) {
    supabase
      .from("otetsudai_saving_goals")
      .update({ is_achieved: true })
      .eq("id", activeGoal.id)
      .then(() => onUpdate());
  }

  const progress = activeGoal
    ? Math.min(Math.round((savingBalance / activeGoal.target_amount) * 100), 100)
    : 0;

  return (
    <Card className="mt-3 border-green-200 bg-green-50/50">
      <CardContent className="p-4">
        <p className="text-sm font-semibold text-green-700 mb-2">
          🎯 <R k="貯金目標" r="ちょきんもくひょう" />
        </p>

        {activeGoal ? (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">{activeGoal.title}</span>
              <span className="text-green-600 font-bold">
                ¥{savingBalance.toLocaleString()} / ¥{activeGoal.target_amount.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-3 mb-1" />
            <p className="text-xs text-muted-foreground text-right">{progress}%</p>
            {progress >= 100 && (
              <div className="text-center mt-2 text-lg animate-bounce">
                🎉 <R k="目標達成" r="もくひょうたっせい" />！すごい！
              </div>
            )}
          </div>
        ) : (
          <div>
            {!showAdd ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed border-green-300 text-green-600"
                onClick={() => setShowAdd(true)}
              >
                <span className="inline-flex items-baseline leading-relaxed">＋ <R k="目標" r="もくひょう" /> を<R k="決" r="き" />める</span>
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: ゲームソフト"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="金額"
                    className="text-sm"
                  />
                  <span className="text-sm text-muted-foreground self-center"><R k="円" r="えん" /></span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>やめる</Button>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={handleAdd}><R k="決" r="き" />める！</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {achievedGoals.length > 0 && (
          <div className="mt-3 pt-2 border-t border-green-200">
            <p className="text-xs text-green-500 mb-1"><R k="達成済" r="たっせいず" />み 🏆</p>
            {achievedGoals.map((g) => (
              <p key={g.id} className="text-xs text-muted-foreground">
                ✅ {g.title}（¥{g.target_amount.toLocaleString()}）
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
