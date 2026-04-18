"use client";

import React from "react";
import type { RpgStats } from "@/lib/rpg-stats";

type Props = {
  stats: RpgStats;
  appearance: string;
};

/**
 * RPG装備ステータスシート（Web版）
 */
export default function EquipmentView({ stats, appearance }: Props) {
  return (
    <div className="bg-[#1A1A2E]/90 rounded-lg p-2 mt-1.5 border border-amber-500/30">
      <p className="text-[9px] text-amber-500 text-center font-bold mb-1">{appearance}</p>
      <div className="flex justify-around">
        <StatItem icon="sword" label="ATK" value={stats.atk} color="#E74C3C" />
        <StatItem icon="shield" label="DEF" value={stats.def} color="#3498DB" />
        <StatItem icon="clover" label="LCK" value={stats.lck} color="#2ECC71" />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <StatIcon type={icon} color={color} />
      <span className="text-[8px] font-bold" style={{ color }}>{label}</span>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}

function StatIcon({ type, color }: { type: string; color: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16">
      {type === "sword" && (
        <g>
          <rect x={7} y={1} width={2} height={9} rx={0.5} fill={color} />
          <rect x={5} y={9} width={6} height={2} rx={1} fill={color} />
          <rect x={6.5} y={11} width={3} height={3} rx={0.5} fill="#8B6914" />
        </g>
      )}
      {type === "shield" && (
        <path d="M8,1 L14,4 L14,9 Q14,14 8,15 Q2,14 2,9 L2,4 Z" fill={color} opacity={0.8} />
      )}
      {type === "clover" && (
        <g>
          <path d="M8,3 Q5,3 5,5.5 Q5,8 8,8 Q11,8 11,5.5 Q11,3 8,3Z" fill={color} />
          <path d="M5,8 Q3,8 3,10 Q3,12 5.5,12 Q8,12 8,10 Q8,8 5,8Z" fill={color} />
          <path d="M11,8 Q13,8 13,10 Q13,12 10.5,12 Q8,12 8,10 Q8,8 11,8Z" fill={color} />
          <rect x={7.5} y={11} width={1} height={4} fill="#5D4037" />
        </g>
      )}
    </svg>
  );
}
