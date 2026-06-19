"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RpgButton from "@/components/rpg-button";
import {
  SHOP_ITEMS,
  RARITY_COLORS,
  getPurchases,
  purchaseItem,
  equipItem,
  unequipAll,
  type PurchaseRecord,
} from "@/lib/shop";

type Props = {
  open: boolean;
  onClose: () => void;
  childId: string;
  walletId: string | null;
  spendingBalance: number;
  onChanged?: () => void;
};

export default function ShopDialog({
  open,
  onClose,
  childId,
  walletId,
  spendingBalance,
  onChanged,
}: Props) {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(null);

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open, childId]);

  async function refresh() {
    setLoading(true);
    const data = await getPurchases(childId);
    setPurchases(data);
    setLoading(false);
  }

  const ownedMap = useMemo(() => {
    const map = new Map<string, PurchaseRecord>();
    for (const p of purchases) map.set(p.item_id, p);
    return map;
  }, [purchases]);

  async function handleBuy(itemId: string, price: number) {
    if (!walletId) return;
    if (spendingBalance < price) {
      setToast({ msg: "お金が たりないよ", tone: "err" });
      return;
    }
    setBusy(itemId);
    const result = await purchaseItem(childId, walletId, itemId);
    setBusy(null);
    if (result.success) {
      setToast({ msg: "こうにゅうしたよ！", tone: "ok" });
      await refresh();
      onChanged?.();
    } else {
      setToast({ msg: result.error || "しっぱい", tone: "err" });
    }
  }

  async function handleEquip(itemId: string) {
    setBusy(itemId);
    await equipItem(childId, itemId);
    setBusy(null);
    await refresh();
    onChanged?.();
  }

  async function handleUnequip() {
    setBusy("unequip");
    await unequipAll(childId);
    setBusy(null);
    await refresh();
    onChanged?.();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🏪 ショップ</DialogTitle>
          <DialogDescription>
            しょうごうを かって キャラクターに つけよう！「取引（つかう）」のおかね: {spendingBalance.toLocaleString()}円
          </DialogDescription>
        </DialogHeader>

        {toast && (
          <div
            className={`rounded-lg px-3 py-2 text-xs text-center ${
              toast.tone === "ok"
                ? "bg-green-500/20 text-green-300 border border-green-500/40"
                : "bg-red-500/20 text-red-300 border border-red-500/40"
            }`}
            onAnimationEnd={() => setToast(null)}
          >
            {toast.msg}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-8">よみこみ中...</p>
        ) : (
          <div className="space-y-2">
            {purchases.some((p) => p.is_equipped) && (
              <button
                className="w-full text-xs text-muted-foreground hover:text-primary text-center py-1"
                onClick={handleUnequip}
                disabled={busy === "unequip"}
              >
                しょうごうを はずす
              </button>
            )}
            {SHOP_ITEMS.map((item) => {
              const owned = ownedMap.get(item.id);
              const isEquipped = owned?.is_equipped;
              const canAfford = spendingBalance >= item.price;
              const rc = RARITY_COLORS[item.rarity];
              return (
                <div
                  key={item.id}
                  className="rounded-xl border-2 p-3 flex items-center gap-3 transition-all"
                  style={{
                    borderColor: isEquipped ? "#ffa623" : rc.border,
                    backgroundColor: isEquipped ? "rgba(255,166,35,0.12)" : rc.bg,
                  }}
                >
                  <div className="text-3xl flex-shrink-0" aria-hidden>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: rc.text }}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.description}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: rc.text }}>
                      {item.rarity.toUpperCase()} ・ {item.price}円
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-24">
                    {isEquipped ? (
                      <p className="text-xs text-primary font-bold text-center">⭐ そうび中</p>
                    ) : owned ? (
                      <RpgButton
                        tier="violet"
                        size="sm"
                        fullWidth
                        onClick={() => handleEquip(item.id)}
                        disabled={busy === item.id}
                      >
                        そうびする
                      </RpgButton>
                    ) : (
                      <RpgButton
                        tier={canAfford ? "gold" : "silver"}
                        size="sm"
                        fullWidth
                        onClick={() => handleBuy(item.id, item.price)}
                        disabled={busy === item.id || !canAfford || !walletId}
                      >
                        {busy === item.id ? "..." : canAfford ? "かう" : "おかね不足"}
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
