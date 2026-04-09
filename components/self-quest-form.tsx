"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { R } from "@/components/ruby-text";

type Props = {
  open: boolean;
  onClose: () => void;
  childId: string;
  familyId: string;
  onCreated: () => void;
  /** 親が設定した提案上限額（デフォルト500円） */
  maxReward?: number;
};

export function SelfQuestForm({
  open,
  onClose,
  childId,
  familyId,
  onCreated,
  maxReward = 500,
}: Props) {
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("クエストの なまえを いれてね");
      return;
    }
    const rewardNum = parseInt(reward) || 0;
    if (rewardNum <= 0) {
      setError("ごほうびの きんがくを いれてね");
      return;
    }
    if (rewardNum > maxReward) {
      setError(`ごほうびは ${maxReward}えん までだよ`);
      return;
    }

    setError("");
    setLoading(true);

    const { error: insertError } = await supabase
      .from("otetsudai_tasks")
      .insert({
        family_id: familyId,
        title: title.trim(),
        description: message.trim() || null,
        reward_amount: rewardNum,
        recurrence: "once",
        assigned_child_id: childId,
        is_active: false, // 承認されるまで非アクティブ
        created_by: childId,
        proposal_status: "pending",
        proposed_reward: rewardNum,
        proposal_message: message.trim() || null,
      });

    setLoading(false);

    if (insertError) {
      setError("おくれませんでした。もういちど ためしてね");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setTitle("");
      setReward("");
      setMessage("");
      setSuccess(false);
      onClose();
      onCreated();
    }, 2000);
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setTitle("");
      setReward("");
      setMessage("");
      setError("");
      setSuccess(false);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            ✨ じぶんクエストを つくる
          </DialogTitle>
          <DialogDescription>
            やりたい おてつだいを おやに ていあんしよう！
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">📨</div>
            <p className="font-bold text-lg text-emerald-700">
              おやに おねがいしたよ！
            </p>
            <p className="text-sm text-muted-foreground">
              <R k="承認" r="しょうにん" />を まってね
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="quest-title">
                クエストの なまえ
              </Label>
              <Input
                id="quest-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="れい: ほんを 3さつ よむ"
                className="mt-1 h-12 text-lg"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="quest-reward">
                ほしい ごほうび（えん）
              </Label>
              <Input
                id="quest-reward"
                type="number"
                inputMode="numeric"
                min={10}
                max={maxReward}
                step={10}
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="100"
                className="mt-1 h-12 text-xl text-center"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                さいだい {maxReward}えん まで。おやが きんがくを かえることもあるよ
              </p>
            </div>

            <div>
              <Label htmlFor="quest-message">
                おやへの メッセージ（なくても OK）
              </Label>
              <Input
                id="quest-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="れい: まいにち がんばるよ！"
                className="mt-1 h-12"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button
              className="w-full h-14 text-lg bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "おくりちゅう..." : "おやに ていあんする 📨"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
