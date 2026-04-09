"use client";

import { useState } from "react";
import { STAMPS, type Stamp } from "@/lib/stamps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  childName: string;
  taskTitle: string;
  reward: number;
  onApprove: (stamp: string | null, message: string) => void;
};

export function ApprovalDialog({
  open,
  onClose,
  childName,
  taskTitle,
  reward,
  onApprove,
}: Props) {
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [message, setMessage] = useState("");

  function handleSubmit() {
    onApprove(selectedStamp?.id || null, message);
    setSelectedStamp(null);
    setMessage("");
    onClose();
  }

  function handleQuickApprove() {
    onApprove(null, "");
    onClose();
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setSelectedStamp(null);
      setMessage("");
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>⚔️ クエスト承認</DialogTitle>
          <DialogDescription>
            {childName}の「{taskTitle}」（¥{reward.toLocaleString()}）
          </DialogDescription>
        </DialogHeader>

        {/* スタンプ選択 */}
        <div>
          <p className="text-sm font-semibold text-amber-700 mb-2">
            スタンプをおくる（えらばなくてもOK）
          </p>
          <div className="grid grid-cols-4 gap-2">
            {STAMPS.map((stamp) => (
              <button
                key={stamp.id}
                type="button"
                onClick={() =>
                  setSelectedStamp(
                    selectedStamp?.id === stamp.id ? null : stamp
                  )
                }
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  selectedStamp?.id === stamp.id
                    ? "bg-amber-100 ring-2 ring-amber-400 scale-110"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span className="text-3xl">{stamp.emoji}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                  {stamp.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ひとことメッセージ */}
        <div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ひとこと メッセージ（なくてもOK）"
            className="h-10"
            maxLength={100}
          />
        </div>

        {/* 選択プレビュー */}
        {(selectedStamp || message) && (
          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
            {selectedStamp && (
              <span className="text-5xl block mb-1">{selectedStamp.emoji}</span>
            )}
            {selectedStamp && (
              <p className="text-sm font-semibold text-amber-700">
                {selectedStamp.label}
              </p>
            )}
            {message && (
              <p className="text-sm text-amber-600 mt-1">「{message}」</p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleQuickApprove}
          >
            スタンプなしで承認
          </Button>
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={handleSubmit}
          >
            ✓ おくって承認
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
