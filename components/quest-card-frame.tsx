"use client";

import React from "react";

type Tier = "bronze" | "silver" | "gold";

type Props = {
  tier: Tier;
  children: React.ReactNode;
};

const TIER_COLORS = {
  bronze: { light: "#D8A878", mid: "#A0704C", dark: "#6B4430", gem: "#8B5E3C" },
  silver: { light: "#D8DEE4", mid: "#A0A8B0", dark: "#6B7580", gem: "#C0C8D0" },
  gold:   { light: "#FFE066", mid: "#DAA520", dark: "#B8860B", gem: "#E74C3C" },
};

/**
 * RPGクエストカードフレーム
 * クエストカードの周囲にピクセルアート風の装飾ボーダーを描画
 */
export default function QuestCardFrame({ tier, children }: Props) {
  const c = TIER_COLORS[tier];
  const gradId = `qf-${tier}`;

  return (
    <div className="mb-2 rounded-lg overflow-hidden shadow-sm" style={{ border: `3px solid ${c.mid}` }}>
      {/* 上部装飾バー */}
      <svg width="100%" height="8" viewBox="0 0 300 8" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.dark} />
            <stop offset="20%" stopColor={c.mid} />
            <stop offset="50%" stopColor={c.light} />
            <stop offset="80%" stopColor={c.mid} />
            <stop offset="100%" stopColor={c.dark} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={300} height={4} fill={`url(#${gradId})`} />
        <rect x={0} y={5} width={300} height={1} fill={c.dark} opacity={0.3} />
        <circle cx={8} cy={4} r={3} fill={c.gem} />
        <circle cx={292} cy={4} r={3} fill={c.gem} />
        {tier === "gold" && (
          <g>
            <path d="M145,0 L150,6 L155,0 Z" fill={c.gem} />
            <circle cx={150} cy={2} r={1.5} fill="#3498DB" />
          </g>
        )}
        {tier === "silver" && (
          <circle cx={150} cy={3} r={2} fill={c.gem} />
        )}
      </svg>

      {/* コンテンツ */}
      <div className="bg-white px-4 py-3">
        {children}
      </div>

      {/* 下部���飾バー */}
      <svg width="100%" height="4" viewBox="0 0 300 4" preserveAspectRatio="none">
        <rect x={0} y={0} width={300} height={4} fill={`url(#${gradId})`} />
      </svg>
    </div>
  );
}
