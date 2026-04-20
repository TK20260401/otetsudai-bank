"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  mode: "idle" | "walk";
  frameA: ReactNode;
  frameB: ReactNode;
  period?: number;
};

/**
 * 2フレームパカパカ歩行アニメーション（Web版）
 *
 * CSS keyframes で frameA/frameB を period 周期で切替
 * + translateY ±1px bounce
 * prefers-reduced-motion: idle フォールバック
 */

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes walkBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-1px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .walk-wrapper { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export default function WalkAnimationWrapper({
  mode,
  frameA,
  frameB,
  period = 500,
}: Props) {
  const [showB, setShowB] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    if (mode !== "walk") {
      setShowB(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setShowB((prev) => !prev);
    }, period / 2);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, period]);

  if (mode !== "walk") {
    return <>{frameA}</>;
  }

  return (
    <div
      className="walk-wrapper"
      style={{
        animation: `walkBounce ${period}ms ease-in-out infinite`,
        position: "relative",
      }}
    >
      <div style={{ opacity: showB ? 0 : 1, position: showB ? "absolute" : "relative", inset: 0 }}>
        {frameA}
      </div>
      <div style={{ opacity: showB ? 1 : 0, position: showB ? "relative" : "absolute", inset: 0 }}>
        {frameB}
      </div>
    </div>
  );
}
