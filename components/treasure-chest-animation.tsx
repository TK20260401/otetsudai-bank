"use client";

import { useEffect, useState } from "react";
import { GoldCoinIcon } from "@/components/pixel-item-icons";
import { PixelConfettiIcon } from "@/components/pixel-icons";

type Props = {
  show: boolean;
  onComplete: () => void;
};

/**
 * 宝箱オープン演出（Web版）
 * 宝箱が揺れて開き、コインが飛び出すアニメーション
 */
export default function TreasureChestAnimation({ show, onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "shake" | "open" | "burst" | "done">("idle");

  useEffect(() => {
    if (!show) { setPhase("idle"); return; }

    // prefers-reduced-motion check
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motionOk) {
      setPhase("done");
      setTimeout(onComplete, 500);
      return;
    }

    setPhase("shake");
    const t1 = setTimeout(() => setPhase("open"), 600);
    const t2 = setTimeout(() => setPhase("burst"), 1000);
    const t3 = setTimeout(() => setPhase("done"), 2500);
    const t4 = setTimeout(onComplete, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* バナー */}
      {(phase === "burst" || phase === "done") && (
        <div className="absolute top-1/4 text-3xl font-bold text-amber-500 animate-bounce flex items-center gap-2">
          クエストクリア！<PixelConfettiIcon size={28} />
        </div>
      )}

      {/* 宝箱 */}
      <div className={`transition-transform duration-300 ${phase === "shake" ? "animate-[chestShake_0.1s_ease-in-out_infinite]" : ""}`}>
        <svg width={120} height={100} viewBox="0 0 120 100">
          <defs>
            <linearGradient id="tc-wood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A0724A" />
              <stop offset="100%" stopColor="#6B4430" />
            </linearGradient>
            <linearGradient id="tc-lid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C08860" />
              <stop offset="100%" stopColor="#8B5E3C" />
            </linearGradient>
            <radialGradient id="tc-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* 光のバースト */}
          {(phase === "open" || phase === "burst" || phase === "done") && (
            <circle cx={60} cy={40} r={50} fill="url(#tc-glow)" className="animate-ping" />
          )}

          {/* 箱本体 */}
          <rect x={15} y={50} width={90} height={45} rx={4} fill="url(#tc-wood)" />
          <rect x={15} y={50} width={90} height={6} fill="#5C3A1E" />
          {/* 金具 */}
          <rect x={50} y={55} width={20} height={12} rx={2} fill="#DAA520" />
          <circle cx={60} cy={61} r={3} fill="#B8860B" />
          {/* 金属バンド */}
          <rect x={15} y={70} width={90} height={3} fill="#DAA520" opacity={0.5} />

          {/* フタ */}
          <g style={{
            transformOrigin: "15px 50px",
            transform: phase === "open" || phase === "burst" || phase === "done"
              ? "rotate(-45deg)" : "rotate(0deg)",
            transition: "transform 0.4s ease-out"
          }}>
            <rect x={15} y={30} width={90} height={22} rx={4} fill="url(#tc-lid)" />
            <rect x={15} y={30} width={90} height={4} fill="#DAA520" />
            <rect x={15} y={48} width={90} height={4} fill="#5C3A1E" />
            {/* フタの金具 */}
            <rect x={50} y={38} width={20} height={8} rx={2} fill="#FFD700" />
            <circle cx={60} cy={42} r={2.5} fill="#E74C3C" />
          </g>
        </svg>
      </div>

      {/* コイン飛散 */}
      {(phase === "burst" || phase === "done") && (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * 360;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * 80;
            const y = Math.sin(rad) * 80 - 40;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  animation: `coinBurst 1.2s ease-out forwards`,
                  animationDelay: `${i * 0.06}s`,
                  ["--x" as string]: `${x}px`,
                  ["--y" as string]: `${y}px`,
                }}
              >
                <GoldCoinIcon size={20} />
              </div>
            );
          })}
        </>
      )}

      <style>{`
        @keyframes coinBurst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          50% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.2); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--x) * 1.3), calc(-50% + var(--y) * 1.3 - 40px)) scale(0.5); opacity: 0; }
        }
        @keyframes chestShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-2deg); }
          75% { transform: translateX(4px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
