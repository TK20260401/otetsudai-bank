"use client";

import React from "react";
import IdleAnimationWrapper from "@/components/idle-animation-wrapper";

export type ChildGender = "boy" | "girl" | "other";

const PX = 4;
type PixelDef = [number, number, string];

const MIN_SIZE = 20;

const SKIN = "#F5D0A0";
const SKIN_SHADE = "#E8B888";
const EYE = "#2A1A0A";
const MOUTH = "#C0392B";

const BOY_HAIR = "#4A2E18";
const BOY_HAIR_LIGHT = "#6B4A2C";
const BOY_SHIRT = "#3498DB";
const BOY_SHIRT_DARK = "#2980B9";
const BOY_PANTS = "#2C3E50";

const BOY_PIXELS: PixelDef[] = [
  [1,0,BOY_HAIR],[2,0,BOY_HAIR],[3,0,BOY_HAIR_LIGHT],[4,0,BOY_HAIR],
  [0,1,BOY_HAIR],[1,1,BOY_HAIR_LIGHT],[2,1,BOY_HAIR],[3,1,BOY_HAIR],[4,1,BOY_HAIR_LIGHT],[5,1,BOY_HAIR],
  [0,2,BOY_HAIR],[1,2,SKIN],[2,2,SKIN],[3,2,SKIN],[4,2,SKIN],[5,2,BOY_HAIR],
  [1,3,SKIN],[2,3,EYE],[3,3,SKIN],[4,3,EYE],[5,3,SKIN_SHADE],
  [1,4,SKIN_SHADE],[2,4,SKIN],[3,4,MOUTH],[4,4,SKIN],[5,4,SKIN_SHADE],
  [1,5,BOY_SHIRT],[2,5,BOY_SHIRT],[3,5,BOY_SHIRT],[4,5,BOY_SHIRT],
  [0,6,BOY_SHIRT_DARK],[1,6,BOY_SHIRT],[2,6,BOY_SHIRT],[3,6,BOY_SHIRT],[4,6,BOY_SHIRT],[5,6,BOY_SHIRT_DARK],
  [1,7,BOY_PANTS],[2,7,BOY_PANTS],[3,7,BOY_PANTS],[4,7,BOY_PANTS],
];

const GIRL_HAIR = "#6B3410";
const GIRL_HAIR_LIGHT = "#8B4E1E";
const GIRL_RIBBON = "#E74C3C";
const GIRL_SHIRT = "#F9C33B";
const GIRL_SHIRT_DARK = "#E4B000";
const GIRL_SKIRT = "#E88DA0";

const GIRL_PIXELS: PixelDef[] = [
  [0,0,GIRL_HAIR],[1,0,GIRL_RIBBON],[2,0,GIRL_HAIR],[3,0,GIRL_HAIR_LIGHT],[4,0,GIRL_RIBBON],[5,0,GIRL_HAIR],
  [0,1,GIRL_HAIR],[1,1,GIRL_HAIR_LIGHT],[2,1,GIRL_HAIR],[3,1,GIRL_HAIR],[4,1,GIRL_HAIR_LIGHT],[5,1,GIRL_HAIR],
  [0,2,GIRL_HAIR],[1,2,SKIN],[2,2,SKIN],[3,2,SKIN],[4,2,SKIN],[5,2,GIRL_HAIR],
  [0,3,GIRL_HAIR],[1,3,SKIN],[2,3,EYE],[3,3,SKIN],[4,3,EYE],[5,3,GIRL_HAIR],
  [0,4,GIRL_HAIR],[1,4,SKIN_SHADE],[2,4,SKIN],[3,4,MOUTH],[4,4,SKIN],[5,4,GIRL_HAIR],
  [0,5,GIRL_HAIR_LIGHT],[1,5,GIRL_SHIRT],[2,5,GIRL_SHIRT],[3,5,GIRL_SHIRT],[4,5,GIRL_SHIRT],[5,5,GIRL_HAIR_LIGHT],
  [0,6,GIRL_SHIRT_DARK],[1,6,GIRL_SHIRT],[2,6,GIRL_SHIRT],[3,6,GIRL_SHIRT],[4,6,GIRL_SHIRT],[5,6,GIRL_SHIRT_DARK],
  [1,7,GIRL_SKIRT],[2,7,GIRL_SKIRT],[3,7,GIRL_SKIRT],[4,7,GIRL_SKIRT],
];

const OTHER_HAIR = "#3F2F5E";
const OTHER_HAIR_LIGHT = "#5A467E";
const OTHER_SHIRT = "#2ECC71";
const OTHER_SHIRT_DARK = "#1E8449";
const OTHER_PANTS = "#6B7580";

const OTHER_PIXELS: PixelDef[] = [
  [1,0,OTHER_HAIR],[2,0,OTHER_HAIR_LIGHT],[3,0,OTHER_HAIR],[4,0,OTHER_HAIR_LIGHT],
  [0,1,OTHER_HAIR],[1,1,OTHER_HAIR_LIGHT],[2,1,OTHER_HAIR],[3,1,OTHER_HAIR_LIGHT],[4,1,OTHER_HAIR],[5,1,OTHER_HAIR_LIGHT],
  [0,2,OTHER_HAIR],[1,2,SKIN],[2,2,SKIN],[3,2,SKIN],[4,2,SKIN],[5,2,OTHER_HAIR],
  [0,3,OTHER_HAIR],[1,3,SKIN],[2,3,EYE],[3,3,SKIN],[4,3,EYE],[5,3,SKIN_SHADE],
  [1,4,SKIN_SHADE],[2,4,SKIN],[3,4,MOUTH],[4,4,SKIN],[5,4,SKIN_SHADE],
  [1,5,OTHER_SHIRT],[2,5,OTHER_SHIRT],[3,5,OTHER_SHIRT],[4,5,OTHER_SHIRT],
  [0,6,OTHER_SHIRT_DARK],[1,6,OTHER_SHIRT],[2,6,OTHER_SHIRT],[3,6,OTHER_SHIRT],[4,6,OTHER_SHIRT],[5,6,OTHER_SHIRT_DARK],
  [1,7,OTHER_PANTS],[2,7,OTHER_PANTS],[3,7,OTHER_PANTS],[4,7,OTHER_PANTS],
];

export default function ChildCharacterSvg({ gender, size = 48, animated = false }: { gender: ChildGender; size?: number; animated?: boolean }) {
  const pixels =
    gender === "boy" ? BOY_PIXELS : gender === "girl" ? GIRL_PIXELS : OTHER_PIXELS;
  const gridW = 6;
  const gridH = 8;
  const clamped = Math.max(MIN_SIZE, size);
  const svg = (
    <svg
      width={clamped}
      height={clamped * (gridH / gridW)}
      viewBox={`0 0 ${gridW * PX} ${gridH * PX}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
      role="img"
      aria-label={
        gender === "boy" ? "男の子のキャラクター" : gender === "girl" ? "女の子のキャラクター" : "キャラクター"
      }
    >
      <g>
        {pixels.map(([x, y, color], i) => (
          <rect key={i} x={x * PX} y={y * PX} width={PX} height={PX} fill={color} />
        ))}
      </g>
    </svg>
  );

  if (!animated) return svg;

  const animType = gender === "boy" ? "bounce" : gender === "girl" ? "sway" : "breathe";
  const animDur = gender === "boy" ? 2 : 3;

  return (
    <IdleAnimationWrapper type={animType} duration={animDur}>
      {svg}
    </IdleAnimationWrapper>
  );
}

export function resolveChildGender(icon: string | null | undefined): ChildGender {
  if (icon === "boy") return "boy";
  if (icon === "girl") return "girl";
  if (icon === "other") return "other";
  if (icon && /👦|🧒🏻/.test(icon)) return "boy";
  if (icon && /👧|👧🏻/.test(icon)) return "girl";
  return "other";
}
