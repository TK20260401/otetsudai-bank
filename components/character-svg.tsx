"use client";

import React from "react";
import IdleAnimationWrapper from "@/components/idle-animation-wrapper";

type Props = {
  level: number;
  mood: "active" | "normal" | "lonely";
  size?: number;
  animated?: boolean;
};

type EyeExpr = "happy" | "sad" | "normal";

/**
 * レベル別キャラクターSVG（2頭身デフォルメ人型）— Web版
 * Lv1: 布の服の赤ちゃん冒険者
 * Lv2: 革装備の見習い騎士
 * Lv3: 鉄の鎧のクエストナイト
 * Lv4: 銀装備+マント
 * Lv5: 金装備+英雄マント
 * Lv6: 輝く鎧+賢者の杖
 * Lv7: 王冠+聖剣の伝説の勇者
 */
export default function CharacterSvg({ level, mood, size = 120, animated = false }: Props) {
  const eyeExpr: EyeExpr = mood === "active" ? "happy" : mood === "lonely" ? "sad" : "normal";

  const svgEl = (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {commonDefs()}
      {level === 1 && renderLv1(eyeExpr)}
      {level === 2 && renderLv2(eyeExpr)}
      {level === 3 && renderLv3(eyeExpr)}
      {level === 4 && renderLv4(eyeExpr)}
      {level === 5 && renderLv5(eyeExpr)}
      {level === 6 && renderLv6(eyeExpr)}
      {level >= 7 && renderLv7(eyeExpr)}
    </svg>
  );

  if (!animated) return svgEl;

  return (
    <IdleAnimationWrapper type="sway" duration={4}>
      {svgEl}
    </IdleAnimationWrapper>
  );
}

function commonDefs() {
  return (
    <defs>
      <radialGradient id="char-skin" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#FDDCB5" />
        <stop offset="100%" stopColor="#F5C99A" />
      </radialGradient>
      <radialGradient id="char-cheek" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFB3B3" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#FFB3B3" stopOpacity={0} />
      </radialGradient>
    </defs>
  );
}

function face(eyeExpr: EyeExpr, yOff = 0) {
  const ey = 38 + yOff;
  return (
    <g>
      <circle cx={60} cy={32 + yOff} r={22} fill="url(#char-skin)" />
      <path
        d={`M38,${28 + yOff} Q42,${12 + yOff} 60,${10 + yOff} Q78,${12 + yOff} 82,${28 + yOff} Q80,${18 + yOff} 60,${14 + yOff} Q40,${18 + yOff} 38,${28 + yOff}Z`}
        fill="#5D3A1A"
      />
      {eyeExpr === "happy" ? (
        <>
          <path d={`M50,${ey} Q53,${ey - 3} 56,${ey}`} stroke="#333" strokeWidth={2} fill="none" />
          <path d={`M64,${ey} Q67,${ey - 3} 70,${ey}`} stroke="#333" strokeWidth={2} fill="none" />
        </>
      ) : eyeExpr === "sad" ? (
        <>
          <circle cx={53} cy={ey} r={2.5} fill="#333" />
          <circle cx={67} cy={ey} r={2.5} fill="#333" />
          <path d={`M49,${ey - 4} Q53,${ey - 2} 57,${ey - 4}`} stroke="#333" strokeWidth={1} fill="none" />
          <path d={`M63,${ey - 4} Q67,${ey - 2} 71,${ey - 4}`} stroke="#333" strokeWidth={1} fill="none" />
        </>
      ) : (
        <>
          <circle cx={53} cy={ey} r={3} fill="#333" />
          <circle cx={67} cy={ey} r={3} fill="#333" />
          <circle cx={54} cy={ey - 1} r={1} fill="#FFF" />
          <circle cx={68} cy={ey - 1} r={1} fill="#FFF" />
        </>
      )}
      {eyeExpr === "happy" ? (
        <path d={`M55,${ey + 7} Q60,${ey + 12} 65,${ey + 7}`} stroke="#C55" strokeWidth={1.5} fill="none" />
      ) : eyeExpr === "sad" ? (
        <path d={`M55,${ey + 10} Q60,${ey + 7} 65,${ey + 10}`} stroke="#C55" strokeWidth={1.5} fill="none" />
      ) : (
        <ellipse cx={60} cy={ey + 8} rx={3} ry={2} fill="#E88" />
      )}
      <circle cx={44} cy={ey + 4} r={5} fill="url(#char-cheek)" />
      <circle cx={76} cy={ey + 4} r={5} fill="url(#char-cheek)" />
    </g>
  );
}

function renderLv1(eyeExpr: EyeExpr) {
  return (
    <g>
      <rect x={42} y={52} width={36} height={35} rx={8} fill="#C4A96A" />
      <rect x={46} y={52} width={28} height={10} rx={4} fill="#D4B97A" />
      <rect x={32} y={55} width={12} height={20} rx={6} fill="url(#char-skin)" />
      <rect x={76} y={55} width={12} height={20} rx={6} fill="url(#char-skin)" />
      <rect x={46} y={85} width={10} height={16} rx={5} fill="url(#char-skin)" />
      <rect x={64} y={85} width={10} height={16} rx={5} fill="url(#char-skin)" />
      <ellipse cx={51} cy={100} rx={7} ry={5} fill="#8B6D4A" />
      <ellipse cx={69} cy={100} rx={7} ry={5} fill="#8B6D4A" />
      {face(eyeExpr)}
      <rect x={84} y={48} width={3} height={22} rx={1} fill="#8B6D4A" />
      <rect x={80} y={68} width={11} height={3} rx={1} fill="#A08060" />
    </g>
  );
}

function renderLv2(eyeExpr: EyeExpr) {
  return (
    <g>
      <rect x={42} y={52} width={36} height={35} rx={6} fill="#8B5E3C" />
      <rect x={44} y={54} width={32} height={8} rx={3} fill="#A0704C" />
      <rect x={42} y={70} width={36} height={4} rx={2} fill="#5C3A1E" />
      <circle cx={60} cy={72} r={3} fill="#D4A030" />
      <rect x={30} y={55} width={14} height={22} rx={7} fill="#8B5E3C" />
      <rect x={76} y={55} width={14} height={22} rx={7} fill="#8B5E3C" />
      <rect x={45} y={85} width={11} height={18} rx={5} fill="#5C3A1E" />
      <rect x={64} y={85} width={11} height={18} rx={5} fill="#5C3A1E" />
      <ellipse cx={50} cy={102} rx={8} ry={5} fill="#5C3A1E" />
      <ellipse cx={70} cy={102} rx={8} ry={5} fill="#5C3A1E" />
      {face(eyeExpr)}
      <ellipse cx={30} cy={68} rx={10} ry={12} fill="#A0704C" />
      <ellipse cx={30} cy={68} rx={7} ry={9} fill="#8B5E3C" />
      <circle cx={30} cy={68} r={3} fill="#D4A030" />
    </g>
  );
}

function renderLv3(eyeExpr: EyeExpr) {
  return (
    <g>
      <defs>
        <linearGradient id="char-iron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8B0B8" />
          <stop offset="100%" stopColor="#6B7580" />
        </linearGradient>
      </defs>
      <rect x={40} y={52} width={40} height={36} rx={6} fill="url(#char-iron)" />
      <path d="M46,54 L60,60 L74,54 L74,66 L60,72 L46,66 Z" fill="#8090A0" />
      <rect x={28} y={54} width={14} height={24} rx={7} fill="url(#char-iron)" />
      <rect x={78} y={54} width={14} height={24} rx={7} fill="url(#char-iron)" />
      <rect x={44} y={86} width={12} height={18} rx={5} fill="#6B7580" />
      <rect x={64} y={86} width={12} height={18} rx={5} fill="#6B7580" />
      <ellipse cx={50} cy={103} rx={9} ry={5} fill="#6B7580" />
      <ellipse cx={70} cy={103} rx={9} ry={5} fill="#6B7580" />
      {face(eyeExpr)}
      <rect x={86} y={38} width={4} height={30} rx={1} fill="#A8B0B8" />
      <rect x={82} y={66} width={12} height={4} rx={2} fill="#6B7580" />
      <path d="M86,38 L90,38 L88,32 Z" fill="#C0C8D0" />
      <path d="M20,56 L34,52 L34,76 L27,82 L20,76 Z" fill="url(#char-iron)" />
      <path d="M23,58 L31,55 L31,73 L27,77 L23,73 Z" fill="#8090A0" />
    </g>
  );
}

function renderLv4(eyeExpr: EyeExpr) {
  return (
    <g>
      <defs>
        <linearGradient id="char-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0E4E8" />
          <stop offset="50%" stopColor="#C0C8D0" />
          <stop offset="100%" stopColor="#A0A8B0" />
        </linearGradient>
      </defs>
      <path d="M38,48 Q30,70 26,105 L94,105 Q90,70 82,48 Z" fill="#4A6FA5" opacity={0.8} />
      <rect x={40} y={52} width={40} height={36} rx={6} fill="url(#char-silver)" />
      <path d="M46,54 L60,62 L74,54 L74,68 L60,74 L46,68 Z" fill="#D0D8E0" />
      <ellipse cx={38} cy={54} rx={8} ry={5} fill="url(#char-silver)" />
      <ellipse cx={82} cy={54} rx={8} ry={5} fill="url(#char-silver)" />
      <rect x={26} y={56} width={14} height={24} rx={7} fill="url(#char-silver)" />
      <rect x={80} y={56} width={14} height={24} rx={7} fill="url(#char-silver)" />
      <rect x={44} y={86} width={12} height={18} rx={5} fill="#A0A8B0" />
      <rect x={64} y={86} width={12} height={18} rx={5} fill="#A0A8B0" />
      <ellipse cx={50} cy={103} rx={9} ry={5} fill="#A0A8B0" />
      <ellipse cx={70} cy={103} rx={9} ry={5} fill="#A0A8B0" />
      {face(eyeExpr)}
      <rect x={88} y={34} width={4} height={34} rx={1} fill="#D0D8E0" />
      <rect x={84} y={66} width={12} height={4} rx={2} fill="#A0A8B0" />
      <path d="M88,34 L92,34 L90,26 Z" fill="#E0E8F0" />
    </g>
  );
}

function renderLv5(eyeExpr: EyeExpr) {
  return (
    <g>
      <defs>
        <linearGradient id="char-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
      </defs>
      <path d="M36,46 Q24,72 22,108 L98,108 Q96,72 84,46 Z" fill="#C0392B" opacity={0.85} />
      <path d="M36,46 Q28,60 24,80" stroke="#E74C3C" strokeWidth={2} fill="none" />
      <rect x={40} y={52} width={40} height={36} rx={6} fill="url(#char-gold)" />
      <path d="M46,54 L60,62 L74,54 L74,68 L60,74 L46,68 Z" fill="#FFE066" />
      <ellipse cx={36} cy={53} rx={10} ry={6} fill="url(#char-gold)" />
      <ellipse cx={84} cy={53} rx={10} ry={6} fill="url(#char-gold)" />
      <rect x={24} y={56} width={14} height={24} rx={7} fill="url(#char-gold)" />
      <rect x={82} y={56} width={14} height={24} rx={7} fill="url(#char-gold)" />
      <rect x={44} y={86} width={12} height={18} rx={5} fill="#DAA520" />
      <rect x={64} y={86} width={12} height={18} rx={5} fill="#DAA520" />
      <ellipse cx={50} cy={103} rx={9} ry={5} fill="#DAA520" />
      <ellipse cx={70} cy={103} rx={9} ry={5} fill="#DAA520" />
      {face(eyeExpr)}
      <rect x={90} y={28} width={5} height={40} rx={2} fill="#FFD700" />
      <rect x={85} y={66} width={15} height={5} rx={2} fill="#DAA520" />
      <path d="M90,28 L95,28 L92.5,18 Z" fill="#FFE066" />
      <circle cx={92.5} cy={70} r={3} fill="#E74C3C" />
    </g>
  );
}

function renderLv6(eyeExpr: EyeExpr) {
  return (
    <g>
      <defs>
        <linearGradient id="char-platinum" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F0FF" />
          <stop offset="50%" stopColor="#B8D0F0" />
          <stop offset="100%" stopColor="#90B0E0" />
        </linearGradient>
        <radialGradient id="char-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#B8D0F0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={60} cy={60} r={55} fill="url(#char-glow)" />
      <path d="M36,48 Q26,75 28,108 L92,108 Q94,75 84,48 Z" fill="#2C3E80" opacity={0.85} />
      <rect x={40} y={52} width={40} height={36} rx={6} fill="url(#char-platinum)" />
      <path d="M46,54 L60,64 L74,54 L74,70 L60,76 L46,70 Z" fill="#D0E0FF" />
      <ellipse cx={36} cy={53} rx={10} ry={7} fill="url(#char-platinum)" />
      <ellipse cx={84} cy={53} rx={10} ry={7} fill="url(#char-platinum)" />
      <rect x={24} y={56} width={14} height={24} rx={7} fill="url(#char-platinum)" />
      <rect x={82} y={56} width={14} height={24} rx={7} fill="url(#char-platinum)" />
      <rect x={44} y={86} width={12} height={18} rx={5} fill="#90B0E0" />
      <rect x={64} y={86} width={12} height={18} rx={5} fill="#90B0E0" />
      <ellipse cx={50} cy={103} rx={9} ry={5} fill="#90B0E0" />
      <ellipse cx={70} cy={103} rx={9} ry={5} fill="#90B0E0" />
      {face(eyeExpr)}
      <rect x={16} y={24} width={4} height={55} rx={2} fill="#6B4C8A" />
      <circle cx={18} cy={22} r={8} fill="#9B59B6" opacity={0.7} />
      <circle cx={18} cy={22} r={5} fill="#BB77DD" />
      <circle cx={16} cy={20} r={2} fill="#FFFFFF" opacity={0.8} />
    </g>
  );
}

function renderLv7(eyeExpr: EyeExpr) {
  return (
    <g>
      <defs>
        <linearGradient id="char-holy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8E0" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
        <radialGradient id="char-holyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity={0.5} />
          <stop offset="60%" stopColor="#FFD700" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={60} cy={60} r={58} fill="url(#char-holyGlow)" />
      <path d="M34,44 Q20,75 18,112 L102,112 Q100,75 86,44 Z" fill="#4A1A6B" opacity={0.85} />
      <path d="M22,100 L98,100 L102,112 L18,112 Z" fill="#6B2A9B" opacity={0.5} />
      <rect x={40} y={52} width={40} height={36} rx={6} fill="url(#char-holy)" />
      <path d="M46,54 L60,64 L74,54 L74,70 L60,76 L46,70 Z" fill="#FFF0C0" />
      <ellipse cx={34} cy={52} rx={12} ry={8} fill="url(#char-holy)" />
      <ellipse cx={86} cy={52} rx={12} ry={8} fill="url(#char-holy)" />
      <rect x={22} y={54} width={14} height={26} rx={7} fill="url(#char-holy)" />
      <rect x={84} y={54} width={14} height={26} rx={7} fill="url(#char-holy)" />
      <rect x={44} y={86} width={12} height={18} rx={5} fill="#DAA520" />
      <rect x={64} y={86} width={12} height={18} rx={5} fill="#DAA520" />
      <ellipse cx={50} cy={103} rx={9} ry={5} fill="#DAA520" />
      <ellipse cx={70} cy={103} rx={9} ry={5} fill="#DAA520" />
      {face(eyeExpr)}
      <path d="M44,12 L48,22 L54,14 L60,24 L66,14 L72,22 L76,12 L78,26 L42,26 Z" fill="#FFD700" />
      <rect x={42} y={24} width={36} height={4} rx={2} fill="#DAA520" />
      <circle cx={54} cy={19} r={2} fill="#E74C3C" />
      <circle cx={60} cy={17} r={2.5} fill="#3498DB" />
      <circle cx={66} cy={19} r={2} fill="#2ECC71" />
      <rect x={92} y={20} width={5} height={48} rx={2} fill="#E0E8F0" />
      <rect x={87} y={66} width={15} height={5} rx={2} fill="#FFD700" />
      <path d="M92,20 L97,20 L94.5,8 Z" fill="#FFFFFF" />
      <circle cx={94.5} cy={70} r={4} fill="#FFD700" />
      <circle cx={94.5} cy={70} r={2} fill="#E74C3C" />
    </g>
  );
}
