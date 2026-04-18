export type TreeStage = "seed" | "sprout" | "sapling" | "tree";

export function getTreeStage(balance: number): {
  stage: TreeStage;
  label: string;
  emoji: string;
  next: number | null;
} {
  if (balance < 100) return { stage: "seed", label: "たね", emoji: "🌰", next: 100 };
  if (balance < 500) return { stage: "sprout", label: "ふたば", emoji: "🌱", next: 500 };
  if (balance < 1000) return { stage: "sapling", label: "わかぎ", emoji: "🌿", next: 1000 };
  return { stage: "tree", label: "たいぼく", emoji: "🌳", next: null };
}
