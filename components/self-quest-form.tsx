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
  { title: "おさらあらい", reward: 30, icon: "🍽️" },
  { title: "くつならべ", reward: 10, icon: "👟" },
  { title: "せんたくものたたみ", reward: 30, icon: "👕" },
  { title: "おふろそうじ", reward: 50, icon: "🛁" },
  { title: "そうじき かける", reward: 40, icon: "🧹" },
  { title: "ゴミだし", reward: 20, icon: "🗑️" },
  { title: "ペットの おせわ", reward: 30, icon: "🐕" },
  { title: "しゅくだいを おわらせる", reward: 50, icon: "📚" },
  { title: "おつかい", reward: 50, icon: "🛒" },
  { title: "ふとんを たたむ", reward: 20, icon: "🛏️" },
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
      setError(isCustom ? "クエストの なまえを いれてね" : "クエストを えらんでね");
      return;
    }
    if (questReward <= 0) {
      setError("ごほうびの きんがくを いれてね");
      return;
    }
    if (questReward > maxReward) {
      setError(`ごほうびは ${maxReward}えん までだよ`);
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
      setError("おくれませんでした。もういちど ためしてね");
      return;
    }

    setSuccess(true);
    setTimeout(() => { resetAndClose(); onCreated(); }, 2000);
  }

  async function handleSubmitMessage() {
    // スタンプのみでも送信OK
    if (!msgBody.trim() && !msgStamp) {
      setError("メッセージか スタンプを えらんでね");
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
      setError("おくれませんでした。もういちど ためしてね");
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
            {mode === "quest" ? "✨ じぶんクエストを つくる" : "💬 おやに メッセージ"}
          </DialogTitle>
          <DialogDescription>
            {mode === "quest"
              ? "やりたい おてつだいを えらんで おやに ていあんしよう！"
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
              おやに おくったよ！
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "quest"
                ? <><R k="承認" r="しょうにん" />を まってね</>
                : "おやが よんでくれるよ"}
            </p>
          </div>
        ) : mode === "quest" ? (
          /* ────── クエスト提案 ────── */
          <div className="space-y-4">
            {/* プルダウンでクエスト選択 */}
            <div>
              <Label>クエストを えらぼう</Label>
              <Select
                value={questSelect}
                onValueChange={handleQuestSelect}
              >
                <SelectTrigger className="mt-1 w-full h-12 text-base">
                  <SelectValue placeholder="タップして えらんでね" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_QUESTS.map((q) => (
                    <SelectItem key={q.title} value={q.title}>
                      {q.icon} {q.title}（{q.reward}えん）
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value={CUSTOM_VALUE}>
                    ✏️ そのほか（じぶんで かく）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 「その他」選択時のみ自由入力 */}
            {isCustom && (
              <div>
                <Label htmlFor="q-custom">クエストの なまえ</Label>
                <Input
                  id="q-custom"
                  value={questCustomTitle}
                  onChange={(e) => setQuestCustomTitle(e.target.value)}
                  placeholder="れい: ほんを 3さつ よむ"
                  className="mt-1 h-12 text-lg"
                  autoFocus
                />
              </div>
            )}

            {/* 報酬表示 — プリセットは固定、カスタムは入力可 */}
            <div>
              <Label htmlFor="q-reward">
                ごほうび（えん）
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
                    さいだい {maxReward}えん まで。おやが きんがくを かえることもあるよ
                  </p>
                </>
              ) : questSelect ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-12 flex-1 flex items-center justify-center rounded-lg border bg-muted text-xl font-bold text-emerald-600">
                    {questReward}えん
                  </div>
                  <p className="text-[10px] text-muted-foreground w-24 leading-tight">
                    おやが きめた きんがくだよ
                  </p>
                </div>
              ) : (
                <div className="mt-1 h-12 flex items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
                  クエストを えらぶと ひょうじされるよ
                </div>
              )}
              {!isCustom && questSelect && (
                <p className="text-[10px] text-amber-600 mt-1">
                  💬 もっと ほしいときは メッセージで おやに そうだんしてね
                </p>
              )}
            </div>

            {/* メッセージ＋スタンプ（クエスト提案時） */}
            <div>
              <Label>おやへの メッセージ（なくても OK）</Label>
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
                placeholder="れい: まいにち がんばるよ！"
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
                "おやに クエストを おくる 📨"
              )}
            </Button>
          </div>
        ) : (
          /* ────── メッセージ ────── */
          <div className="space-y-4">
            <div>
              <Label>スタンプ（えらぶだけでも おくれるよ！）</Label>
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
                placeholder={"れい: きょう たのしかったよ！\nれい: あたらしい クエスト ほしいな"}
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
                "おやに おくる 📨"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
