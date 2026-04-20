"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  shake: boolean;
  onShakeEnd?: () => void;
};

/**
 * E1 入力エラー赤枠shakeアニメーション
 * shake=trueで±4px×3回振動（300ms）+ 赤枠表示
 * 振動完了後500msで赤枠フェード→onShakeEnd
 */
export default function ShakeView({ children, shake, onShakeEnd }: Props) {
  const [isShaking, setIsShaking] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const prevShake = useRef(false);

  useEffect(() => {
    if (shake && !prevShake.current) {
      setIsShaking(true);
      setShowBorder(true);

      // Shake animation lasts 300ms
      const shakeTimer = setTimeout(() => {
        setIsShaking(false);
      }, 300);

      // Red border stays 500ms after shake ends (800ms total)
      const borderTimer = setTimeout(() => {
        setShowBorder(false);
        onShakeEnd?.();
      }, 800);

      prevShake.current = shake;
      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(borderTimer);
      };
    }
    prevShake.current = shake;
  }, [shake, onShakeEnd]);

  // Reset when shake goes back to false
  useEffect(() => {
    if (!shake) {
      setShowBorder(false);
      setIsShaking(false);
    }
  }, [shake]);

  return (
    <div
      className={`
        ${isShaking ? "shake-x" : ""}
        ${showBorder ? "ring-2 ring-red-500 rounded-lg" : ""}
        transition-shadow duration-200
      `}
    >
      {children}

      <style jsx>{`
        @keyframes shakeX {
          0%, 100% {
            transform: translateX(0);
          }
          16.6% {
            transform: translateX(4px);
          }
          33.3% {
            transform: translateX(-4px);
          }
          50% {
            transform: translateX(4px);
          }
          66.6% {
            transform: translateX(-4px);
          }
          83.3% {
            transform: translateX(4px);
          }
        }

        .shake-x {
          animation: shakeX 0.3s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .shake-x {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
