"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RpgButton from "@/components/rpg-button";
import PetSvg from "@/components/pet-svg";
import type { Pet } from "@/lib/types";
import {
  PET_TYPE_INFO,
  getAllPets,
  namePet,
  setActivePet,
  calculateHappiness,
  HATCH_QUESTS_REQUIRED,
} from "@/lib/pets";

type Props = {
  open: boolean;
  onClose: () => void;
  childId: string;
  onChanged?: () => void;
};

export default function PetManagementDialog({ open, onClose, childId, onChanged }: Props) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAllPets(childId).then((data) => {
      setPets(data);
      setLoading(false);
    });
  }, [open, childId]);

  async function handleSetActive(petId: string) {
    await setActivePet(childId, petId);
    const updated = await getAllPets(childId);
    setPets(updated);
    onChanged?.();
  }

  async function handleSaveName(petId: string) {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    await namePet(petId, trimmed);
    setEditingId(null);
    setNameDraft("");
    const updated = await getAllPets(childId);
    setPets(updated);
    onChanged?.();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🐾 ペットずかん</DialogTitle>
          <DialogDescription>
            なかまたちを みてみよう。アクティブに できるのは 1ぴきだけ！
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">よみこみ中...</p>
        ) : pets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">
              まだ ペットは いないよ
            </p>
            <p className="text-xs text-muted-foreground">
              クエストを クリアすると たまごが みつかるかも！
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => {
              const info = PET_TYPE_INFO[pet.pet_type];
              const happiness = calculateHappiness(pet);
              const eggProgress = pet.growth_stage === "egg"
                ? Math.min(100, (pet.quests_since_acquired / HATCH_QUESTS_REQUIRED) * 100)
                : 0;
              const isEditing = editingId === pet.id;
              return (
                <div
                  key={pet.id}
                  className={`rounded-xl border-2 p-3 transition-all ${
                    pet.is_active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <PetSvg
                        type={pet.pet_type}
                        stage={pet.growth_stage}
                        happiness={happiness}
                        size={56}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            placeholder="なまえを つけよう"
                            className="h-8 text-sm"
                            autoFocus
                            maxLength={12}
                          />
                          <button
                            className="text-xs text-primary font-bold px-2"
                            onClick={() => handleSaveName(pet.id)}
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <button
                          className="text-left w-full"
                          onClick={() => {
                            setEditingId(pet.id);
                            setNameDraft(pet.name || "");
                          }}
                        >
                          <p className="font-bold text-sm text-card-foreground truncate">
                            {pet.name || `なまえを つけよう ✏️`}
                          </p>
                        </button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {info.nameJa} ・{" "}
                        {pet.growth_stage === "egg"
                          ? "たまご"
                          : pet.growth_stage === "baby"
                          ? "ベビー"
                          : pet.growth_stage === "child"
                          ? "こども"
                          : "おとな"}
                      </p>
                      {pet.growth_stage === "egg" ? (
                        <div className="mt-1">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${eggProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            あと {Math.max(0, HATCH_QUESTS_REQUIRED - pet.quests_since_acquired)} クエストで かえる
                          </p>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${happiness}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            しあわせ {happiness}％ ・ ごはん {pet.fed_count}かい
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    {pet.is_active ? (
                      <p className="text-xs text-primary font-bold text-center">
                        ⭐ アクティブ
                      </p>
                    ) : (
                      <RpgButton
                        tier="violet"
                        size="sm"
                        fullWidth
                        onClick={() => handleSetActive(pet.id)}
                      >
                        アクティブにする
                      </RpgButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <RpgButton tier="silver" size="md" fullWidth onClick={onClose}>
            とじる
          </RpgButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
