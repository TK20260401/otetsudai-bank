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
  const [phase, setPhase] = useState<"drop" | "bounce" | "text" | "done">("drop");

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
    setTimeout(() => setPhase("text"), 1000);
    setTimeout(() => setPhase("done"), 2500);
    setTimeout(onComplete, 2800);
  }, [show, onComplete]);

  if (!show) return null;

  const info = PET_TYPE_INFO[petType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setPhase("done"); onComplete(); }}>
      {/* 卵 */}
      <div
        className="transition-all duration-500"
        style={{
          transform: phase === "drop" ? "translateY(-200px) scale(0.5)" : phase === "bounce" ? "translateY(0) scale(1.1)" : "translateY(0) scale(1)",
          opacity: phase === "drop" ? 0.5 : 1,
        }}
      >
        <PetSvg type={petType} stage="egg" size={80} />
      </div>

      {/* テキスト */}
      {(phase === "text" || phase === "done") && (
        <div className="absolute bottom-1/3 text-center animate-[fadeInUp_0.5s_ease-out]">
          <p className="text-2xl font-bold text-amber-400" style={{ textShadow: "0 0 10px #FFD700" }}>
            たまご ゲット！
          </p>
          <p className="text-sm text-amber-300 mt-1">{info.nameJa}の たまごを みつけた！</p>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
