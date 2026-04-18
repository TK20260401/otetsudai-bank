"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PixelDoorIcon } from "@/components/pixel-icons";
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  userName?: string;
  backHref?: string;
  pendingCount?: number;
  rightActions?: ReactNode;
};

export default function CommonHeader({ title, userName, backHref, pendingCount, rightActions }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {backHref && (
          <Button variant="ghost" size="sm" onClick={() => router.push(backHref)}>
            <PixelDoorIcon size={14} />
          </Button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-amber-800 sm:text-2xl whitespace-nowrap">{title}</h1>
            {pendingCount !== undefined && pendingCount > 0 && (
              <Badge variant="destructive" className="text-xs">{pendingCount}</Badge>
            )}
          </div>
          {userName && (
            <p className="text-sm text-muted-foreground">{userName} さん</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightActions}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
        >
          <span className="flex items-center gap-1"><PixelDoorIcon size={16} /> ログアウト</span>
        </Button>
      </div>
    </div>
  );
}
