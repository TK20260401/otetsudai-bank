"use client";

import { useEffect, useState, useCallback } from "react";
import BattleScene from "@/components/battle-scene";
import TreasureChestAnimation from "@/components/treasure-chest-animation";

type Props = {
  show: boolean;
  level: number;
  rewardAmount?: number;
  badgeEarned?: boolean;
  onComplete: () => void;
};

type Step = "battle" | "chest" | "exp" | "done";

/**
 * RPG報酬シーケンス（Web版）
 * バトル → 宝箱 → EXP/ゴールド獲得表示 の統合演出
 */
export default function RewardSequence({ show, level, rewardAmount = 0, badgeEarned, onComplete }: Props) {
  const [step, setStep] = useState<Step>("battle");

  const reset = useCallback(() => {
    setStep("battle");
  }, []);

  useEffect(() => {
    if (show) reset();
  }, [show, reset]);

  if (!show) return null;

  return (
    <>
      {/* Step 1: バトルシーン */}
      {step === "battle" && (
        <BattleScene
          show
          level={level}
          onComplete={() => setStep("chest")}
        />
      )}

      {/* Step 2: 宝箱オープン */}
      {step === "chest" && (
        <TreasureChestAnimation
          show
          onComplete={() => setStep("exp")}
        />
      )}

      {/* Step 3: EXP / ゴールド獲得表示 */}
      {step === "exp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => { setStep("done"); onComplete(); }}
        >
          <div className="bg-[#1A1A2E] border-2 border-amber-500 rounded-2xl p-8 text-center max-w-[280px] animate-[scaleIn_0.3s_ease-out]">
            {/* バナー */}
            <p className="text-lg font-bold text-amber-400 mb-4" style={{ textShadow: "0 0 10px #FFD700" }}>
              QUEST COMPLETE!
            </p>

            {/* 報酬表示 */}
            {rewardAmount > 0 && (
              <div className="mb-3 animate-[fadeInUp_0.5s_ease-out]">
                <p className="text-sm text-gray-400">ゴールド</p>
                <p className="text-2xl font-bold text-amber-400">+{rewardAmount}G</p>
              </div>
            )}

            {/* バッジ獲得 */}
            {badgeEarned && (
              <div className="mb-3 animate-[fadeInUp_0.7s_ease-out]">
                <p className="text-sm text-purple-400">NEW そうび！</p>
              </div>
            )}

            {/* タップで閉じる */}
            <p className="text-xs text-gray-500 mt-4 animate-pulse">タップして とじる</p>
          </div>

          <style>{`
            @keyframes scaleIn {
              0% { transform: scale(0.5); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeInUp {
              0% { transform: translateY(20px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
