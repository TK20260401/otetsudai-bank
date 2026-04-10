"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  target_role: "all" | "parent" | "child";
  priority: "normal" | "important" | "urgent";
  created_at: string;
};

const PRIORITY_STYLES = {
  normal: "bg-blue-50 border-blue-200 text-blue-800",
  important: "bg-yellow-50 border-yellow-200 text-yellow-800",
  urgent: "bg-red-50 border-red-200 text-red-800",
};

const PRIORITY_ICONS = {
  normal: "ℹ️",
  important: "⚠️",
  urgent: "🚨",
};

export function AnnouncementBanner({ role }: { role: "parent" | "child" }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    // 既読リスト取得
    try {
      const stored = localStorage.getItem("dismissed_announcements");
      if (stored) setDismissed(JSON.parse(stored));
    } catch { /* ignore */ }

    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data: Announcement[]) => {
        const filtered = data.filter(
          (a) => a.target_role === "all" || a.target_role === role
        );
        setAnnouncements(filtered);
      })
      .catch(() => {});
  }, [role]);

  function handleDismiss(id: string) {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem("dismissed_announcements", JSON.stringify(updated));
  }

  // 表示対象: urgentは常に表示、それ以外はdismissされていなければ表示。最大3件
  const visible = announcements
    .filter((a) => a.priority === "urgent" || !dismissed.includes(a.id))
    .slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visible.map((a) => (
        <div
          key={a.id}
          className={`border rounded-lg px-3 py-2 ${PRIORITY_STYLES[a.priority]}`}
        >
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0">{PRIORITY_ICONS[a.priority]}</span>
            <button
              className="flex-1 text-left text-sm font-medium truncate"
              onClick={() => setExpanded(expanded === a.id ? null : a.id)}
            >
              {a.title}
              {expanded !== a.id && (
                <span className="font-normal opacity-70 ml-2">
                  — {a.body.split("\n")[0]}
                </span>
              )}
            </button>
            <button
              className="flex-shrink-0 text-xs opacity-50 hover:opacity-100 px-1"
              onClick={() => handleDismiss(a.id)}
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
          {expanded === a.id && (
            <div className="mt-2 text-sm whitespace-pre-wrap pl-7">
              {a.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
