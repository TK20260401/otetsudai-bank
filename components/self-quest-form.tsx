"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { R } from "@/components/ruby-text";

type Mode = "quest" | "message";

type Props = {
  open: boolean;
  onClose: () => void;
  childId: string;
  familyId: string;
  onCreated: () => void;
  /** 親が設定した提案上限額（デフォルト500円） */
  maxReward?: number;
  /** 初期モード */
  initialMode?: Mode;
};

const QUICK_STAMPS = [
  { emoji: "🙏", label: "おねがい" },
  { emoji: "💬", label: "おはなし" },
  { emoji: "❤️", label: "ありがとう" },
  { emoji: "🎉", label: "やったー" },
  { emoji: "😢", label: "かなしい" },
  { emoji: "💡", label: "アイデア" },
];

export function SelfQuestForm({
  open,
  onClose,
  childId,
  familyId,
  onCreated,
  maxReward = 500,
  initialMode = "quest",
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmitQuest() {
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
        is_active: false,
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
      resetForm();
      onClose();
      onCreated();
    }, 2000);
  }

  async function handleSubmitMessage() {
    if (!message.trim()) {
      setError("メッセージを いれてね");
      return;
    }

    setError("");
    setLoading(true);

    const { error: insertError } = await supabase
      .from("otetsudai_messages")
      .insert({
        family_id: familyId,
        from_user_id: childId,
        to_user_id: null, // 家族全員宛（親が見る）
        message: message.trim(),
        stamp: selectedStamp,
      });

    setLoading(false);

    if (insertError) {
      setError("おくれませんでした。もういちど ためしてね");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      resetForm();
      onClose();
      onCreated();
    }, 2000);
  }

  function resetForm() {
    setTitle("");
    setReward("");
    setMessage("");
    setSelectedStamp(null);
    setError("");
    setSuccess(false);
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      resetForm();
      setMode(initialMode);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === "quest" ? "✨ じぶんクエストを つくる" : "💬 おやに メッセージ"}
          </DialogTitle>
          <DialogDescription>
            {mode === "quest"
              ? "やりたい おてつだいを おやに ていあんしよう！"
              : "おやに きもちや おねがいを つたえよう！"}
          </DialogDescription>
        </DialogHeader>

        {/* モード切替タブ */}
        {!success && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "quest" ? "default" : "outline"}
              size="sm"
              className={mode === "quest" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
              onClick={() => { setMode("quest"); setError(""); }}
            >
              ✨ クエスト
            </Button>
            <Button
              variant={mode === "message" ? "default" : "outline"}
              size="sm"
              className={mode === "message" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
              onClick={() => { setMode("message"); setError(""); }}
            >
              💬 メッセージ
            </Button>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">📨</div>
            <p className="font-bold text-lg text-emerald-700">
              おやに おくったよ！
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "quest"
                ? <><R k="承認" r="しょうにん" />を まってね</>
                : "おやが よんでくれるよ"}
            </p>
          </div>
        ) : mode === "quest" ? (
          /* クエスト提案モード */
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
              onClick={handleSubmitQuest}
              disabled={loading}
            >
              {loading ? "おくりちゅう..." : "おやに ていあんする 📨"}
            </Button>
          </div>
        ) : (
          /* メッセージモード */
          <div className="space-y-4">
            {/* クイックスタンプ */}
            <div>
              <Label>スタンプ（えらばなくても OK）</Label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                {QUICK_STAMPS.map((s) => (
                  <button
                    key={s.emoji}
                    type="button"
                    onClick={() =>
                      setSelectedStamp(selectedStamp === s.emoji ? null : s.emoji)
                    }
                    className={`flex flex-col items-center p-1.5 rounded-xl transition-all ${
                      selectedStamp === s.emoji
                        ? "bg-blue-100 ring-2 ring-blue-400 scale-110"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-[8px] text-muted-foreground leading-tight">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="msg-body">メッセージ</Label>
              <Textarea
                id="msg-body"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="れい: きょう たのしかったよ！&#10;れい: あたらしい クエスト ほしいな"
                className="mt-1 min-h-[100px] text-base"
                maxLength={200}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {message.length}/200
              </p>
            </div>

            {/* プレビュー */}
            {(selectedStamp || message.trim()) && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-[10px] text-blue-400 mb-1">プレビュー</p>
                <div className="flex items-start gap-2">
                  {selectedStamp && (
                    <span className="text-3xl flex-shrink-0">{selectedStamp}</span>
                  )}
                  {message.trim() && (
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">{message}</p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button
              className="w-full h-14 text-lg bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleSubmitMessage}
              disabled={loading}
            >
              {loading ? "おくりちゅう..." : "おやに おくる 📨"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
