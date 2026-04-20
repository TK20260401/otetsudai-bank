"use client";

import { useEffect, useState, useCallback } from "react";
import BackgroundAmbient from "@/components/background-ambient";
import CharacterSvg from "@/components/character-svg";
import PixelMonsterSvg, { MONSTER_TYPES } from "@/components/pixel-monster-svg";
import { GoldCoinIcon } from "@/components/pixel-item-icons";

type Props = {
  show: boolean;
  level: number;
  onComplete: () => void;
};

type Phase = "enter" | "attack" | "hit" | "defeat" | "coins" | "done";

/**
 * バトルシーン演出（Web版）
 * キャラクターが斬撃→モンスター撃破→コイン落下の2.5秒アニメ
 */
export default function BattleScene({ show, level, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("enter");
  const [monsterType] = useState(() => MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)]);

  const startSequence = useCallback(() => {
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motionOk) {
      setPhase("done");
      setTimeout(onComplete, 300);
      return;
    }

    setPhase("enter");
    setTimeout(() => setPhase("attack"), 400);
    setTimeout(() => setPhase("hit"), 800);
    setTimeout(() => setPhase("defeat"), 1200);
    setTimeout(() => setPhase("coins"), 1700);
    setTimeout(() => setPhase("done"), 2500);
    setTimeout(onComplete, 2800);
  }, [onComplete]);

  useEffect(() => {
    if (show) startSequence();
  }, [show, startSequence]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[300px] h-[200px]">
        {/* 背景 */}
        <svg className="absolute inset-0" viewBox="0 0 300 200">
          <defs>
            <linearGradient id="bs-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A1A2E" />
              <stop offset="100%" stopColor="#2D2D44" />
            </linearGradient>
          </defs>
          <rect width={300} height={200} fill="url(#bs-sky)" rx={12} />
          {/* 地面 */}
          <rect x={0} y={160} width={300} height={40} fill="#3A3A2E" rx={0} />
          <rect x={0} y={160} width={300} height={3} fill="#4A6A30" />
        </svg>

        {/* 背景アンビエント */}
        <BackgroundAmbient preset="dungeon" />

        {/* キャラクター（左側） */}
        <div
          className="absolute bottom-[44px] transition-all duration-300 ease-out"
          style={{
            left: phase === "enter" ? -60 : phase === "attack" ? 100 : 40,
            opacity: phase === "enter" ? 0 : 1,
          }}
        >
          <CharacterSvg level={Math.min(level, 7)} mood="active" size={64} animated mode={phase === "enter" ? "walk" : "idle"} />
        </div>

        {/* 斬撃エフェクト */}
        {phase === "attack" && (
          <div className="absolute left-[140px] bottom-[60px] animate-ping">
            <svg width={40} height={40} viewBox="0 0 40 40">
              <line x1={5} y1={5} x2={35} y2={35} stroke="#FFD700" strokeWidth={3} />
              <line x1={35} y1={5} x2={5} y2={35} stroke="#FFD700" strokeWidth={3} />
              <line x1={20} y1={0} x2={20} y2={40} stroke="#FFE066" strokeWidth={2} />
            </svg>
          </div>
        )}

        {/* モンスター（右側） */}
        <div
          className="absolute right-[40px] bottom-[44px] transition-all duration-300"
          style={{
            opacity: phase === "defeat" || phase === "coins" || phase === "done" ? 0 : 1,
            transform: phase === "hit" ? "translateX(8px) scale(1.1)" : phase === "defeat" ? "scale(0.3)" : "scale(1)",
            filter: phase === "hit" ? "brightness(3)" : "none",
          }}
        >
          <PixelMonsterSvg type={monsterType} size={56} />
        </div>

        {/* VICTORY テキスト */}
        {(phase === "coins" || phase === "done") && (
          <div className="absolute top-4 left-0 right-0 text-center">
            <span className="text-xl font-bold text-amber-400" style={{
              textShadow: "0 0 10px #FFD700",
            }}>
              VICTORY!
            </span>
          </div>
        )}

        {/* コイン落下 */}
        {(phase === "coins" || phase === "done") && (
          <div className="absolute right-[50px] bottom-[50px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  animation: `battleCoinDrop 0.8s ease-out forwards`,
                  animationDelay: `${i * 0.1}s`,
                  ["--dx" as string]: `${(i - 2) * 20}px`,
                }}
              >
                <GoldCoinIcon size={16} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes battleCoinDrop {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          40% { transform: translate(var(--dx), -30px) scale(1.2); opacity: 1; }
          100% { transform: translate(var(--dx), 40px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
