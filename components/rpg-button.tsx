"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

type Tier = "gold" | "silver" | "violet" | "emerald" | "ruby" | "sapphire";
type Size = "sm" | "md" | "lg";

type Props = {
  tier?: Tier;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  title?: string;
  ariaLabel?: string;
};

const TIER_COLORS: Record<Tier, { light: string; mid: string; dark: string; stroke: string; text: string; glow: string }> = {
  gold:     { light: "#FFE066", mid: "#FFA623", dark: "#8A5200", stroke: "#6B3E00", text: "#2A1800", glow: "rgba(255,166,35,0.55)" },
  silver:   { light: "#EFF1F5", mid: "#B0B7C2", dark: "#5E6672", stroke: "#3A4048", text: "#1A1D22", glow: "rgba(176,183,194,0.45)" },
  violet:   { light: "#B79BFF", mid: "#6B4CDB", dark: "#321C7A", stroke: "#1E0F4D", text: "#FFFFFF", glow: "rgba(107,76,219,0.55)" },
  emerald:  { light: "#5EE89E", mid: "#2ECC71", dark: "#157A40", stroke: "#0A4526", text: "#02160C", glow: "rgba(46,204,113,0.55)" },
  ruby:     { light: "#FF9088", mid: "#E74C3C", dark: "#8A2218", stroke: "#4D110B", text: "#FFFFFF", glow: "rgba(231,76,60,0.55)" },
  sapphire: { light: "#6FBDF0", mid: "#3498DB", dark: "#164E72", stroke: "#0B2B41", text: "#FFFFFF", glow: "rgba(52,152,219,0.55)" },
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

/**
 * SVG装飾ゴールドCTAボタン
 * 上下ピクセルストライプ + グラデーション + 内側ハイライト
 */
export default function RpgButton({
  tier = "gold",
  size = "md",
  className,
  fullWidth,
  disabled,
  onClick,
  type = "button",
  children,
  title,
  ariaLabel,
}: Props) {
  const uid = useId().replace(/[:]/g, "");
  const c = TIER_COLORS[tier];
  const gradId = `rpgbtn-${uid}`;
  const shineId = `rpgbtn-shine-${uid}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center justify-center font-bold rounded-lg overflow-hidden select-none transition-transform",
        "active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent",
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className
      )}
      style={{
        color: c.text,
        boxShadow: disabled
          ? "none"
          : `0 0 12px ${c.glow}, 0 2px 4px rgba(0,0,0,0.45), inset 0 -2px 0 ${c.dark}, inset 0 0 0 1px ${c.stroke}`,
      }}
    >
      {/* 背景グラデーション */}
      <svg
        aria-hidden
        width="100%"
        height="100%"
        viewBox="0 0 200 48"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.light} />
            <stop offset="45%" stopColor={c.mid} />
            <stop offset="100%" stopColor={c.dark} />
          </linearGradient>
          <linearGradient id={shineId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={200} height={48} fill={`url(#${gradId})`} />
        {/* 上部ハイライト */}
        <rect x={0} y={0} width={200} height={18} fill={`url(#${shineId})`} />
        {/* 上部ピクセルストライプ */}
        <rect x={0} y={0} width={200} height={2} fill={c.light} opacity={0.8} />
        <rect x={0} y={2} width={200} height={1} fill="#ffffff" opacity={0.35} />
        {/* 下部ピクセル影 */}
        <rect x={0} y={45} width={200} height={3} fill={c.dark} opacity={0.7} />
        <rect x={0} y={44} width={200} height={1} fill={c.dark} opacity={0.4} />
        {/* コーナー宝石（ゴールド/バイオレット のみ） */}
        {(tier === "gold" || tier === "violet") && (
          <g opacity={0.85}>
            <rect x={3} y={3} width={3} height={3} fill={c.light} />
            <rect x={194} y={3} width={3} height={3} fill={c.light} />
            <rect x={3} y={42} width={3} height={3} fill={c.dark} />
            <rect x={194} y={42} width={3} height={3} fill={c.dark} />
          </g>
        )}
      </svg>

      <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
        {children}
      </span>
    </button>
  );
}
