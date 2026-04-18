"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PixelSeedlingIcon, PixelCheckIcon, PixelConfettiIcon, PixelCrossedSwordsIcon } from "@/components/pixel-icons";

/**
 * クエスト構造化UI：準備→実行→完了の3ステップ
 * 各ステップをチェックリスト形式で進め、全ステップ完了で「クリア」可能に
 *
 * 習熟度に応じた報酬切り替え：
 *   見習い（apprentice）: 基本報酬
 *   助手（assistant）: 1.5倍
 *   リーダー（leader）: 2倍
 */

export type QuestStep = {
  id: string;
  label: string;
  description?: string;
};

export type SkillLevel = "apprentice" | "assistant" | "leader";

const SKILL_LEVELS: Record<SkillLevel, { label: string; icon: string; multiplier: number; color: string }> = {
  apprentice: { label: "見習い", icon: "🌱", multiplier: 1, color: "text-green-600" },
  assistant: { label: "助手", icon: "⭐", multiplier: 1.5, color: "text-blue-600" },
  leader: { label: "リーダー", icon: "👑", multiplier: 2, color: "text-amber-600" },
};

// クエストテンプレート：犬の散歩の例
export const DOG_WALK_STEPS: QuestStep[] = [
  { id: "prepare", label: "じゅんび", description: "リード・うんちぶくろ・みず を もつ" },
  { id: "execute", label: "おさんぽ", description: "いぬと いっしょに あるく（15ぷん いじょう）" },
  { id: "complete", label: "かんりょう", description: "あしを ふいて みずを あげる" },
];

type QuestStepsProps = {
  steps: QuestStep[];
  baseReward: number;
  skillLevel: SkillLevel;
  onComplete: (reward: number) => void;
  taskTitle: string;
};

export default function QuestSteps({
  steps,
  baseReward,
  skillLevel,
  onComplete,
  taskTitle,
}: QuestStepsProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const skill = SKILL_LEVELS[skillLevel];
  const finalReward = Math.floor(baseReward * skill.multiplier);
  const allChecked = steps.every((s) => checkedSteps.has(s.id));
  const currentStepIndex = steps.findIndex((s) => !checkedSteps.has(s.id));

  function toggleStep(stepId: string) {
    if (completed) return;
    const stepIndex = steps.findIndex((s) => s.id === stepId);

    // 順番にチェックさせる（前のステップが完了していないとチェック不可）
    if (stepIndex > 0 && !checkedSteps.has(steps[stepIndex - 1].id)) return;

    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        // チェック解除：以降のステップも解除
        for (let i = stepIndex; i < steps.length; i++) {
          next.delete(steps[i].id);
        }
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  function handleComplete() {
    setCompleted(true);
    onComplete(finalReward);
  }

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4">
      {/* ヘッダー: タスク名 + 習熟度バッジ */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-amber-800">{taskTitle}</h3>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${skill.color} bg-white border`}>
          <span aria-hidden="true">{skill.icon}</span>
          <span>{skill.label}</span>
        </div>
      </div>

      {/* ステップリスト */}
      <div className="space-y-3 mb-4">
        {steps.map((step, index) => {
          const isChecked = checkedSteps.has(step.id);
          const isCurrent = index === currentStepIndex;
          const isLocked = index > 0 && !checkedSteps.has(steps[index - 1].id);

          return (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              disabled={completed || isLocked}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                isChecked
                  ? "bg-emerald-100 border-2 border-emerald-300"
                  : isCurrent
                    ? "bg-white border-2 border-amber-300 shadow-md"
                    : isLocked
                      ? "bg-gray-100 border-2 border-gray-200 opacity-50"
                      : "bg-white border-2 border-gray-200"
              }`}
              aria-label={`ステップ${index + 1}: ${step.label}${isChecked ? "（完了）" : isLocked ? "（ロック中）" : ""}`}
            >
              {/* ステップ番号 / チェック */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  isChecked
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-amber-400 text-white animate-pulse"
                      : "bg-gray-200 text-gray-500"
                }`}
                aria-hidden="true"
              >
                {isChecked ? "✓" : index + 1}
              </div>

              {/* ステップ内容 */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold ${isChecked ? "text-emerald-700 line-through" : "text-gray-800"}`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className={`text-xs mt-0.5 ${isChecked ? "text-emerald-600/70" : "text-muted-foreground"}`}>
                    {step.description}
                  </p>
                )}
              </div>

              {/* ステータスアイコン */}
              <div className="flex-shrink-0 text-xl" aria-hidden="true">
                {isChecked ? "🎉" : isLocked ? "🔒" : isCurrent ? "👉" : ""}
              </div>
            </button>
          );
        })}
      </div>

      {/* プログレスバー */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>しんちょく</span>
          <span>{checkedSteps.size}/{steps.length}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${(checkedSteps.size / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 報酬表示 + 完了ボタン */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">ごほうび: </span>
          <span className="font-bold text-amber-700 text-lg">¥{finalReward.toLocaleString()}</span>
          {skill.multiplier > 1 && (
            <span className="text-xs text-amber-500 ml-1">
              ({skill.label}ボーナス x{skill.multiplier})
            </span>
          )}
        </div>
        <Button
          onClick={handleComplete}
          disabled={!allChecked || completed}
          className={`px-6 py-3 text-lg font-bold rounded-xl transition-all ${
            allChecked && !completed
              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:scale-105"
              : completed
                ? "bg-gray-300 text-gray-500"
                : "bg-gray-200 text-gray-400"
          }`}
        >
          {completed ? <span className="flex items-center gap-1"><PixelCheckIcon size={14} /> クリア！</span> : <span className="flex items-center gap-1"><PixelCrossedSwordsIcon size={14} /> クリア！</span>}
        </Button>
      </div>

      {/* 習熟度の説明 */}
      <div className="mt-4 pt-3 border-t border-amber-200">
        <p className="text-xs text-muted-foreground mb-2">しゅくれんど（たくさんやるとレベルアップ！）</p>
        <div className="flex gap-2">
          {(Object.entries(SKILL_LEVELS) as [SkillLevel, typeof SKILL_LEVELS[SkillLevel]][]).map(([key, level]) => (
            <div
              key={key}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                key === skillLevel
                  ? "border-amber-400 bg-amber-100 font-bold"
                  : "border-gray-200 bg-white text-muted-foreground"
              }`}
            >
              <span aria-hidden="true">{level.icon}</span>
              <span>{level.label}</span>
              <span className="text-[10px]">x{level.multiplier}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
