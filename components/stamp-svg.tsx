"use client";

import React from "react";
import {
  PixelStarIcon,
  PixelHeartIcon,
  PixelCrossedSwordsIcon,
  PixelMedalIcon,
  PixelFlameIcon,
  PixelCrownIcon,
  PixelConfettiIcon,
  PixelShieldIcon,
} from "@/components/pixel-icons";
import IdleAnimationWrapper, { type IdleAnimationType } from "@/components/idle-animation-wrapper";

type IconComponent = (props: { size?: number }) => React.ReactElement;

type StampEntry = { icon: IconComponent; anim: IdleAnimationType };

const STAMP_MAP: Record<string, StampEntry> = {
  // 承認スタンプ
  great:      { icon: PixelStarIcon,          anim: "pulse" },
  thankyou:   { icon: PixelHeartIcon,         anim: "breathe" },
  ganbare:    { icon: PixelCrossedSwordsIcon, anim: "sway" },
  perfect:    { icon: PixelMedalIcon,         anim: "spin" },
  heart:      { icon: PixelHeartIcon,         anim: "breathe" },
  fire:       { icon: PixelFlameIcon,         anim: "flicker" },
  crown:      { icon: PixelCrownIcon,         anim: "pulse" },
  sparkle:    { icon: PixelStarIcon,          anim: "pulse" },

  // ファミリースタンプ（エール）
  cheer:      { icon: PixelFlameIcon,         anim: "flicker" },
  thanks:     { icon: PixelHeartIcon,         anim: "breathe" },
  love:       { icon: PixelHeartIcon,         anim: "breathe" },
  muscle:     { icon: PixelCrossedSwordsIcon, anim: "bounce" },
  highfive:   { icon: PixelConfettiIcon,      anim: "flutter" },
  hug:        { icon: PixelHeartIcon,         anim: "breathe" },
  salute:     { icon: PixelShieldIcon,        anim: "bob" },

  // 子スタンプ
  try_harder: { icon: PixelCrossedSwordsIcon, anim: "bounce" },
  yay:        { icon: PixelConfettiIcon,      anim: "flutter" },
  next_time:  { icon: PixelFlameIcon,         anim: "flicker" },
  roger:      { icon: PixelShieldIcon,        anim: "bob" },
};

export default function StampSvg({
  id,
  size = 20,
  animated = true,
}: {
  id: string;
  size?: number;
  animated?: boolean;
}) {
  const entry = STAMP_MAP[id];
  if (!entry) {
    return <span style={{ display: "inline-block", width: size, height: size }} />;
  }
  const { icon: Icon, anim } = entry;
  if (!animated) return <Icon size={size} />;
  return (
    <IdleAnimationWrapper type={anim}>
      <Icon size={size} />
    </IdleAnimationWrapper>
  );
}

export function hasStampSvg(id: string): boolean {
  return id in STAMP_MAP;
}
