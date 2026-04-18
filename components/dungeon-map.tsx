"use client";

import React from "react";
import { getDungeonFloor, type DungeonFloor } from "@/lib/rpg-stats";

type Props = {
  totalQuests: number;
};

/**
 * ダンジョンフロア進行マップ（Web版）
 * 10クエスト=1フロア、5F毎にボス扉、3F毎に宝物部屋
 */
export default function DungeonMap({ totalQuests }: Props) {
  const { floor, type, progress } = getDungeonFloor(totalQuests);

  // 表示するフロア範囲（現在フロア±2）
  const floors: { num: number; info: DungeonFloor }[] = [];
  for (let i = floor + 2; i >= Math.max(1, floor - 2); i--) {
    floors.push({ num: i, info: getDungeonFloor((i - 1) * 10) });
  }

  return (
    <div className="mt-3">
      <svg width="100%" height={180} viewBox="0 0 300 180">
        <defs>
          <linearGradient id="dm-stone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A4A5E" />
            <stop offset="100%" stopColor="#2A2A3E" />
          </linearGradient>
          <linearGradient id="dm-boss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5E2A2A" />
            <stop offset="100%" stopColor="#3E1A1A" />
          </linearGradient>
          <linearGradient id="dm-treasure" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5E5A2A" />
            <stop offset="100%" stopColor="#3E3A1A" />
          </linearGradient>
        </defs>

        {/* 背景 */}
        <rect width={300} height={180} rx={8} fill="#1A1A2E" />

        {/* フロア描画 */}
        {floors.map((f, idx) => {
          const y = idx * 34 + 8;
          const isCurrent = f.num === floor;
          const floorType = f.info.type;
          const bgFill = floorType === "boss" ? "url(#dm-boss)" : floorType === "treasure" ? "url(#dm-treasure)" : "url(#dm-stone)";

          return (
            <g key={f.num}>
              {/* フロア背景 */}
              <rect x={10} y={y} width={280} height={28} rx={4} fill={bgFill}
                stroke={isCurrent ? "#FFD700" : "#333"} strokeWidth={isCurrent ? 2 : 1} />

              {/* フロア番号 */}
              <text x={24} y={y + 18} fontSize={10} fontWeight="bold" fill={isCurrent ? "#FFD700" : "#888"} textAnchor="middle">
                B{f.num}F
              </text>

              {/* フロアタイプアイコン */}
              {floorType === "boss" && (
                <g transform={`translate(42, ${y + 6})`}>
                  {/* ドクロ */}
                  <circle cx={8} cy={6} r={5} fill="#E74C3C" opacity={0.8} />
                  <rect x={5} y={10} width={6} height={4} rx={1} fill="#E74C3C" opacity={0.6} />
                  <circle cx={6} cy={5} r={1.5} fill="#1A1A2E" />
                  <circle cx={10} cy={5} r={1.5} fill="#1A1A2E" />
                </g>
              )}
              {floorType === "treasure" && (
                <g transform={`translate(42, ${y + 6})`}>
                  {/* 宝箱 */}
                  <rect x={2} y={6} width={12} height={8} rx={1} fill="#DAA520" />
                  <rect x={2} y={2} width={12} height={6} rx={1} fill="#A0724A" />
                  <rect x={6} y={7} width={4} height={3} rx={1} fill="#FFD700" />
                </g>
              )}
              {floorType === "normal" && (
                <g transform={`translate(42, ${y + 6})`}>
                  {/* たいまつ */}
                  <rect x={7} y={6} width={2} height={8} fill="#8B5E3C" />
                  <circle cx={8} cy={5} r={3} fill="#FF8C00" opacity={0.8} />
                  <circle cx={8} cy={4} r={2} fill="#FFD700" opacity={0.6} />
                </g>
              )}

              {/* フロア名 */}
              <text x={66} y={y + 18} fontSize={9} fill={isCurrent ? "#FFF" : "#666"}>
                {floorType === "boss" ? "ボスフロア" : floorType === "treasure" ? "たからべや" : `フロア ${f.num}`}
              </text>

              {/* 現在フロアのプログレスバー */}
              {isCurrent && (
                <g>
                  <rect x={150} y={y + 8} width={100} height={10} rx={5} fill="#2A2A3E" />
                  <rect x={150} y={y + 8} width={progress * 10} height={10} rx={5} fill="#FFD700" />
                  <text x={255} y={y + 17} fontSize={8} fill="#FFD700" textAnchor="start">
                    {progress}/10
                  </text>
                </g>
              )}

              {/* 未到達フロアはロック表示 */}
              {f.num > floor && (
                <g>
                  <rect x={150} y={y + 8} width={100} height={10} rx={5} fill="#222" />
                  <text x={200} y={y + 17} fontSize={8} fill="#444" textAnchor="middle">???</text>
                </g>
              )}

              {/* クリア済みフロアはチェック */}
              {f.num < floor && (
                <text x={270} y={y + 18} fontSize={10} fill="#4CAF50" textAnchor="middle">
                  ✓
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
