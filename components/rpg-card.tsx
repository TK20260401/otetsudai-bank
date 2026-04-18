"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

type Tier = "gold" | "silver" | "bronze" | "violet";
type Variant = "full" | "compact";

type Props = {
  tier?: Tier;
  variant?: Variant;
  className?: string;
  contentClassName?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
};

const TIER_COLORS: Record<Tier, { light: string; mid: string; dark: string; gem: string; gemShine: string; glow: string }> = {
  gold:   { light: "#FFE066", mid: "#FFA623", dark: "#A86500", gem: "#E74C3C", gemShine: "#FFB9B0", glow: "rgba(255,166,35,0.45)" },
  silver: { light: "#E6EAF0", mid: "#A8B0BC", dark: "#5E6672", gem: "#3498DB", gemShine: "#AEDBFA", glow: "rgba(168,176,188,0.4)" },
  bronze: { light: "#E0B98A", mid: "#A87044", dark: "#5E3A20", gem: "#F1C40F", gemShine: "#FFE896", glow: "rgba(168,112,68,0.45)" },
  violet: { light: "#B79BFF", mid: "#6B4CDB", dark: "#321C7A", gem: "#F9C33B", gemShine: "#FFE39B", glow: "rgba(107,76,219,0.45)" },
};

/**
 * SVG装飾付きRPGカードフレーム
 * 四隅のピクセル宝石 + 上下ゴールドグラデ帯 + 外側グロウ
 */
export default function RpgCard({ tier = "gold", variant = "full", className, contentClassName, title, children }: Props) {
  const uid = useId().replace(/[:]/g, "");
  const c = TIER_COLORS[tier];
  const gradId = `rpgcard-${uid}`;
  const glowId = `rpgglow-${uid}`;
  const barHeight = variant === "compact" ? 5 : 8;

  return (
    <div
      className={cn("relative rounded-xl overflow-hidden", className)}
      style={{
        backgroundColor: "var(--card)",
        boxShadow: `0 0 14px ${c.glow}, 0 2px 6px rgba(0,0,0,0.35), inset 0 0 0 1px ${c.mid}`,
      }}
    >
      {/* 上部装飾帯 */}
      <svg
        width="100%"
        height={barHeight}
        viewBox={`0 0 300 ${barHeight}`}
        preserveAspectRatio="none"
        aria-hidden
        className="block"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.dark} />
            <stop offset="18%" stopColor={c.mid} />
            <stop offset="50%" stopColor={c.light} />
            <stop offset="82%" stopColor={c.mid} />
            <stop offset="100%" stopColor={c.dark} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.gemShine} stopOpacity="1" />
            <stop offset="100%" stopColor={c.gem} stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={300} height={barHeight - 2} fill={`url(#${gradId})`} />
        <rect x={0} y={barHeight - 2} width={300} height={1} fill={c.dark} opacity={0.6} />
        {/* 左コーナー宝石 */}
        <rect x={2} y={1} width={4} height={4} fill={c.dark} />
        <rect x={3} y={2} width={2} height={2} fill={`url(#${glowId})`} />
        {/* 右コーナー宝石 */}
        <rect x={294} y={1} width={4} height={4} fill={c.dark} />
        <rect x={295} y={2} width={2} height={2} fill={`url(#${glowId})`} />
        {/* 中央装飾 */}
        {tier === "gold" && (
          <g>
            <path d={`M145,0 L150,${barHeight} L155,0 Z`} fill={c.gem} />
            <rect x={149} y={1} width={2} height={2} fill={c.gemShine} />
          </g>
        )}
        {tier === "violet" && (
          <g>
            <rect x={146} y={1} width={8} height={barHeight - 3} fill={c.gem} />
            <rect x={148} y={2} width={4} height={2} fill={c.gemShine} />
          </g>
        )}
      </svg>

      {title && (
        <div
          className="px-4 py-2 border-b text-sm font-bold flex items-center gap-1.5"
          style={{ color: c.light, borderBottomColor: `${c.mid}33`, backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          {title}
        </div>
      )}

      {/* コンテンツ */}
      <div className={cn(variant === "compact" ? "px-3 py-2" : "px-4 py-3", contentClassName)}>
        {children}
      </div>

      {/* 下部装飾帯 */}
      <svg
        width="100%"
        height={barHeight - 2}
        viewBox={`0 0 300 ${barHeight - 2}`}
        preserveAspectRatio="none"
        aria-hidden
        className="block"
      >
        <rect x={0} y={0} width={300} height={barHeight - 2} fill={`url(#${gradId})`} />
      </svg>
    </div>
  );
}
