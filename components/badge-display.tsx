"use client";

import type { Badge } from "@/lib/types";
import { BADGE_DEFINITIONS } from "@/lib/badges";

/** ピクセルアートのミニメダルフレーム */
function PixelMiniMedal({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="absolute inset-0">
      <defs>
        <linearGradient id="bm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
      </defs>
      <circle cx={14} cy={14} r={13} fill="url(#bm-gold)" />
      <circle cx={14} cy={14} r={10.5} fill="none" stroke="#B8860B" strokeWidth={1} />
      <circle cx={14} cy={14} r={9} fill="#fef3e0" />
    </svg>
  );
}

export default function BadgeDisplay({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="flex gap-1.5 flex-wrap">
      {badges.map((b) => {
        const def = BADGE_DEFINITIONS[b.badge_type];
        if (!def) return null;
        return (
          <span
            key={b.id}
            title={def.description}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-xs cursor-default"
          >
            <span className="relative w-7 h-7 flex items-center justify-center">
              <PixelMiniMedal size={28} />
              <span className="relative text-sm z-10">{def.emoji}</span>
            </span>
            <span className="text-amber-700 hidden sm:inline font-bold">{def.label}</span>
          </span>
        );
      })}
    </div>
  );
}
