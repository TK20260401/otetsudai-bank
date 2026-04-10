"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStampById } from "@/lib/stamps";
import { Card, CardContent } from "@/components/ui/card";
import { R } from "@/components/ruby-text";

type StampNotification = {
  id: string;
  stamp: string | null;
  message: string | null;
  taskTitle: string;
  approvedAt: string;
};

type Props = {
  childId: string;
};

export function StampNotifications({ childId }: Props) {
  const [notifications, setNotifications] = useState<StampNotification[]>([]);

  useEffect(() => {
    async function load() {
      // 直近のスタンプ付き承認を取得（最新5件）
      const { data } = await supabase
        .from("otetsudai_task_logs")
        .select("id, approval_stamp, approval_message, approved_at, task:otetsudai_tasks(title)")
        .eq("child_id", childId)
        .eq("status", "approved")
        .not("approval_stamp", "is", null)
        .order("approved_at", { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.map((d: any) => ({
            id: d.id,
            stamp: d.approval_stamp,
            message: d.approval_message,
            taskTitle: Array.isArray(d.task) ? d.task[0]?.title || "" : d.task?.title || "",
            approvedAt: d.approved_at,
          }))
        );
      }
    }
    load();
  }, [childId]);

  if (notifications.length === 0) return null;

  return (
    <Card className="mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
      <CardContent className="p-4">
        <p className="text-sm font-bold text-amber-700 mb-2">
          💌 <R k="親" r="おや" />からの メッセージ
        </p>
        <div className="space-y-2">
          {notifications.map((n) => {
            const stamp = n.stamp ? getStampById(n.stamp) : null;
            return (
              <div
                key={n.id}
                className="flex items-center gap-3 bg-white/70 rounded-xl p-2 border border-amber-100"
              >
                {stamp && (
                  <span className="text-3xl flex-shrink-0">{stamp.emoji}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    {stamp?.label}
                  </p>
                  {n.message && (
                    <p className="text-xs text-amber-600">「{n.message}」</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {n.taskTitle} ・{" "}
                    {new Date(n.approvedAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
