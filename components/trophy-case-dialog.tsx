"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RpgButton from "@/components/rpg-button";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { supabase } from "@/lib/supabase";
import type { Badge } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  childId: string;
};

export default function TrophyCaseDialog({ open, onClose, childId }: Props) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("otetsudai_badges")
      .select("*")
      .eq("child_id", childId)
      .order("earned_at", { ascending: true })
      .then(({ data }) => {
        setBadges((data as Badge[]) || []);
        setLoading(false);
      });
  }, [open, childId]);

  const earnedMap = useMemo(() => {
    const map = new Map<string, Badge>();
    for (const b of badges) map.set(b.badge_type, b);
    return map;
  }, [badges]);

  const entries = Object.entries(BADGE_DEFINITIONS);
  const earnedCount = entries.filter(([key]) => earnedMap.has(key)).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🏆 トロフィーケース</DialogTitle>
          <DialogDescription>
            しゅとく {earnedCount} / {entries.length} バッジ
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">よみこみ中...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {entries.map(([key, def]) => {
              const earned = earnedMap.get(key);
              const isEarned = !!earned;
              return (
                <div
                  key={key}
                  className={`rounded-xl border-2 p-3 transition-all ${
                    isEarned
                      ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(255,166,35,0.25)]"
                      : "border-border bg-muted/40 opacity-60"
                  }`}
                >
                  <div className="text-center text-4xl mb-2" aria-hidden>
                    {isEarned ? def.emoji : "🔒"}
                  </div>
                  <p
                    className={`text-center text-sm font-bold ${
                      isEarned ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {isEarned ? def.label : "？？？"}
                  </p>
                  <p className="text-center text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    {def.description}
                  </p>
                  {isEarned && earned && (
                    <p className="text-center text-[9px] text-accent mt-1">
                      {new Date(earned.earned_at).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <RpgButton tier="silver" size="md" fullWidth onClick={onClose}>
            とじる
          </RpgButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
