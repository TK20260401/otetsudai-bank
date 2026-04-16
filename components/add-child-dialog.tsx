"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createChildWithWallet } from "@/lib/services/families";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { R } from "@/components/ruby-text";

type Props = {
  open: boolean;
  onClose: () => void;
  familyId: string;
  onAdded: () => void;
};

export function AddChildDialog({ open, onClose, familyId, onAdded }: Props) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("なまえを いれてください");
      return;
    }
    if (pin && pin.length !== 4) {
      setError("PINは 4けたに してください");
      return;
    }

    setError("");
    setLoading(true);

    const { data, error: createError } = await createChildWithWallet(
      familyId,
      name.trim(),
      pin || undefined
    );

    if (createError || !data) {
      setError("追加に失敗しました");
      setLoading(false);
      return;
    }

    // PINハッシュ化
    if (pin) {
      await supabase.rpc("set_pin_hash", {
        p_user_id: data.id,
        p_pin: pin,
      });
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      setName("");
      setPin("");
      setSuccess(false);
      onClose();
      onAdded();
    }, 1500);
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setName("");
      setPin("");
      setError("");
      setSuccess(false);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>🧒 お<R k="子" r="こ" />さまを <R k="追加" r="ついか" /></DialogTitle>
          <DialogDescription>
            <R k="新" r="あたら" />しい お<R k="子" r="こ" />さまを <R k="家族" r="かぞく" />に <R k="追加" r="ついか" />します
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-lg text-emerald-700">
              {name} を追加しました！
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="child-name">なまえ</Label>
              <Input
                id="child-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="れい: はなこ"
                className="mt-1 h-12 text-lg"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="child-pin">4けた PIN（なしでも OK）</Label>
              <Input
                id="child-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="●●●●"
                className="mt-1 h-12 text-lg tracking-widest text-center"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                ログインするときに <R k="使" r="つか" />う <R k="暗証番号" r="あんしょうばんごう" />です
              </p>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button
              className="w-full h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "追加中..." : "追加する"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
