"use client";

import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  shaking: boolean;
  intensity?: "subtle" | "strong";
};

/**
 * P1 卵の揺れアニメーション
 * subtle: ±2°/800ms（孵化前の予兆）
 * strong: ±5°/400ms（もうすぐ孵化！）
 */
export default function EggShake({ children, shaking, intensity = "subtle" }: Props) {
  const animationClass = shaking
    ? intensity === "strong"
      ? "egg-shake-strong"
      : "egg-shake-subtle"
    : "";

  return (
    <div className={`inline-block ${animationClass}`}>
      {children}

      <style jsx>{`
        @keyframes eggShakeSubtle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(2deg);
          }
          75% {
            transform: rotate(-2deg);
          }
        }

        @keyframes eggShakeStrong {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(5deg);
          }
          75% {
            transform: rotate(-5deg);
          }
        }

        .egg-shake-subtle {
          animation: eggShakeSubtle 0.8s ease-in-out infinite;
        }

        .egg-shake-strong {
          animation: eggShakeStrong 0.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .egg-shake-subtle,
          .egg-shake-strong {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
