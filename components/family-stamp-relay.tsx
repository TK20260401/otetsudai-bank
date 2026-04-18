"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { FAMILY_STAMPS, getFamilyStampById } from "@/lib/family-stamps";
import type { User, FamilyMessage } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelChatIcon, PixelLetterIcon } from "@/components/pixel-icons";
import { R } from "@/components/ruby-text";

type Props = {
  userId: string;
  familyId: string;
  isParent?: boolean;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たったいま";
  if (mins < 60) return `${mins}ふんまえ`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}じかんまえ`;
  const days = Math.floor(hours / 24);
  return `${days}にちまえ`;
}

export function FamilyStampRelay({ userId, familyId, isParent }: Props) {
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    const [membersRes, msgRes] = await Promise.all([
      supabase
        .from("otetsudai_users")
        .select("*")
        .eq("family_id", familyId)
        .neq("role", "admin"),
      supabase
        .from("otetsudai_family_messages")
        .select("*, sender:otetsudai_users!sender_id(*), recipient:otetsudai_users!recipient_id(*)")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setMembers(membersRes.data || []);
    setMessages(msgRes.data || []);
  }, [familyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recipients = members.filter((m) => m.id !== userId);
  const canSend = selectedRecipient && (selectedStamp || messageText.trim().length > 0);

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    await supabase.from("otetsudai_family_messages").insert({
      family_id: familyId,
      sender_id: userId,
      recipient_id: selectedRecipient,
      stamp_id: selectedStamp,
      message: messageText.trim() || null,
    });
    setSending(false);
    setSelectedRecipient(null);
    setSelectedStamp(null);
    setMessageText("");
    setDialogOpen(false);
    loadData();
  }

  return (
    <>
      <Card className="mb-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-4">
          <p className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-1">
            <PixelChatIcon size={18} /> {isParent ? "パーティチャット" : <><R k="家族" r="かぞく" />の メッセージ</>}
          </p>

          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              まだ メッセージは ありません
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.map((msg) => {
                const stamp = msg.stamp_id ? getFamilyStampById(msg.stamp_id) : null;
                const senderName = msg.sender?.name ?? "?";
                const senderIcon = msg.sender?.icon ?? "👤";
                const recipientName = msg.recipient?.name ?? "?";
                const recipientIcon = msg.recipient?.icon ?? "👤";
                const isMine = msg.sender_id === userId;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isMine ? "opacity-80" : ""}`}
                  >
                    <span className="text-xl flex-shrink-0 mt-1">{senderIcon}</span>
                    <div className={`flex-1 rounded-xl p-2 border ${isMine ? "bg-gray-50 border-gray-200" : "bg-white/80 border-emerald-100"}`}>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                        <span className="font-bold text-emerald-700">{senderName}</span>
                        <span>→</span>
                        <span className="font-bold">{recipientIcon} {recipientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {stamp && <span className="text-2xl">{stamp.emoji}</span>}
                        <div>
                          {stamp && <p className="text-sm font-bold text-gray-800">{stamp.label}</p>}
                          {msg.message && <p className="text-xs text-gray-600">「{msg.message}」</p>}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right mt-1">
                        {timeAgo(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full mt-3 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            onClick={() => setDialogOpen(true)}
          >
            <span className="flex items-center gap-1"><PixelLetterIcon size={16} /> エールを {isParent ? "送る" : "おくる"}</span>
          </Button>
        </CardContent>
      </Card>

      {/* 送信ダイアログ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><span className="flex items-center gap-1"><PixelLetterIcon size={20} /> エールを {isParent ? "送る" : "おくる"}</span></DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 送り先選択 */}
            <div>
              <p className="text-sm font-bold mb-2">
                {isParent ? "誰に送る？" : "だれに おくる？"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {recipients.map((m) => (
                  <button
                    key={m.id}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 min-w-[72px] transition-colors ${
                      selectedRecipient === m.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRecipient(m.id)}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-xs font-bold mt-1">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* スタンプ選択 */}
            <div>
              <p className="text-sm font-bold mb-2">スタンプを {isParent ? "選ぶ" : "えらぼう"}</p>
              <div className="grid grid-cols-4 gap-2">
                {FAMILY_STAMPS.map((s) => (
                  <button
                    key={s.id}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-colors ${
                      selectedStamp === s.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedStamp(selectedStamp === s.id ? null : s.id)}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-[10px] mt-1">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* メッセージ入力 */}
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={isParent ? "ひとことメッセージ（任意）" : "ひとこと メッセージ（なくても OK）"}
              maxLength={100}
            />

            <Button
              className="w-full"
              disabled={!canSend || sending}
              onClick={handleSend}
            >
              {sending ? "送信中..." : <span className="flex items-center gap-1"><PixelLetterIcon size={16} /> エールを送る！</span>}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              ※ スタンプかメッセージのどちらかは入れてね
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
