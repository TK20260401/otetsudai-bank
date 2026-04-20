"use client";

import { useEffect, useRef, useState } from "react";

const CONFETTI_COUNT = 12;
const CONFETTI_COLORS = ["#FFD700", "#E74C3C", "#3498DB", "#2ECC71", "#FF69B4", "#9B59B6"];

type Props = {
  show: boolean;
  onComplete?: () => void;
};

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes celebFlash {
      from { opacity: 0.8; }
      to { opacity: 0; }
    }
    @keyframes celebPunch {
      from { transform: scale(1.02); }
      to { transform: scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .celeb-container * { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export default function CelebrationBurst({ show, onComplete }: Props) {
  const [particles, setParticles] = useState<
    { endX: number; endY: number; color: string; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const p = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / CONFETTI_COUNT;
      const radius = 100 + Math.random() * 80;
      return {
        endX: Math.cos(angle) * radius,
        endY: Math.sin(angle) * radius - 40,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 4,
        delay: i * 15,
      };
    });
    setParticles(p);

    const timeout = setTimeout(() => onComplete?.(), 2500);
    return () => clearTimeout(timeout);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div
      className="celeb-container"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {/* Flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          animation: "celebFlash 0.2s ease-out forwards",
        }}
      />

      {/* Punch */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: "celebPunch 0.15s ease-out forwards",
        }}
      />

      {/* Confetti particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.color,
            animation: `celebConfetti${i} 1.5s ease-out ${p.delay}ms forwards`,
            opacity: 0,
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes celebConfetti${i} {
                  0% { opacity: 0; transform: translate(0, 0) scale(0); }
                  10% { opacity: 1; transform: scale(1); }
                  70% { opacity: 1; }
                  100% { opacity: 0; transform: translate(${p.endX}px, ${p.endY}px) rotate(${360 + Math.random() * 180}deg) scale(0.5); }
                }
              `,
            }}
          />
        </div>
      ))}
    </div>
  );
}
