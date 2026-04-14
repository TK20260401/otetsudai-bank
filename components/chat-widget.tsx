"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "assistant"; content: string };

const CHILD_SUGGESTIONS = [
  "クエストのコツをおしえて",
  "貯金ってなに？",
  "バッジをあつめたい！",
  "ごほうびの使いかた",
];

const PARENT_SUGGESTIONS = [
  "年齢別おすすめのクエストは？",
  "報酬の金額の目安を教えて",
  "お金の教育で大切なことは？",
  "子どものやる気を引き出すには？",
];

const GUEST_SUGGESTIONS = [
  "このアプリはなに？",
  "始めかたをおしえて",
  "どんな機能がある？",
  "親はなにができる？",
];

export default function ChatWidget({ role }: { role: "parent" | "child" | "guest" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isChild = role === "child";
  const suggestions = role === "child" ? CHILD_SUGGESTIONS : role === "parent" ? PARENT_SUGGESTIONS : GUEST_SUGGESTIONS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, role }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isChild
            ? "ごめんね、うまくいかなかったよ 😢"
            : "エラーが発生しました。",
        },
      ]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all ${
          isChild
            ? "bg-amber-500 hover:bg-amber-600"
            : "bg-violet-600 hover:bg-violet-700"
        } text-white`}
        aria-label="AIアシスタント"
      >
        {open ? "✕" : isChild ? "🪙" : "💬"}
      </button>

      {/* チャットパネル */}
      {open && (
        <div className="fixed bottom-20 right-5 left-5 sm:left-auto z-50 sm:w-[370px] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white flex flex-col"
          style={{ maxHeight: "min(500px, 70vh)" }}>
          {/* ヘッダー */}
          <div
            className={`px-4 py-3 text-white text-sm font-semibold flex items-center gap-2 ${
              isChild ? "bg-amber-500" : "bg-violet-600"
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full bg-green-400"
            ></span>
            {role === "child" ? "🪙 コインくん" : role === "parent" ? "💼 クエストアドバイザー" : "⚔️ クエストガイド"}
          </div>

          {/* メッセージ */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 200 }}>
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-4">
                {role === "child"
                  ? "コインくんになんでもきいてね！🪙"
                  : role === "parent"
                    ? "クエスト教育についてご相談ください"
                    : "おこづかいクエストについて何でもきいてね！"}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? `ml-auto text-white ${isChild ? "bg-amber-500 rounded-br-sm" : "bg-violet-600 rounded-br-sm"}`
                    : "bg-gray-100 text-gray-700 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 text-gray-400 max-w-[80%] px-3 py-2 rounded-xl text-sm rounded-bl-sm">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* サジェスト（最初だけ表示） */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                    isChild
                      ? "border-amber-300 text-amber-600 hover:bg-amber-50"
                      : "border-violet-300 text-violet-600 hover:bg-violet-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* 入力 */}
          <div className="flex gap-2 p-3 border-t border-gray-200">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={isChild ? "きいてみよう..." : "メッセージを入力..."}
              className="flex-1 text-sm"
              disabled={loading}
            />
            <Button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              size="sm"
              className={`${isChild ? "bg-amber-500 hover:bg-amber-600" : "bg-violet-600 hover:bg-violet-700"} text-white`}
            >
              送信
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
