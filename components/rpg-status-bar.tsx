"use client";

import React from "react";

type Props = {
  hp: number;     // 0-100
  mp: number;     // 連続週数
  exp: number;    // 0-100
  maxMp?: number;
};

/**
 * RPG 3ゲージステータスバー（Web版）
 */
export default function RpgStatusBar({ hp, mp, exp, maxMp = 10 }: Props) {
  const mpPercent = Math.min(100, Math.round((mp / maxMp) * 100));

  return (
    <div className="bg-[#1A1A2E] rounded-lg p-2 space-y-1">
      <GaugeRow label="HP" value={hp} color1="#E74C3C" color2="#C0392B" icon="heart" suffix={`${Math.round(hp)}%`} />
      <GaugeRow label="MP" value={mpPercent} color1="#3498DB" color2="#2980B9" icon="magic" suffix={`${mp}wk`} />
      <GaugeRow label="EXP" value={exp} color1="#FFD700" color2="#DAA520" icon="sword" suffix={`${exp}%`} />
    </div>
  );
}

function GaugeRow({ label, value, color1, color2, icon, suffix }: {
  label: string; value: number; color1: string; color2: string;
  icon: "heart" | "magic" | "sword"; suffix: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-1">
      <GaugeIcon type={icon} />
      <span className="text-[9px] font-bold w-6" style={{ color: color1 }}>{label}</span>
      <div className="flex-1 h-3 relative">
        <svg width="100%" height="12" viewBox="0 0 200 12" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`g-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={200} height={12} rx={6} fill="#2A2A3E" />
          <rect x={0} y={0} width={pct * 2} height={12} rx={6} fill={`url(#g-${label})`} />
          <rect x={0} y={1} width={pct * 2} height={4} rx={3} fill="#FFFFFF" opacity={0.2} />
          {[25, 50, 75].map((seg) => (
            <rect key={seg} x={seg * 2 - 0.5} y={0} width={1} height={12} fill="#1A1A2E" opacity={0.4} />
          ))}
        </svg>
      </div>
      <span className="text-[9px] text-gray-400 w-8 text-right">{suffix}</span>
    </div>
  );
}

function GaugeIcon({ type }: { type: "heart" | "magic" | "sword" }) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14">
      {type === "heart" && (
        <path d="M7,12 C3,9 1,6 1,4 C1,2 3,1 5,2 L7,4 L9,2 C11,1 13,2 13,4 C13,6 11,9 7,12Z" fill="#E74C3C" />
      )}
      {type === "magic" && (
        <path d="M7,1 L8,5 L12,5 L9,8 L10,12 L7,10 L4,12 L5,8 L2,5 L6,5Z" fill="#3498DB" />
      )}
      {type === "sword" && (
        <g>
          <rect x={6} y={1} width={2} height={8} rx={0.5} fill="#FFD700" />
          <rect x={4} y={8} width={6} height={2} rx={1} fill="#DAA520" />
          <rect x={5.5} y={10} width={3} height={3} rx={0.5} fill="#8B6914" />
        </g>
      )}
    </svg>
  );
}
