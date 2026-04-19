"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
};

const SHIMMER_KF = `
@keyframes value-shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .value-shimmer { animation: none !important; background: none !important; }
}
`;

export default function AnimatedValue({
  value,
  duration = 800,
  formatFn,
  className = "",
}: Props) {
  const prevRef = useRef(value);
  const [display, setDisplay] = useState(value);
  const [shimmer, setShimmer] = useState(false);
  const rafRef = useRef(0);
  const format = formatFn ?? ((n: number) => n.toLocaleString());

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;
    prevRef.current = value;
    setShimmer(true);

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm) {
      setDisplay(value);
      setShimmer(false);
      return;
    }

    const start = performance.now();
    const diff = value - prev;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setShimmer(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHIMMER_KF }} />
      <span
        className={`value-shimmer ${className}`}
        style={
          shimmer
            ? {
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.4) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "value-shimmer 0.6s ease-in-out",
                WebkitBackgroundClip: "text",
              }
            : undefined
        }
      >
        {format(display)}
      </span>
    </>
  );
}
