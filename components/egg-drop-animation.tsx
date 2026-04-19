"use client";

import { useEffect, useState } from "react";
import PetSvg from "@/components/pet-svg";
import type { PetType } from "@/lib/pets";
import { PET_TYPE_INFO } from "@/lib/pets";

type Props = {
  show: boolean;
  petType: PetType;
  onComplete: () => void;
};

export default function EggDropAnimation({ show, petType, onComplete }: Props) {
  const [phase, setPhase] = useState<"drop" | "bounce" | "crack" | "text" | "done">("drop");

  useEffect(() => {
    if (!show) { setPhase("drop"); return; }

    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motionOk) {
      setPhase("done");
      setTimeout(onComplete, 500);
      return;
    }

    setPhase("drop");
    setTimeout(() => setPhase("bounce"), 600);
    setTimeout(() => setPhase("crack"), 1000);
    setTimeout(() => setPhase("text"), 2200);
    setTimeout(() => setPhase("done"), 3500);
    setTimeout(onComplete, 3800);
  }, [show, onComplete]);

  if (!show) return null;

  const info = PET_TYPE_INFO[petType];

  const crackParticles = [
    { x: -20, y: -24 },
    { x: 20, y: -24 },
    { x: -28, y: -4 },
    { x: 28, y: -4 },
    { x: -16, y: 16 },
    { x: 16, y: 16 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setPhase("done"); onComplete(); }}>
      <div className="relative">
        {/* Egg (visible until crack phase completes) */}
        <div
          style={{
            transform:
              phase === "drop" ? "translateY(-200px) scale(0.5)" :
              phase === "bounce" ? "translateY(0) scale(1.1)" :
              "translateY(0) scale(1)",
            opacity: phase === "crack" || phase === "text" || phase === "done" ? 0 : phase === "drop" ? 0.5 : 1,
            transition: phase === "crack" ? "opacity 0.4s ease-out" : "all 0.5s ease-out",
            animation: phase === "crack" ? "eggShake 0.1s linear 4" : undefined,
          }}
        >
          <PetSvg type={petType} stage="egg" size={80} />
        </div>

        {/* Crack particles */}
        {(phase === "crack" || phase === "text" || phase === "done") && (
          <>
            {crackParticles.map((p, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderBottom: "10px solid #FFD700",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ["--x" as any]: `${p.x}px`,
                  ["--y" as any]: `${p.y}px`,
                  animation: "crackBurst 0.6s ease-out forwards",
                  transform: "translate(-50%, -50%)",
                } as React.CSSProperties}
              />
            ))}
          </>
        )}

        {/* Pet SVG (appears after crack) */}
        {(phase === "crack" || phase === "text" || phase === "done") && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: "petReveal 0.6s ease-out 0.4s both",
            }}
          >
            <PetSvg type={petType} stage="baby" size={80} animated />
          </div>
        )}
      </div>

      {/* Text */}
      {(phase === "text" || phase === "done") && (
        <div className="absolute bottom-1/3 text-center" style={{ animation: "fadeInUp 0.5s ease-out" }}>
          <p className="text-2xl font-bold text-amber-400" style={{ textShadow: "0 0 10px #FFD700" }}>
            {info.nameJa}が うまれた！
          </p>
          <p className="text-sm text-amber-300 mt-1">たいせつに そだてよう！</p>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes eggShake {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          25% { transform: translateX(-2px) translateY(0) scale(1); }
          75% { transform: translateX(2px) translateY(0) scale(1); }
        }
        @keyframes crackBurst {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0.3); opacity: 0; }
        }
        @keyframes petReveal {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fixed * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}
