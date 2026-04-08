"use client";

import { useEffect } from "react";

export default function CoinAnimation({ show, onComplete }: { show: boolean; onComplete: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  const coins = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="text-4xl font-bold text-amber-600 animate-bounce">
        クエストクリア！🎉
      </div>
      {coins.map((i) => {
        const angle = (i / 12) * 360;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 120;
        const y = Math.sin(rad) * 120;
        return (
          <span
            key={i}
            className="absolute text-2xl"
            style={{
              animation: `coinBurst 1.5s ease-out forwards`,
              animationDelay: `${i * 0.05}s`,
              left: "50%",
              top: "50%",
              ["--x" as string]: `${x}px`,
              ["--y" as string]: `${y}px`,
            }}
          >
            🪙
          </span>
        );
      })}
      <style>{`
        @keyframes coinBurst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          50% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.2); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--x) * 1.5), calc(-50% + var(--y) * 1.5 - 60px)) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
