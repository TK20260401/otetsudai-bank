"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  maxReward?: number;
};

/** プリセットクエスト（親が設定した基準額付き） */
const PRESET_QUESTS = [
  { title: "お皿洗い", reward: 30, icon: "🍽️" },
  { title: "靴並べ", reward: 10, icon: "👟" },
  { title: "洗濯物たたみ", reward: 30, icon: "👕" },
  { title: "お風呂掃除", reward: 50, icon: "🛁" },
  { title: "掃除機 かける", reward: 40, icon: "🧹" },
  { title: "ゴミ出し", reward: 20, icon: "🗑️" },
  { title: "ペットの お世話", reward: 30, icon: "🐕" },
  { title: "宿題を 終わらせる", reward: 50, icon: "📚" },
  { title: "お使い", reward: 50, icon: "🛒" },
  { title: "布団を たたむ", reward: 20, icon: "🛏️" },
] as const;

const CUSTOM_VALUE = "__custom__";

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
}: Props) {
  const [mode, setMode] = useState<Mode>("quest");

  // クエスト提案用
  const [questSelect, setQuestSelect] = useState("");
  const [questCustomTitle, setQuestCustomTitle] = useState("");
  const [questReward, setQuestReward] = useState(0);
  const [questNote, setQuestNote] = useState("");
  const [questStamp, setQuestStamp] = useState<string | null>(null);

  // メッセージ用
  const [msgBody, setMsgBody] = useState("");
  const [msgStamp, setMsgStamp] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isCustom = questSelect === CUSTOM_VALUE;

  function handleQuestSelect(value: string | null) {
    const v = value ?? "";
    setQuestSelect(v);
    setError("");
    if (v === CUSTOM_VALUE) {
      setQuestReward(0);
      setQuestCustomTitle("");
    } else {
      const preset = PRESET_QUESTS.find((q) => q.title === v);
      setQuestReward(preset?.reward ?? 0);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
  }

  async function handleSubmitQuest() {
    const title = isCustom ? questCustomTitle.trim() : questSelect;
    if (!title) {
      setError(isCustom ? "クエストの名前を入れてね" : "クエストを選んでね");
      return;
    }
    if (questReward <= 0) {
      setError("報酬の金額を入れてね");
      return;
    }
    if (questReward > maxReward) {
      setError(`報酬は ${maxReward}円 までだよ`);
      return;
    }

    // スタンプ + ノートを結合してメッセージ化
    const messageParts: string[] = [];
    if (questStamp) messageParts.push(questStamp);
    if (questNote.trim()) messageParts.push(questNote.trim());
    const proposalMessage = messageParts.join(" ") || null;

    setError("");
    setLoading(true);

    const { error: insertError } = await supabase
      .from("otetsudai_tasks")
      .insert({
        family_id: familyId,
        title,
        description: proposalMessage,
        reward_amount: questReward,
        recurrence: "once",
        assigned_child_id: childId,
        is_active: false,
        created_by: childId,
        proposal_status: "pending",
        proposed_reward: questReward,
        proposal_message: proposalMessage,
      });

    setLoading(false);
    if (insertError) {
      setError("送れませんでした。もう一度 試してね");
      return;
    }

    setSuccess(true);
    setTimeout(() => { resetAndClose(); onCreated(); }, 2000);
  }

  async function handleSubmitMessage() {
    // スタンプのみでも送信OK
    if (!msgBody.trim() && !msgStamp) {
      setError("メッセージか スタンプを 選んでね");
      return;
    }

    setError("");
    setLoading(true);

    const { error: insertError } = await supabase
      .from("otetsudai_messages")
      .insert({
        family_id: familyId,
        from_user_id: childId,
        to_user_id: null,
        message: msgBody.trim() || null,
        stamp: msgStamp,
      });

    setLoading(false);
    if (insertError) {
      setError("送れませんでした。もう一度 試してね");
      return;
    }

    setSuccess(true);
    setTimeout(() => { resetAndClose(); onCreated(); }, 2000);
  }

  function resetAndClose() {
    setQuestSelect("");
    setQuestCustomTitle("");
    setQuestReward(0);
    setQuestNote("");
    setQuestStamp(null);
    setMsgBody("");
    setMsgStamp(null);
    setError("");
    setSuccess(false);
    setMode("quest");
    onClose();
  }

  function handleOpenChange(v: boolean) {
    if (!v) resetAndClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === "quest" ? <>✨ <R k="自分" r="じぶん" />クエストを <R k="作" r="つく" />る</> : <>💬 <R k="親" r="おや" />に メッセージ</>}
          </DialogTitle>
          <DialogDescription>
            {mode === "quest"
              ? "やりたい お手伝いを 選んで 親に 提案しよう！"
              : "親に 気持ちや お願いを 伝えよう！"}
          </DialogDescription>
        </DialogHeader>

        {/* モード切替タブ */}
        {!success && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "quest" ? "default" : "outline"}
              size="sm"
              className={mode === "quest" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
              onClick={() => switchMode("quest")}
            >
              ✨ クエスト
            </Button>
            <Button
              variant={mode === "message" ? "default" : "outline"}
              size="sm"
              className={mode === "message" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
              onClick={() => switchMode("message")}
            >
              💬 メッセージ
            </Button>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="text-6xl mb-3 animate-bounce">📨</div>
            <p className="font-bold text-lg text-emerald-700">
              <R k="親" r="おや" />に <R k="送" r="おく" />ったよ！
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "quest"
                ? <><R k="承認" r="しょうにん" />を <R k="待" r="ま" />ってね</>
                : <><R k="親" r="おや" />が <R k="読" r="よ" />んでくれるよ</>}
            </p>
          </div>
        ) : mode === "quest" ? (
          /* ────── クエスト提案 ────── */
          <div className="space-y-4">
            {/* プルダウンでクエスト選択 */}
            <div>
              <Label>クエストを <R k="選" r="えら" />ぼう</Label>
              <Select
                value={questSelect}
                onValueChange={handleQuestSelect}
              >
                <SelectTrigger className="mt-1 w-full h-12 text-base">
                  <SelectValue placeholder="タップして 選んでね" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_QUESTS.map((q) => (
                    <SelectItem key={q.title} value={q.title}>
                      {q.icon} {q.title}（{q.reward}<R k="円" r="えん" />）
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value={CUSTOM_VALUE}>
                    ✏️ その<R k="他" r="ほか" />（<R k="自分" r="じぶん" />で <R k="書" r="か" />く）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 「その他」選択時のみ自由入力 */}
            {isCustom && (
              <div>
                <Label htmlFor="q-custom">クエストの <R k="名前" r="なまえ" /></Label>
                <Input
                  id="q-custom"
                  value={questCustomTitle}
                  onChange={(e) => setQuestCustomTitle(e.target.value)}
                  placeholder="例: 本を 3冊 読む"
                  className="mt-1 h-12 text-lg"
                  autoFocus
                />
              </div>
            )}

            {/* 報酬表示 — プリセットは固定、カスタムは入力可 */}
            <div>
              <Label htmlFor="q-reward">
                <R k="報酬" r="ほうしゅう" />（<R k="円" r="えん" />）
              </Label>
              {isCustom ? (
                <>
                  <Input
                    id="q-reward"
                    type="number"
                    inputMode="numeric"
                    min={10}
                    max={maxReward}
                    step={10}
                    value={questReward || ""}
                    onChange={(e) => setQuestReward(parseInt(e.target.value) || 0)}
                    placeholder="100"
                    className="mt-1 h-12 text-xl text-center"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    <R k="最大" r="さいだい" /> {maxReward}<R k="円" r="えん" /> まで。<R k="親" r="おや" />が <R k="金額" r="きんがく" />を <R k="変" r="か" />えることもあるよ
                  </p>
                </>
              ) : questSelect ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-12 flex-1 flex items-center justify-center rounded-lg border bg-muted text-xl font-bold text-emerald-600">
                    {questReward}<R k="円" r="えん" />
                  </div>
                  <p className="text-[10px] text-muted-foreground w-24 leading-tight">
                    <R k="親" r="おや" />が <R k="決" r="き" />めた <R k="金額" r="きんがく" />だよ
                  </p>
                </div>
              ) : (
                <div className="mt-1 h-12 flex items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
                  クエストを <R k="選" r="えら" />ぶと <R k="表示" r="ひょうじ" />されるよ
                </div>
              )}
              {!isCustom && questSelect && (
                <p className="text-[10px] text-amber-600 mt-1">
                  💬 もっと ほしいときは メッセージで <R k="親" r="おや" />に <R k="相談" r="そうだん" />してね
                </p>
              )}
            </div>

            {/* メッセージ＋スタンプ（クエスト提案時） */}
            <div>
              <Label><R k="親" r="おや" />への メッセージ（なくても OK）</Label>
              <div className="grid grid-cols-6 gap-1.5 mt-1">
                {QUICK_STAMPS.map((s) => (
                  <button
                    key={s.emoji}
                    type="button"
                    onClick={() => setQuestStamp(questStamp === s.emoji ? null : s.emoji)}
                    className={`flex flex-col items-center p-1 rounded-xl transition-all ${
                      questStamp === s.emoji
                        ? "bg-emerald-100 ring-2 ring-emerald-400 scale-110"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-[7px] text-muted-foreground leading-tight">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
              <Input
                value={questNote}
                onChange={(e) => setQuestNote(e.target.value)}
                placeholder="例: 毎日 頑張るよ！"
                className="mt-2 h-10"
                maxLength={100}
              />
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            {/* 大きく目立つ送信ボタン */}
            <Button
              className="w-full h-16 text-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
              onClick={handleSubmitQuest}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">おくりちゅう...</span>
              ) : (
                "親に クエストを 送る 📨"
              )}
            </Button>
          </div>
        ) : (
          /* ────── メッセージ ────── */
          <div className="space-y-4">
            <div>
              <Label>スタンプ（<R k="選" r="えら" />ぶだけでも <R k="送" r="おく" />れるよ！）</Label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                {QUICK_STAMPS.map((s) => (
                  <button
                    key={s.emoji}
                    type="button"
                    onClick={() => setMsgStamp(msgStamp === s.emoji ? null : s.emoji)}
                    className={`flex flex-col items-center p-1.5 rounded-xl transition-all ${
                      msgStamp === s.emoji
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
              <Label htmlFor="m-body">メッセージ（なくても OK）</Label>
              <Textarea
                id="m-body"
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder={"例: 今日 楽しかったよ！\n例: 新しい クエスト ほしいな"}
                className="mt-1 min-h-[80px] text-base"
                maxLength={200}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {msgBody.length}/200
              </p>
            </div>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            {/* 大きく目立つ送信ボタン */}
            <Button
              className="w-full h-16 text-xl font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
              onClick={handleSubmitMessage}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">おくりちゅう...</span>
              ) : (
                "親に 送る 📨"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
