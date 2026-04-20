"use client";

import { useEffect, useRef } from "react";

type Props = {
  show: boolean;
  onComplete?: () => void;
};

const COINS = [
  { angle: -150, radius: 80, label: "使う" },
  { angle: -90, radius: 90, label: "貯める" },
  { angle: -30, radius: 80, label: "増やす" },
] as const;

/**
 * W2 3分割コイン分岐アニメーション
 * コインが中央に現れ、3方向（使う・貯める・増やす）に分かれて飛ぶ
 */
export default function CoinSplitAnimation({ show, onComplete }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {COINS.map((coin, i) => {
        const rad = (coin.angle * Math.PI) / 180;
        const endX = Math.cos(rad) * coin.radius;
        const endY = Math.sin(rad) * coin.radius;

        return (
          <span
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full bg-yellow-400 coin-split-item"
            style={
              {
                "--end-x": `${endX}px`,
                "--end-y": `${endY}px`,
                animationDelay: `${i * 100}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}

      <style jsx>{`
        @keyframes coinSplit {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          15% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          70% {
            transform: translate(var(--end-x), var(--end-y)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(1);
            opacity: 0;
          }
        }

        .coin-split-item {
          animation: coinSplit 1.2s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .coin-split-item {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
