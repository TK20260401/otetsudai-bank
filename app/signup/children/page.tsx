"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { R } from "@/components/ruby-text";

type ChildForm = { name: string; pin: string };

export default function ChildrenSignupPage() {
  const router = useRouter();
  const session = getSession();
  const [children, setChildren] = useState<ChildForm[]>([{ name: "", pin: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addChild() {
    if (children.length >= 5) return;
    setChildren([...children, { name: "", pin: "" }]);
  }

  function removeChild(index: number) {
    if (children.length <= 1) return;
    setChildren(children.filter((_, i) => i !== index));
  }

  function updateChild(index: number, field: keyof ChildForm, value: string) {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  }

  async function handleSubmit() {
    if (!session) { router.push("/login"); return; }

    const validChildren = children.filter((c) => c.name.trim());
    if (validChildren.length === 0) {
      setError("お子さまの名前を1人以上入力してください");
      return;
    }

    for (const c of validChildren) {
      if (c.pin && c.pin.length !== 4) {
        setError(`${c.name}のPINは4けたにしてください`);
        return;
      }
    }

    setError("");
    setLoading(true);

    for (const child of validChildren) {
      // 子供ユーザー作成
      const { data: childData, error: childError } = await supabase
        .from("otetsudai_users")
        .insert({
          family_id: session.familyId,
          role: "child",
          name: child.name.trim(),
          pin: child.pin || null,
        })
        .select()
        .single();

      if (childError || !childData) {
        setError(`${child.name}の登録に失敗しました`);
        setLoading(false);
        return;
      }

      // PINをサーバーサイドでハッシュ化
      if (child.pin) {
        await supabase.rpc("set_pin_hash", { p_user_id: childData.id, p_pin: child.pin });
      }

      // ウォレット作成（3分割: つかう70% / ためる20% / ふやす10%）
      // ウェルカムボーナス100円を「つかう」に付与
      const welcomeBonus = 100;
      const { data: walletData } = await supabase.from("otetsudai_wallets").insert({
        child_id: childData.id,
        spending_balance: welcomeBonus,
        saving_balance: 0,
        invest_balance: 0,
        save_ratio: 20,
        invest_ratio: 10,
        split_ratio: 20,
      }).select().single();

      // ウェルカムボーナスのトランザクション記録
      if (walletData) {
        await supabase.from("otetsudai_transactions").insert({
          wallet_id: walletData.id,
          type: "earn",
          amount: welcomeBonus,
          description: "🎉 ウェルカムボーナス！冒険の始まりだ！",
        });
      }
    }

    router.push("/signup/complete");
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">ログインしてください</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-xl border-amber-200">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">🧒</div>
          <CardTitle className="text-2xl font-bold text-amber-800">
            お<R k="子" r="こ" />さまを<R k="登録" r="とうろく" />しよう
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            お<R k="手伝" r="てつだ" />いをするお<R k="子" r="こ" />さまの<R k="名前" r="なまえ" />を<R k="入" r="い" />れてね（<R k="最大" r="さいだい" />5<R k="人" r="にん" />）
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {children.map((child, i) => (
            <div key={i} className="rounded-lg border border-amber-100 p-3 bg-amber-50/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-amber-700">
                  お<R k="子" r="こ" />さま {i + 1}
                </Label>
                {children.length > 1 && (
                  <Button variant="ghost" size="sm" className="text-red-400 h-6 px-2 text-xs" onClick={() => removeChild(i)}>
                    ✕
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  value={child.name}
                  onChange={(e) => updateChild(i, "name", e.target.value)}
                  placeholder="名前（例: はなこ）"
                />
                <Input
                  type="password"
                  maxLength={4}
                  value={child.pin}
                  onChange={(e) => updateChild(i, "pin", e.target.value.replace(/\D/g, ""))}
                  placeholder="4けたPIN（なしでもOK）"
                  className="tracking-widest"
                />
                <p className="text-[10px] text-muted-foreground">
                  ログインするときに<R k="使" r="つか" />う4けたの<R k="暗証番号" r="あんしょうばんごう" />です。お<R k="子" r="こ" />さまといっしょに<R k="決" r="き" />めてください
                </p>
              </div>
            </div>
          ))}

          {children.length < 5 && (
            <Button variant="outline" className="w-full border-dashed border-amber-300 text-amber-600" onClick={addChild}>
              ＋ お<R k="子" r="こ" />さまを<R k="追加" r="ついか" />
            </Button>
          )}

          {error && <p className="text-destructive text-sm text-center">{error}</p>}

          <Button
            className="w-full h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "登録中..." : "かんりょう！はじめよう 🎉"}
          </Button>

          <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => router.push("/parent")}>
            あとで追加する →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
