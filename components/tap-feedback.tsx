"use client";

import React, { useState, useCallback, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  as?: "button" | "div";
};

/**
 * CSS-based tap feedback wrapper.
 * Scales down on press, bounces back on release.
 * Respects prefers-reduced-motion.
 */
export default function TapFeedback({
  children,
  disabled = false,
  className,
  onClick,
  as: Component = "div",
}: Props) {
  const [pressed, setPressed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handlePressStart = useCallback(() => {
    if (!disabled) setPressed(true);
  }, [disabled]);

  const handlePressEnd = useCallback(() => {
    setPressed(false);
  }, []);

  const style: React.CSSProperties = reducedMotion
    ? {}
    : {
        transform: pressed && !disabled ? "scale(0.95)" : "scale(1)",
        transition: pressed
          ? "transform 0.1s ease"
          : "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      };

  return (
    <Component
      className={className ?? undefined}
      style={style}
      onClick={disabled ? undefined : onClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      {children}
    </Component>
  );
}
