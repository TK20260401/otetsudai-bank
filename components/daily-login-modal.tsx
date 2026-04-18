"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RpgButton from "@/components/rpg-button";
import { BONUS_SCHEDULE, claimDailyBonus, getDailyLoginStatus, type DailyBonusResult } from "@/lib/daily-login";

type Props = {
  open: boolean;
  onClose: () => void;
  childId: string;
  walletId: string | null;
  onClaimed?: () => void;
};

export default function DailyLoginModal({ open, onClose, childId, walletId, onClaimed }: Props) {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [status, setStatus] = useState<{
    canClaimToday: boolean;
    currentStreak: number;
    nextDayInCycle: number;
    nextAmount: number;
  } | null>(null);
  const [result, setResult] = useState<DailyBonusResult | null>(null);

  useEffect(() => {
    if (!open) {
      setResult(null);
      return;
    }
    setLoading(true);
    getDailyLoginStatus(childId).then((s) => {
      setStatus({
        canClaimToday: s.canClaimToday,
        currentStreak: s.record?.current_streak ?? 0,
        nextDayInCycle: s.nextDayInCycle,
        nextAmount: s.nextAmount,
      });
      setLoading(false);
    });
  }, [open, childId]);

  async function handleClaim() {
    if (!walletId) return;
    setClaiming(true);
    const r = await claimDailyBonus(childId, walletId);
    setResult(r);
    setClaiming(false);
    onClaimed?.();
  }

  const effectiveStreak = result?.awarded ? result.streak : status?.currentStreak ?? 0;
  const highlightDay = result?.awarded ? result.dayInCycle : status?.nextDayInCycle ?? 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center">
            🎁 ログインボーナス
          </DialogTitle>
          <DialogDescription className="text-center">
            {result?.awarded
              ? `${result.streak}日れんぞく ログイン！`
              : result?.alreadyClaimedToday
                ? "きょうは もう もらったよ"
                : "まいにち ログインで コインゲット！"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground py-6">よみこみ中...</p>
        ) : (
          <>
            <div className="flex justify-between items-end gap-1 py-3">
              {BONUS_SCHEDULE.map((amount, i) => {
                const day = i + 1;
                const isToday = day === highlightDay;
                const isPast = day < highlightDay;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                        isToday
                          ? "border-primary bg-primary/20 scale-110 shadow-[0_0_12px_rgba(255,166,35,0.55)]"
                          : isPast
                            ? "border-green-500/40 bg-green-500/10"
                            : "border-border bg-muted/40"
                      }`}
                    >
                      <div className="text-center">
                        <div className={isToday ? "text-primary" : isPast ? "text-green-400" : "text-muted-foreground"}>
                          {isPast ? "✓" : `${amount}`}
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">Day{day}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-xs text-muted-foreground my-2">
              つづけると ますます おおく もらえる！
            </div>

            {result?.awarded ? (
              <div className="text-center my-3">
                <p className="text-3xl font-bold text-primary drop-shadow-[0_2px_8px_rgba(255,166,35,0.55)]">
                  +{result.amount}円
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  「つかう」に ついかされたよ！
                </p>
              </div>
            ) : status?.canClaimToday ? (
              <div className="my-3">
                <RpgButton tier="gold" size="lg" fullWidth onClick={handleClaim} disabled={claiming || !walletId}>
                  {claiming ? "うけとりちゅう..." : `+${status.nextAmount}円 うけとる`}
                </RpgButton>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm my-3">
                あしたも きてね！
              </p>
            )}

            <div className="text-center text-[11px] text-muted-foreground">
              <span className="text-accent font-bold">🔥{effectiveStreak}</span>日れんぞく
            </div>

            <div className="mt-4">
              <RpgButton tier="silver" size="md" fullWidth onClick={onClose}>
                とじる
              </RpgButton>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
