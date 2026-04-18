"use client";

import React, { useId } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";
import CharacterSvg from "@/components/character-svg";
import { Badge } from "@/components/ui/badge";
import { PixelDoorIcon, PixelCoinIcon, PixelHouseIcon } from "@/components/pixel-icons";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  userName?: string;
  level?: number;
  hp?: number;       // 0-100
  mp?: number;       // 0-10
  exp?: number;      // 0-100
  gold?: number;     // total coin balance
  backHref?: string;
  pendingCount?: number;
  rightActions?: ReactNode;
};

/**
 * ゲームUI風ヘッダー
 * 左: ミニヒーロー + Lv + 名前
 * 中: HP/MP/EXPミニゲージ
 * 右: ゴールド残高 + アクション
 */
export default function GameStatusHeader({
  title,
  userName,
  level = 1,
  hp = 0,
  mp = 0,
  exp = 0,
  gold,
  backHref,
  pendingCount,
  rightActions,
}: Props) {
  const router = useRouter();
  const uid = useId().replace(/[:]/g, "");

  return (
    <div
      className="relative mb-4 rounded-2xl border-2 border-primary/60 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(42,26,77,0.95), rgba(31,15,49,0.95))",
        boxShadow: "0 0 18px rgba(255,166,35,0.28), inset 0 0 0 1px rgba(255,166,35,0.35)",
      }}
    >
      {/* 上部ゴールド装飾バー */}
      <svg width="100%" height={6} viewBox="0 0 400 6" preserveAspectRatio="none" aria-hidden className="block">
        <defs>
          <linearGradient id={`ghs-top-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A5200" />
            <stop offset="30%" stopColor="#FFA623" />
            <stop offset="50%" stopColor="#FFE066" />
            <stop offset="70%" stopColor="#FFA623" />
            <stop offset="100%" stopColor="#8A5200" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={400} height={4} fill={`url(#ghs-top-${uid})`} />
        <rect x={0} y={4} width={400} height={1} fill="#6B3E00" opacity={0.7} />
        {/* コーナー宝石 */}
        <rect x={2} y={1} width={3} height={3} fill="#E74C3C" />
        <rect x={395} y={1} width={3} height={3} fill="#E74C3C" />
      </svg>

      <div className="flex items-center gap-2 px-3 py-2">
        {/* 戻るボタン */}
        {backHref && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2 flex-shrink-0 gap-1 border-primary bg-primary/10 text-primary hover:bg-primary/20"
            onClick={() => router.push(backHref)}
            aria-label="TOPにもどる"
          >
            <PixelHouseIcon size={14} />
            <span className="text-[10px] font-bold">TOP</span>
          </Button>
        )}

        {/* ミニキャラクター */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-lg bg-secondary/70 border border-primary/40 flex items-center justify-center shadow-inner">
            <CharacterSvg level={level} mood="active" size={40} />
          </div>
          <span className="absolute -bottom-1 -right-1 px-1 rounded-md text-[9px] font-bold bg-primary text-primary-foreground border border-accent shadow-sm">
            Lv.{level}
          </span>
        </div>

        {/* 中央: タイトル + 名前 + ゲージ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-primary leading-tight truncate drop-shadow-[0_1px_4px_rgba(255,166,35,0.4)]">
              {title}
            </span>
            {pendingCount !== undefined && pendingCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{pendingCount}</Badge>
            )}
          </div>
          {userName && (
            <p className="text-[10px] text-muted-foreground truncate">{userName}</p>
          )}
          {/* HP / MP / EXP ミニゲージ */}
          <div className="mt-1 space-y-0.5">
            <MiniGauge label="HP" value={hp} color1="#E74C3C" color2="#8A2218" uid={`hp-${uid}`} />
            <MiniGauge label="MP" value={Math.min(100, mp * 10)} color1="#3498DB" color2="#164E72" uid={`mp-${uid}`} />
            <MiniGauge label="EX" value={exp} color1="#FFD700" color2="#8A5200" uid={`ex-${uid}`} />
          </div>
        </div>

        {/* 右: ゴールド残高 + アクション */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {gold !== undefined && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/50">
              <PixelCoinIcon size={12} />
              <span className="text-[11px] font-bold text-accent tabular-nums">
                {gold.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {rightActions}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-card-foreground hover:bg-secondary/80"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
              aria-label="ログアウト"
            >
              <span className="flex items-center gap-0.5"><PixelDoorIcon size={12} /> ログアウト</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniGauge({
  label,
  value,
  color1,
  color2,
  uid,
}: {
  label: string;
  value: number;
  color1: string;
  color2: string;
  uid: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] font-bold w-5 tabular-nums" style={{ color: color1 }}>
        {label}
      </span>
      <svg width="100%" height={6} viewBox="0 0 100 6" preserveAspectRatio="none" className="flex-1 block">
        <defs>
          <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={100} height={6} rx={2} fill="#1A0F2E" />
        <rect x={0} y={0} width={pct} height={6} rx={2} fill={`url(#${uid})`} />
        <rect x={0} y={0} width={pct} height={2} rx={1} fill="#ffffff" opacity={0.3} />
      </svg>
    </div>
  );
}
