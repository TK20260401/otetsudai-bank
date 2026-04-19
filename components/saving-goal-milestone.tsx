"use client";

import { useEffect, useState } from "react";

type Props = {
  show: boolean;
  goalTitle: string;
  onComplete: () => void;
};

export default function SavingGoalMilestone({ show, goalTitle, onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "fill" | "burst" | "banner" | "done">("idle");

  useEffect(() => {
    if (!show) { setPhase("idle"); return; }

    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motionOk) {
      setPhase("done");
      return;
    }

    setPhase("fill");
    setTimeout(() => setPhase("burst"), 800);
    setTimeout(() => setPhase("banner"), 1400);
    setTimeout(() => { setPhase("done"); onComplete(); }, 2800);
  }, [show, onComplete]);

  if (!show || phase === "idle") return null;

  const confettiParticles = [
    { x: -30, y: -30, color: "#FFD700" },
    { x: 30, y: -30, color: "#E74C3C" },
    { x: -40, y: 0, color: "#3498DB" },
    { x: 40, y: 0, color: "#2ECC71" },
    { x: -20, y: 30, color: "#9B59B6" },
    { x: 20, y: 30, color: "#FF6B6B" },
  ];

  return (
    <div className="relative mt-2 overflow-hidden">
      {/* Fill bar */}
      <div
        className="h-3 rounded-full overflow-hidden mb-2"
        style={{
          background: "#1A0F2E",
          boxShadow: "0 0 12px rgba(255,215,0,0.4)",
        }}
      >
        <div
          className="sgm-fill h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #2ECC71, #FFD700)",
            animation: phase === "fill" || phase === "burst" || phase === "banner" || phase === "done"
              ? "sgmFill 0.8s ease-out forwards"
              : undefined,
            width: "100%",
            transformOrigin: "0 0",
          }}
        />
      </div>

      {/* Confetti burst */}
      {(phase === "burst" || phase === "banner" || phase === "done") && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {confettiParticles.map((p, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: p.color,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--x" as any]: `${p.x}px`,
                ["--y" as any]: `${p.y}px`,
                animation: "sgmBurst 0.6s ease-out forwards",
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Banner text */}
      {(phase === "banner" || phase === "done") && (
        <div
          className="text-center text-lg font-bold text-[#58d68d] drop-shadow-[0_1px_6px_rgba(46,204,113,0.5)]"
          style={{
            animation: "sgmBanner 0.5s ease-out both",
          }}
        >
          <span className="flex items-center justify-center gap-1">
            目標達成！すごい！
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">{goalTitle}</p>
        </div>
      )}

      <style>{`
        @keyframes sgmFill {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes sgmBurst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--x), var(--y)) scale(0.3); opacity: 0; }
        }
        @keyframes sgmBanner {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sgm-fill { animation: none !important; transform: scaleX(1) !important; }
        }
      `}</style>
    </div>
  );
}
