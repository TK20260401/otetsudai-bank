"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SavingGoal } from "@/lib/types";
import RpgCard from "@/components/rpg-card";
import RpgButton from "@/components/rpg-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { R } from "@/components/ruby-text";
import { PixelTargetIcon, PixelConfettiIcon, PixelCrownIcon, PixelCheckIcon } from "@/components/pixel-icons";

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
  const [titleError, setTitleError] = useState("");
  const [amountError, setAmountError] = useState("");

  async function handleAdd() {
    let hasError = false;
    setTitleError("");
    setAmountError("");

    if (!title.trim()) {
      setTitleError("なまえを いれてね");
      hasError = true;
    }
    const amount = parseInt(targetAmount);
    if (!targetAmount || !amount || amount <= 0) {
      setAmountError("きんがくを いれてね");
      hasError = true;
    }
    if (hasError) return;

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
    <RpgCard
      tier="violet"
      className="mt-3"
      title={<><PixelTargetIcon size={16} /> <R k="貯金目標" r="ちょきんもくひょう" /></>}
    >
      {activeGoal ? (
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-card-foreground">{activeGoal.title}</span>
            <span className="text-[#58d68d] font-bold">
              ¥{savingBalance.toLocaleString()} / ¥{activeGoal.target_amount.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-3 mb-1" />
          <p className="text-xs text-muted-foreground text-right">{progress}%</p>
          {progress >= 100 && (
            <div className="text-center mt-2 text-lg animate-bounce text-[#58d68d] font-bold drop-shadow-[0_1px_6px_rgba(46,204,113,0.5)]">
              <span className="flex items-center justify-center gap-1"><PixelConfettiIcon size={14} /> <R k="目標達成" r="もくひょうたっせい" />！すごい！</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          {!showAdd ? (
            <RpgButton tier="emerald" size="sm" fullWidth onClick={() => setShowAdd(true)}>
              ＋ <R k="目標" r="もくひょう" /> を<R k="決" r="き" />める
            </RpgButton>
          ) : (
            <div className="space-y-2">
              <div>
                <Input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
                  placeholder="例: ゲームソフト"
                  className={`text-sm ${titleError ? "border-[#e74c3c] ring-1 ring-[#e74c3c]/50" : ""}`}
                />
                {titleError && <p className="text-xs text-[#ff6b6b] mt-0.5">{titleError}</p>}
              </div>
              <div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={targetAmount}
                    onChange={(e) => { setTargetAmount(e.target.value); setAmountError(""); }}
                    placeholder="金額"
                    className={`text-sm ${amountError ? "border-[#e74c3c] ring-1 ring-[#e74c3c]/50" : ""}`}
                  />
                  <span className="text-sm text-muted-foreground self-center"><R k="円" r="えん" /></span>
                </div>
                {amountError && <p className="text-xs text-[#ff6b6b] mt-0.5">{amountError}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>やめる</Button>
                <RpgButton tier="emerald" size="sm" onClick={handleAdd}><R k="決" r="き" />める！</RpgButton>
              </div>
            </div>
          )}
        </div>
      )}

      {achievedGoals.length > 0 && (
        <div className="mt-3 pt-2 border-t border-[#2ecc71]/30">
          <p className="text-xs text-[#58d68d] mb-1 flex items-center gap-0.5"><R k="達成済" r="たっせいず" />み <PixelCrownIcon size={12} /></p>
          {achievedGoals.map((g) => (
            <p key={g.id} className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5"><PixelCheckIcon size={12} /> {g.title}（¥{g.target_amount.toLocaleString()}）</span>
            </p>
          ))}
        </div>
      )}
    </RpgCard>
  );
}
