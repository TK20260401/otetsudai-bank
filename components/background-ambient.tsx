"use client";

import { useEffect, useRef, useState } from "react";

type Preset = "dungeon" | "outdoor" | "home";

type Props = {
  preset: Preset;
  slowdown?: boolean;
  className?: string;
};

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ambFlicker1 {
      0%, 100% { opacity: 1; }
      25% { opacity: 0.4; }
      50% { opacity: 0.8; }
      75% { opacity: 0.6; }
    }
    @keyframes ambFlicker2 {
      0%, 100% { opacity: 1; }
      30% { opacity: 0.5; }
      60% { opacity: 0.9; }
      80% { opacity: 0.4; }
    }
    @keyframes ambStarPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    @keyframes ambCloudDrift {
      from { transform: translateX(-80px); }
      to { transform: translateX(calc(100% + 80px)); }
    }
    @keyframes ambBreathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes ambFlyAcross {
      0% { transform: translateX(-20px); opacity: 0; }
      5% { opacity: 0.7; }
      95% { opacity: 0.7; }
      100% { transform: translateX(calc(100vw + 20px)); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .amb-container * { animation: none !important; }
    }
    .amb-slowdown * {
      animation-duration: 3.33x !important; /* fallback */
    }
  `;
  document.head.appendChild(style);
}

export default function BackgroundAmbient({ preset, slowdown = false, className = "" }: Props) {
  useEffect(() => { injectStyles(); }, []);

  const slow = slowdown ? 3.33 : 1; // 0.3x speed = 3.33x duration

  return (
    <div
      className={`amb-container ${slowdown ? "amb-slowdown" : ""} ${className}`}
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      {preset === "dungeon" && <DungeonPreset slow={slow} />}
      {preset === "outdoor" && <OutdoorPreset slow={slow} />}
      {preset === "home" && <HomePreset slow={slow} />}
    </div>
  );
}

function DungeonPreset({ slow }: { slow: number }) {
  return (
    <>
      {/* トーチ炎（左） */}
      <svg
        width={8} height={12} viewBox="0 0 8 12"
        style={{ position: "absolute", left: 20, top: 30, animation: `ambFlicker1 ${0.8 * slow}s ease-in-out infinite` }}
      >
        <ellipse cx={4} cy={6} rx={3} ry={5} fill="#FF8C00" />
        <ellipse cx={4} cy={5} rx={2} ry={3} fill="#FFD700" />
      </svg>
      {/* トーチ炎（右） */}
      <svg
        width={8} height={12} viewBox="0 0 8 12"
        style={{ position: "absolute", right: 20, top: 30, animation: `ambFlicker2 ${1.2 * slow}s ease-in-out infinite` }}
      >
        <ellipse cx={4} cy={6} rx={3} ry={5} fill="#FF8C00" />
        <ellipse cx={4} cy={5} rx={2} ry={3} fill="#FFD700" />
      </svg>
      {/* 星 */}
      {[{ x: "15%", y: 15 }, { x: "45%", y: 25 }, { x: "75%", y: 10 }].map((pos, i) => (
        <svg
          key={i}
          width={4} height={4} viewBox="0 0 4 4"
          style={{ position: "absolute", left: pos.x, top: pos.y, animation: `ambStarPulse ${(2 + i * 0.5) * slow}s ease-in-out infinite` }}
        >
          <circle cx={2} cy={2} r={1.5} fill="#E8E0FF" />
        </svg>
      ))}
    </>
  );
}

function OutdoorPreset({ slow }: { slow: number }) {
  return (
    <>
      {/* 雲1 */}
      <svg
        width={50} height={20} viewBox="0 0 50 20"
        style={{ position: "absolute", top: 10, animation: `ambCloudDrift ${30 * slow}s linear infinite` }}
      >
        <ellipse cx={15} cy={12} rx={12} ry={8} fill="rgba(255,255,255,0.15)" />
        <ellipse cx={30} cy={10} rx={15} ry={10} fill="rgba(255,255,255,0.12)" />
        <ellipse cx={42} cy={13} rx={8} ry={6} fill="rgba(255,255,255,0.1)" />
      </svg>
      {/* 雲2 */}
      <svg
        width={40} height={16} viewBox="0 0 40 16"
        style={{ position: "absolute", top: 35, animation: `ambCloudDrift ${45 * slow}s linear infinite`, animationDelay: `${-15 * slow}s` }}
      >
        <ellipse cx={12} cy={10} rx={10} ry={6} fill="rgba(255,255,255,0.1)" />
        <ellipse cx={28} cy={8} rx={12} ry={8} fill="rgba(255,255,255,0.08)" />
      </svg>
      {/* 木 breathe */}
      <svg
        width={20} height={30} viewBox="0 0 20 30"
        style={{ position: "absolute", right: 10, bottom: 10, animation: `ambBreathe ${6 * slow}s ease-in-out infinite` }}
      >
        <rect x={8} y={20} width={4} height={10} fill="#5D4037" />
        <ellipse cx={10} cy={14} rx={8} ry={10} fill="#2E7D32" />
      </svg>
    </>
  );
}

function HomePreset({ slow }: { slow: number }) {
  const [flyKey, setFlyKey] = useState(0);
  const topRef = useRef(20 + Math.random() * 40);

  useEffect(() => {
    const interval = setInterval(() => {
      topRef.current = 20 + Math.random() * 40;
      setFlyKey((k) => k + 1);
    }, 10000 * slow);
    return () => clearInterval(interval);
  }, [slow]);

  return (
    <svg
      key={flyKey}
      width={12} height={8} viewBox="0 0 12 8"
      style={{
        position: "absolute",
        top: `${topRef.current}%`,
        animation: `ambFlyAcross ${4 * slow}s linear forwards`,
      }}
    >
      <path d="M6,4 Q3,0 0,2 Q3,4 6,4 Q9,0 12,2 Q9,4 6,4Z" fill="#FFD700" opacity={0.6} />
    </svg>
  );
}
