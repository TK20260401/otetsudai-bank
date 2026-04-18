"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { PixelMapIcon, PixelFlameIcon, PixelCoinIcon } from "@/components/pixel-icons";
import CharacterSvg from "@/components/character-svg";
import DungeonMap from "@/components/dungeon-map";
import type { User, Wallet } from "@/lib/types";

const LEVEL_THRESHOLDS = [0, 100, 500, 1500, 3000, 5000, 10000];
function getLevel(total: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

type Props = {
  familyName: string;
  children: User[];
  wallets: Record<string, Wallet>;
};

export function FamilyAdventureMap({ familyName, children: kids, wallets }: Props) {
  const [stats, setStats] = useState({ weeklyQuests: 0, weeklyEarned: 0, familyStreak: 0 });
  const [totalFamilyQuests, setTotalFamilyQuests] = useState(0);

  useEffect(() => {
    async function load() {
      if (kids.length === 0) return;
      const childIds = kids.map((k) => k.id);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from("otetsudai_task_logs")
        .select("*, task:otetsudai_tasks(reward_amount)")
        .in("child_id", childIds)
        .eq("status", "approved")
        .gte("approved_at", weekStart.toISOString());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weeklyEarned = (logs || []).reduce((s: number, l: any) => s + (l.task?.reward_amount || 0), 0);

      const { data: streakLogs } = await supabase
        .from("otetsudai_task_logs")
        .select("approved_at")
        .in("child_id", childIds)
        .eq("status", "approved")
        .not("approved_at", "is", null)
        .order("approved_at", { ascending: false })
        .limit(90);

      let familyStreak = 0;
      if (streakLogs && streakLogs.length > 0) {
        const days = new Set(streakLogs.map((l: { approved_at: string }) => new Date(l.approved_at).toDateString()));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const check = new Date(today);
        if (!days.has(check.toDateString())) check.setDate(check.getDate() - 1);
        while (days.has(check.toDateString())) { familyStreak++; check.setDate(check.getDate() - 1); }
      }

      setStats({ weeklyQuests: logs?.length || 0, weeklyEarned, familyStreak });

      // 全期間のクエスト数（ダンジョンフロア用）
      const { count: totalQ } = await supabase
        .from("otetsudai_task_logs")
        .select("id", { count: "exact", head: true })
        .in("child_id", childIds)
        .eq("status", "approved");
      setTotalFamilyQuests(totalQ || 0);
    }
    load();
  }, [kids]);

  const familyTotal = kids.reduce((sum, k) => {
    const w = wallets[k.id];
    return sum + (w ? w.spending_balance + w.saving_balance + w.invest_balance : 0);
  }, 0);

  return (
    <Card className="mb-4 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden relative">
      <CardContent className="p-4 relative z-10">
        {/* ワールドマップ背景 */}
        <div className="absolute inset-0 opacity-[0.08] z-0 pointer-events-none">
          <PixelWorldMapBg />
        </div>

        <p className="text-base font-bold text-amber-800 text-center mb-3 flex items-center justify-center gap-1 relative">
          <PixelMapIcon size={20} /> {familyName}の ぼうけんちず
        </p>

        {/* メンバー横並び */}
        <div className="flex justify-center gap-3 mb-4">
          {kids.map((kid) => {
            const w = wallets[kid.id];
            const total = w ? w.spending_balance + w.saving_balance + w.invest_balance : 0;
            const level = getLevel(total);
            return (
              <div
                key={kid.id}
                className="flex flex-col items-center bg-white/70 rounded-xl p-2 border border-amber-200 min-w-[72px]"
              >
                <CharacterSvg level={Math.min(level, 7)} mood="normal" size={48} />
                <span className="text-[10px] font-bold text-amber-600">Lv.{level}</span>
                <span className="text-xs font-bold text-gray-800 truncate max-w-[64px]">{kid.name}</span>
                <span className="text-[10px] text-muted-foreground">{total.toLocaleString()}円</span>
              </div>
            );
          })}
        </div>

        {/* 家族統計 */}
        <div className="grid grid-cols-4 gap-2 bg-amber-100/50 rounded-xl p-2">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">{stats.weeklyQuests}</p>
            <p className="text-[9px] text-muted-foreground">今週クエスト</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">¥{stats.weeklyEarned.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">稼いだ</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {stats.familyStreak > 0 ? <span className="flex items-center justify-center gap-0.5"><PixelFlameIcon size={14} />{stats.familyStreak}</span> : "—"}
            </p>
            <p className="text-[9px] text-muted-foreground">連続日</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">¥{familyTotal.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">合計</p>
          </div>
        </div>

        {/* ダンジョンフロア進行マップ */}
        <DungeonMap totalQuests={totalFamilyQuests} />
      </CardContent>
    </Card>
  );
}

function PixelWorldMapBg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 340 170" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#E0F0FF" />
        </linearGradient>
        <linearGradient id="wm-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4CAF50" />
          <stop offset="100%" stopColor="#388E3C" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={340} height={170} fill="url(#wm-sky)" />
      <path d="M0,120 L40,60 L80,110 L120,50 L160,100 L200,40 L240,90 L280,55 L320,95 L340,70 L340,170 L0,170 Z" fill="#6B8E4E" opacity={0.3} />
      <path d="M0,140 L60,100 L120,130 L180,95 L240,120 L300,100 L340,130 L340,170 L0,170 Z" fill="url(#wm-grass)" opacity={0.5} />
      <path d="M30,160 Q80,140 130,150 Q180,160 220,140 Q260,120 310,145" fill="none" stroke="#D4A030" strokeWidth={4} strokeLinecap="round" strokeDasharray="8,4" />
      <rect x={275} y={80} width={20} height={30} fill="#A0A0B0" />
      <rect x={270} y={75} width={30} height={8} fill="#B0B0C0" />
      <path d="M270,75 L275,65 L280,75" fill="#C0392B" />
      <path d="M290,75 L295,65 L300,75" fill="#C0392B" />
      <circle cx={50} cy={128} r={8} fill="#2E7D32" />
      <rect x={48} y={134} width={4} height={8} fill="#5D4037" />
      <circle cx={160} cy={118} r={6} fill="#388E3C" />
      <rect x={158} y={123} width={4} height={6} fill="#5D4037" />
      <circle cx={100} cy={138} r={7} fill="#43A047" />
      <rect x={98} y={143} width={4} height={7} fill="#5D4037" />
      <rect x={218} y={130} width={2} height={14} fill="#5D4037" />
      <path d="M220,130 L230,133 L220,136" fill="#E74C3C" />
    </svg>
  );
}
