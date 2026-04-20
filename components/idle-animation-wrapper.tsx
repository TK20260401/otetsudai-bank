"use client";

import React, { type ReactNode } from "react";

const IDLE_TYPES = [
  "bob",
  "breathe",
  "sway",
  "bounce",
  "flutter",
  "pulse",
  "spin",
  "flicker",
  "jump",
  "shake",
] as const;

export type IdleAnimationType = (typeof IDLE_TYPES)[number];

type Props = {
  type: IdleAnimationType;
  duration?: number;
  paused?: boolean;
  /** "subtle" = duration 2x for background/non-focus elements */
  intensity?: "normal" | "subtle";
  children: ReactNode;
  className?: string;
};

const KEYFRAMES = `
@keyframes idle-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes idle-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
@keyframes idle-sway {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
}
@keyframes idle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes idle-flutter {
  0%, 100% { transform: rotate(-1deg) translateX(-1px); }
  50% { transform: rotate(1deg) translateX(1px); }
}
@keyframes idle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes idle-spin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}
@keyframes idle-flicker {
  0%, 100% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.8; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  75% { opacity: 0.9; transform: scale(0.98); }
}
@keyframes idle-jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
@keyframes idle-shake {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(5deg); }
  40% { transform: rotate(-5deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
}
@media (prefers-reduced-motion: reduce) {
  .idle-anim { animation: none !important; }
}
`;

let stylesInjected = false;

export default function IdleAnimationWrapper({
  type,
  duration,
  paused = false,
  intensity = "normal",
  children,
  className = "",
}: Props) {
  const baseDur = duration ?? getDefaultDuration(type);
  const dur = intensity === "subtle" ? baseDur * 2 : baseDur;

  return (
    <>
      {!stylesInjected && (
        <style
          dangerouslySetInnerHTML={{ __html: KEYFRAMES }}
          ref={() => {
            stylesInjected = true;
          }}
        />
      )}
      <div
        className={`idle-anim ${className}`}
        style={{
          display: "inline-flex",
          animation: `idle-${type} ${dur}s ease-in-out infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform, opacity",
        }}
      >
        {children}
      </div>
    </>
  );
}

function getDefaultDuration(type: IdleAnimationType): number {
  switch (type) {
    case "bob":
      return 3;
    case "breathe":
      return 3;
    case "sway":
      return 4;
    case "bounce":
      return 2;
    case "flutter":
      return 2.5;
    case "pulse":
      return 2;
    case "spin":
      return 2;
    case "flicker":
      return 0.8;
    case "jump":
      return 0.4;
    case "shake":
      return 0.3;
  }
}
