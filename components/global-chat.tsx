"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/session";
import ChatWidget from "@/components/chat-widget";

export default function GlobalChat() {
  const [role, setRole] = useState<"parent" | "child" | "guest">("guest");

  useEffect(() => {
    const session = getSession();
    if (session) {
      setRole(session.role === "parent" ? "parent" : "child");
    } else {
      setRole("guest");
    }
  }, []);

  // セッション変更を検知（ログイン/ログアウト時）
  useEffect(() => {
    function handleStorage() {
      const session = getSession();
      setRole(session ? (session.role === "parent" ? "parent" : "child") : "guest");
    }
    window.addEventListener("storage", handleStorage);
    // ページ遷移時にも再判定
    const interval = setInterval(() => {
      const session = getSession();
      const newRole = session ? (session.role === "parent" ? "parent" : "child") : "guest";
      if (newRole !== role) setRole(newRole);
    }, 2000);
    return () => { window.removeEventListener("storage", handleStorage); clearInterval(interval); };
  }, [role]);

  return <ChatWidget role={role} />;
}
