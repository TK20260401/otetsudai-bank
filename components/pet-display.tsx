"use client";

import React from "react";
import type { Pet } from "@/lib/types";
import { PET_TYPE_INFO, GROWTH_THRESHOLDS, HATCH_QUESTS_REQUIRED, calculateHappiness } from "@/lib/pets";
import PetSvg from "@/components/pet-svg";
import { Progress } from "@/components/ui/progress";

type Props = {
  pet: Pet | null;
  onTapEgg?: () => void;
  onManage?: () => void;
};

export default function PetDisplay({ pet, onTapEgg, onManage }: Props) {
  if (!pet) {
    return (
      <button
        onClick={onManage}
        className="mt-1 text-[9px] text-gray-400 hover:text-amber-600 transition-colors"
      >
        ペットを さがそう！
      </button>
    );
  }

  const happiness = calculateHappiness(pet);
  const info = PET_TYPE_INFO[pet.pet_type];

  if (pet.growth_stage === "egg") {
    const ready = pet.quests_since_acquired >= HATCH_QUESTS_REQUIRED;
    return (
      <div className="flex flex-col items-center mt-1">
        <button
          onClick={ready ? onTapEgg : undefined}
          className={`transition-transform ${ready ? "animate-bounce cursor-pointer" : ""}`}
        >
          <PetSvg type={pet.pet_type} stage="egg" size={36} animated />
        </button>
        <div className="w-16 mt-0.5">
          <Progress value={(pet.quests_since_acquired / HATCH_QUESTS_REQUIRED) * 100} className="h-1" />
        </div>
        <p className="text-[8px] text-amber-600 mt-0.5">
          {ready ? "タップで かえそう！" : `あと${HATCH_QUESTS_REQUIRED - pet.quests_since_acquired}クエスト`}
        </p>
      </div>
    );
  }

  // 孵化済みペット
  const nextThreshold =
    pet.growth_stage === "baby" ? GROWTH_THRESHOLDS.child :
    pet.growth_stage === "child" ? GROWTH_THRESHOLDS.adult : null;
  const feedProgress = nextThreshold
    ? Math.min(100, Math.round((pet.fed_count / nextThreshold) * 100))
    : 100;

  return (
    <button onClick={onManage} className="flex flex-col items-center mt-1 cursor-pointer hover:opacity-80 transition-opacity">
      <PetSvg type={pet.pet_type} stage={pet.growth_stage} happiness={happiness} size={36} animated />
      {pet.name && <p className="text-[8px] font-bold text-amber-700 mt-0.5">{pet.name}</p>}
      <p className="text-[7px] text-gray-400">{info.nameJa}</p>
      {nextThreshold && (
        <div className="w-14 mt-0.5">
          <Progress value={feedProgress} className="h-1" />
        </div>
      )}
    </button>
  );
}
