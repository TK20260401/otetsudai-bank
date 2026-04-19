"use client";

import { getTreeStage, type TreeStage } from "@/lib/money-tree";
import { R } from "@/components/ruby-text";
import { Progress } from "@/components/ui/progress";

type Props = {
  investBalance: number;
  isParent?: boolean;
};

export function MoneyTree({ investBalance, isParent }: Props) {
  const { stage, label, next } = getTreeStage(investBalance);

  const progress = next
    ? Math.min(100, Math.round((investBalance / next) * 100))
    : 100;

  return (
    <div
      className="flex flex-col items-center p-4 rounded-2xl border-2 border-[#2ecc71]/50 bg-card"
      style={{
        boxShadow: "0 0 16px rgba(46,204,113,0.28), inset 0 0 0 1px rgba(94,232,158,0.2)",
      }}
    >
      {/* アニメーション用スタイル */}
      {!treeKfInjected && (
        <style
          dangerouslySetInnerHTML={{ __html: TREE_KF }}
          ref={() => { treeKfInjected = true; }}
        />
      )}

      {/* 木のビジュアル（SVG） */}
      <div className="relative mb-2">
        <MoneyTreeSvg stage={stage} size={120} />
      </div>

      {/* ステージ名 */}
      <p className="text-sm font-bold text-[#58d68d] drop-shadow-[0_1px_4px_rgba(46,204,113,0.4)]">
        {isParent ? `ふやすの木: ${label}` : (
          <>ふやすの<R k="木" r="き" />: {label}</>
        )}
      </p>

      {/* 進捗バー */}
      {next ? (
        <div className="w-full mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-[11px] text-muted-foreground text-center mt-1">
            {isParent
              ? `次の成長まで あと ${(next - investBalance).toLocaleString()}円`
              : <>つぎの<R k="成長" r="せいちょう" />まで あと {(next - investBalance).toLocaleString()}<R k="円" r="えん" /></>
            }
          </p>
        </div>
      ) : (
        <p className="text-xs text-accent font-bold mt-1 drop-shadow-[0_1px_4px_rgba(249,195,59,0.4)]">
          {isParent ? "最大まで成長した!" : (
            <><R k="最大" r="さいだい" />まで <R k="成長" r="せいちょう" />した!</>
          )}
        </p>
      )}

      {/* ステージ一覧（ミニSVG） */}
      <div className="flex gap-3 mt-3">
        {(["seed", "sprout", "sapling", "tree"] as const).map((s) => (
          <span
            key={s}
            className={`${s === stage ? "opacity-100" : "opacity-30"}`}
          >
            <MoneyTreeSvg stage={s} size={28} />
          </span>
        ))}
      </div>
    </div>
  );
}

const TREE_KF = `
@keyframes leafFlutter {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1.5deg); }
  75% { transform: rotate(-1.5deg); }
}
@keyframes fruitGlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@media (prefers-reduced-motion: reduce) {
  .leaf-flutter, .fruit-glow { animation: none !important; }
}
`;
let treeKfInjected = false;

function MoneyTreeSvg({ stage, size = 140 }: { stage: TreeStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <defs>
        <radialGradient id="mt-soil" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="100%" stopColor="#6B4E12" />
        </radialGradient>
        <radialGradient id="mt-leafGlow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#6ECF6E" />
          <stop offset="100%" stopColor="#2E8B2E" />
        </radialGradient>
        <linearGradient id="mt-trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A0724A" />
          <stop offset="100%" stopColor="#7B5530" />
        </linearGradient>
        <radialGradient id="mt-goldFruit" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#DAA520" />
        </radialGradient>
        <linearGradient id="mt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F5E9" />
          <stop offset="100%" stopColor="#C8E6C9" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="140" height="140" rx="16" fill="url(#mt-sky)" />
      <ellipse cx="70" cy="120" rx="55" ry="14" fill="url(#mt-soil)" />

      {stage === "seed" && <SeedStage />}
      {stage === "sprout" && <SproutStage />}
      {stage === "sapling" && <SaplingStage />}
      {stage === "tree" && <TreeStage />}
    </svg>
  );
}

function SeedStage() {
  return (
    <g>
      <ellipse cx="70" cy="112" rx="18" ry="8" fill="#7B5530" />
      <ellipse cx="70" cy="108" rx="8" ry="6" fill="url(#mt-goldFruit)" />
      <ellipse cx="68" cy="106" rx="3" ry="2" fill="#FFF8DC" opacity={0.6} />
      {/* キラキラ（SVGで描画） */}
      <g transform="translate(82,92)">
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#FFD700" strokeWidth="1" />
        <line x1="-2.5" y1="2.5" x2="2.5" y2="-2.5" stroke="#FFD700" strokeWidth="1" />
      </g>
      <text x="70" y="80" fontSize="11" fontWeight="bold" fill="#8B6914" textAnchor="middle">
        たね
      </text>
    </g>
  );
}

function SproutStage() {
  return (
    <g>
      <rect x="68" y="90" width="4" height="22" rx="2" fill="#5CAD5C" />
      <path d="M70 92 Q56 80 60 90 Q62 95 70 92" fill="#6ECF6E" stroke="#4CAF50" strokeWidth={0.5} />
      <path d="M70 88 Q84 76 80 86 Q78 91 70 88" fill="#6ECF6E" stroke="#4CAF50" strokeWidth={0.5} />
      <ellipse cx="70" cy="112" rx="10" ry="5" fill="#DAA520" opacity={0.3} />
      <text x="70" y="72" fontSize="11" fontWeight="bold" fill="#4CAF50" textAnchor="middle">
        ふたば
      </text>
    </g>
  );
}

function SaplingStage() {
  return (
    <g>
      <rect x="66" y="68" width="8" height="44" rx="3" fill="url(#mt-trunk)" />
      <path d="M66 80 Q54 72 58 82" fill="none" stroke="#A0724A" strokeWidth={3} strokeLinecap="round" />
      <path d="M74 75 Q86 67 82 77" fill="none" stroke="#A0724A" strokeWidth={3} strokeLinecap="round" />
      <ellipse className="leaf-flutter" style={{ animation: "leafFlutter 3s ease-in-out infinite", transformOrigin: "70px 58px" }} cx="70" cy="58" rx="28" ry="22" fill="url(#mt-leafGlow)" />
      <ellipse className="leaf-flutter" style={{ animation: "leafFlutter 3.5s ease-in-out infinite 0.3s", transformOrigin: "56px 66px" }} cx="56" cy="66" rx="14" ry="10" fill="#5CB85C" />
      <ellipse className="leaf-flutter" style={{ animation: "leafFlutter 3.2s ease-in-out infinite 0.6s", transformOrigin: "84px 64px" }} cx="84" cy="64" rx="12" ry="9" fill="#5CB85C" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite" }} cx="58" cy="56" r="4" fill="url(#mt-goldFruit)" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite 0.5s" }} cx="82" cy="54" r="3.5" fill="url(#mt-goldFruit)" />
      <text x="70" y="30" fontSize="11" fontWeight="bold" fill="#2E7D32" textAnchor="middle">
        わかぎ
      </text>
    </g>
  );
}

function TreeStage() {
  return (
    <g>
      <path d="M62 112 Q60 90 64 70 L76 70 Q80 90 78 112 Z" fill="url(#mt-trunk)" />
      <path d="M62 112 Q50 116 48 112" fill="none" stroke="#7B5530" strokeWidth={3} strokeLinecap="round" />
      <path d="M78 112 Q90 116 92 112" fill="none" stroke="#7B5530" strokeWidth={3} strokeLinecap="round" />
      <path d="M64 78 Q46 66 50 76" fill="none" stroke="#A0724A" strokeWidth={4} strokeLinecap="round" />
      <path d="M76 72 Q94 60 90 70" fill="none" stroke="#A0724A" strokeWidth={4} strokeLinecap="round" />
      <ellipse className="leaf-flutter" style={{ animation: "leafFlutter 3s ease-in-out infinite", transformOrigin: "70px 44px" }} cx="70" cy="44" rx="38" ry="28" fill="url(#mt-leafGlow)" />
      <ellipse className="leaf-flutter" style={{ animation: "leafFlutter 3.4s ease-in-out infinite 0.2s", transformOrigin: "50px 56px" }} cx="50" cy="56" rx="18" ry="14" fill="#4CAF50" />
      <ellipse className="leaf-flutter" style={{ animation: "leafFlutter 3.2s ease-in-out infinite 0.5s", transformOrigin: "90px 52px" }} cx="90" cy="52" rx="16" ry="12" fill="#4CAF50" />
      <ellipse className="leaf-flutter" style={{ animation: "leafFlutter 3.6s ease-in-out infinite 0.8s", transformOrigin: "70px 32px" }} cx="70" cy="32" rx="22" ry="14" fill="#66BB6A" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite" }} cx="52" cy="42" r="5" fill="url(#mt-goldFruit)" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite 0.3s" }} cx="88" cy="38" r="5" fill="url(#mt-goldFruit)" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite 0.6s" }} cx="70" cy="30" r="5.5" fill="url(#mt-goldFruit)" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite 0.9s" }} cx="60" cy="52" r="4" fill="url(#mt-goldFruit)" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite 1.2s" }} cx="80" cy="50" r="4.5" fill="url(#mt-goldFruit)" />
      <circle className="fruit-glow" style={{ animation: "fruitGlow 2s ease-in-out infinite 1.5s" }} cx="44" cy="54" r="3.5" fill="url(#mt-goldFruit)" />
      <circle cx="68" cy="28" r="2" fill="#FFF8DC" opacity={0.5} />
      <circle cx="50" cy="40" r="1.5" fill="#FFF8DC" opacity={0.5} />
      {/* 王冠（SVGで描画） */}
      <g transform="translate(60,12)">
        <path d="M-8,0 L-5,-8 L0,0 L5,-8 L8,0 Z" fill="#FFD700" />
        <circle cx="-5" cy="-6" r="1.5" fill="#E74C3C" />
        <circle cx="0" cy="-2" r="1.5" fill="#3498DB" />
        <circle cx="5" cy="-6" r="1.5" fill="#2ECC71" />
      </g>
    </g>
  );
}
