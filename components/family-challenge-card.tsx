"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RpgCard from "@/components/rpg-card";
import RpgButton from "@/components/rpg-button";
import { Progress } from "@/components/ui/progress";
import { PixelTargetIcon, PixelConfettiIcon, PixelGiftIcon, PixelCrownIcon } from "@/components/pixel-icons";
import type { FamilyChallenge, User } from "@/lib/types";

/** ピクセルアートのボスモンスター（スライム風） */
function PixelBossMonster({ defeated = false, size = 64 }: { defeated?: boolean; size?: number }) {
  const opacity = defeated ? 0.4 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" opacity={opacity}>
      <defs>
        <radialGradient id="bossBody" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={defeated ? "#888" : "#7B4CDB"} />
          <stop offset="100%" stopColor={defeated ? "#666" : "#5A2DAA"} />
        </radialGradient>
      </defs>
      <ellipse cx={32} cy={58} rx={22} ry={5} fill="#000" opacity={0.15} />
      <path d="M12,46 Q12,20 32,14 Q52,20 52,46 Q52,54 32,54 Q12,54 12,46 Z" fill="url(#bossBody)" />
      <ellipse cx={24} cy={28} rx={6} ry={4} fill="#FFFFFF" opacity={0.2} />
      <path d="M20,20 L16,8 L24,16 Z" fill={defeated ? "#888" : "#8E44AD"} />
      <circle cx={16} cy={8} r={2} fill={defeated ? "#AAA" : "#E74C3C"} />
      <path d="M44,20 L48,8 L40,16 Z" fill={defeated ? "#888" : "#8E44AD"} />
      <circle cx={48} cy={8} r={2} fill={defeated ? "#AAA" : "#E74C3C"} />
      {defeated ? (
        <>
          <line x1={22} y1={32} x2={28} y2={38} stroke="#333" strokeWidth={2.5} />
          <line x1={28} y1={32} x2={22} y2={38} stroke="#333" strokeWidth={2.5} />
          <line x1={36} y1={32} x2={42} y2={38} stroke="#333" strokeWidth={2.5} />
          <line x1={42} y1={32} x2={36} y2={38} stroke="#333" strokeWidth={2.5} />
          <path d="M26,44 Q32,41 38,44" stroke="#333" strokeWidth={1.5} fill="none" />
        </>
      ) : (
        <>
          <ellipse cx={25} cy={34} rx={5} ry={6} fill="#FFFFFF" />
          <circle cx={26} cy={35} r={3} fill="#333" />
          <circle cx={27} cy={34} r={1} fill="#FFF" />
          <ellipse cx={39} cy={34} rx={5} ry={6} fill="#FFFFFF" />
          <circle cx={40} cy={35} r={3} fill="#333" />
          <circle cx={41} cy={34} r={1} fill="#FFF" />
          <path d="M26,43 Q32,48 38,43" stroke="#333" strokeWidth={1.5} fill="none" />
        </>
      )}
    </svg>
  );
}

type Props = {
  challenge: FamilyChallenge | null;
  children: User[];
  familyId: string;
  isParent?: boolean;
  onCreated?: () => void;
};

type ChildProgress = {
  childId: string;
  name: string;
  icon: string;
  count: number;
};

export function FamilyChallengeCard({
  challenge,
  children: kids,
  familyId,
  isParent,
  onCreated,
}: Props) {
  const [progress, setProgress] = useState<ChildProgress[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!challenge || kids.length === 0) return;
    async function load() {
      const childIds = kids.map((k) => k.id);
      const { data: logs } = await supabase
        .from("otetsudai_task_logs")
        .select("child_id")
        .in("child_id", childIds)
        .eq("status", "approved")
        .gte("approved_at", `${challenge!.start_date}T00:00:00`)
        .lte("approved_at", `${challenge!.end_date}T23:59:59`);

      const counts: Record<string, number> = {};
      (logs || []).forEach((l: { child_id: string }) => {
        counts[l.child_id] = (counts[l.child_id] || 0) + 1;
      });

      const prog = kids.map((k) => ({
        childId: k.id,
        name: k.name,
        icon: k.icon,
        count: counts[k.id] || 0,
      }));
      setProgress(prog);
      setTotalCount(prog.reduce((s, p) => s + p.count, 0));
    }
    load();
  }, [challenge?.id, kids]);

  async function handleCreate() {
    setCreating(true);
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 6);
    const titles = [
      "みんなで 20クエスト クリアしよう！",
      "家族で力を合わせよう！",
      "今週もがんばろう！",
      "めざせクエストマスター！",
    ];
    await supabase.from("otetsudai_family_challenges").insert({
      family_id: familyId,
      title: titles[Math.floor(Math.random() * titles.length)],
      target_quests: 20,
      bonus_amount: 50,
      start_date: today.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
    });
    setCreating(false);
    onCreated?.();
  }

  if (!challenge) {
    if (!isParent) return null;
    return (
      <div className="mb-4">
        <RpgButton tier="gold" size="md" fullWidth disabled={creating} onClick={handleCreate}>
          {creating ? "作成中..." : <><PixelTargetIcon size={16} /> 今週のチャレンジを作る</>}
        </RpgButton>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((totalCount / challenge.target_quests) * 100));
  const remaining = Math.max(0, challenge.target_quests - totalCount);
  const isComplete = challenge.is_achieved || totalCount >= challenge.target_quests;
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000));

  return (
    <RpgCard
      tier={isComplete ? "violet" : "gold"}
      className="mb-4"
      title={
        <span className="flex items-center justify-center gap-1 w-full">
          <PixelCrownIcon size={16} />
          {isComplete ? "家族チャレンジ達成！" : "家族チャレンジ"}
        </span>
      }
    >
      {/* ボスモンスター */}
      <div className="flex flex-col items-center my-2">
        <PixelBossMonster defeated={isComplete} size={56} />
        <p className={`text-[10px] font-bold mt-0.5 ${isComplete ? "text-[#58d68d]" : "text-[#ff6b6b]"}`}>
          {isComplete ? "たおした！" : `HP: ${remaining}/${challenge.target_quests}`}
        </p>
      </div>

      <p className="text-base font-bold text-center text-card-foreground mb-3">
        「{challenge.title}」
      </p>

      {/* メンバー進捗 */}
      <div className="space-y-1.5 mb-3">
        {progress.map((p) => {
          const ratio = challenge.target_quests > 0
            ? Math.min(100, Math.round((p.count / Math.ceil(challenge.target_quests / kids.length)) * 100))
            : 0;
          return (
            <div key={p.childId} className="flex items-center gap-2">
              <span className="text-base w-6">{p.icon}</span>
              <span className="text-xs font-bold w-12 truncate text-card-foreground">{p.name}</span>
              <div className="flex-1">
                <Progress value={ratio} className="h-2.5" />
              </div>
              <span className="text-xs font-bold w-6 text-right text-card-foreground">{p.count}</span>
            </div>
          );
        })}
      </div>

      {/* 合計 */}
      <p className="text-xs text-center text-muted-foreground mb-1">
        家族合計: {totalCount}/{challenge.target_quests} クエスト
      </p>
      <Progress value={percent} className="h-3 mb-1" />
      <p className="text-[10px] text-right text-muted-foreground">{percent}%</p>

      {/* ボーナス */}
      <p className="text-xs font-bold text-accent text-center mt-2 drop-shadow-[0_1px_4px_rgba(249,195,59,0.4)]">
        <span className="flex items-center justify-center gap-1"><PixelGiftIcon size={16} /> 達成ボーナス: みんなに {challenge.bonus_amount}円！</span>
      </p>
      {!isComplete && (
        <p className="text-[11px] text-center text-muted-foreground mt-1">
          あと {remaining}クエスト！ 残り{daysLeft}日 がんばろう！
        </p>
      )}
      {isComplete && (
        <p className="text-xs font-bold text-[#58d68d] text-center mt-1 drop-shadow-[0_1px_4px_rgba(46,204,113,0.4)]">
          <span className="flex items-center justify-center gap-1">みんなで達成した！ おめでとう！ <PixelConfettiIcon size={16} /></span>
        </p>
      )}
    </RpgCard>
  );
}
