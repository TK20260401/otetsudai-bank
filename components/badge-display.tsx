"use client";

import type { Badge } from "@/lib/types";
import { BADGE_DEFINITIONS } from "@/lib/badges";

export default function BadgeDisplay({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="flex gap-1 flex-wrap">
      {badges.map((b) => {
        const def = BADGE_DEFINITIONS[b.badge_type];
        if (!def) return null;
        return (
          <span
            key={b.id}
            title={def.description}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-xs cursor-default"
          >
            <span className="text-base">{def.emoji}</span>
            <span className="text-amber-700 hidden sm:inline">{def.label}</span>
          </span>
        );
      })}
    </div>
  );
}
