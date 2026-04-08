"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Family, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("otetsudai_families")
      .select("*")
      .then(({ data }) => {
        setFamilies(data || []);
        setLoading(false);
      });
  }, []);

  async function handleFamilySelect(family: Family) {
    setSelectedFamily(family);
    setSelectedUser(null);
    setPin("");
    setError("");
    const { data } = await supabase
      .from("otetsudai_users")
      .select("*")
      .eq("family_id", family.id);
    setMembers(data || []);
  }

  function handleUserSelect(user: User) {
    setSelectedUser(user);
    setPin("");
    setError("");
  }

  async function handleLogin() {
    if (!selectedUser) return;

    // PIN照合（サーバーサイドハッシュ比較）
    if (selectedUser.pin) {
      const { data: valid } = await supabase.rpc("verify_pin", {
        p_user_id: selectedUser.id,
        p_pin: pin,
      });
      if (!valid) {
        setError("PINが違います");
        return;
      }
    }

    localStorage.setItem(
      "otetsudai_session",
      JSON.stringify({
        userId: selectedUser.id,
        familyId: selectedFamily!.id,
        role: selectedUser.role,
        name: selectedUser.name,
      })
    );

    if (selectedUser.role === "parent") {
      router.push("/parent");
    } else {
      router.push(`/child/${selectedUser.id}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-xl border-amber-200">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">⚔️</div>
          <CardTitle className="text-2xl font-bold text-emerald-800">
            おこづかいクエスト
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            クエストをクリアしてコインをかせごう！
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            <Link href="/signup">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-600 hover:bg-amber-50">
                ✨ はじめてのかた
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-500 hover:bg-gray-50">
                📖 つかいかた
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFamily ? (
            <>
              <Label className="text-base font-semibold">
                おうちをえらんでね
              </Label>
              <div className="grid gap-2">
                {families.map((f) => (
                  <Button
                    key={f.id}
                    variant="outline"
                    className="h-14 text-lg border-amber-300 hover:bg-amber-100"
                    onClick={() => handleFamilySelect(f)}
                  >
                    🏠 {f.name}
                  </Button>
                ))}
              </div>
            </>
          ) : !selectedUser ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFamily(null);
                    setMembers([]);
                  }}
                >
                  ← もどる
                </Button>
                <span className="font-semibold text-amber-700">
                  {selectedFamily.name}
                </span>
              </div>
              <Label className="text-base font-semibold">だれかな？</Label>
              <div className="grid gap-2">
                {members.map((m) => (
                  <Button
                    key={m.id}
                    variant="outline"
                    className="h-14 text-lg border-amber-300 hover:bg-amber-100"
                    onClick={() => handleUserSelect(m)}
                  >
                    {m.role === "parent" ? "👨‍👩‍👧‍👦" : "🧒"} {m.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({m.role === "parent" ? "おやこうざ" : "こどもこうざ"})
                    </span>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  ← もどる
                </Button>
                <span className="font-semibold text-amber-700">
                  {selectedUser.name}
                </span>
              </div>
              {selectedUser.pin ? (
                <>
                  <Label htmlFor="pin" className="text-base font-semibold">
                    PINをいれてね 🔑
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    おうちのひとにきいた4けたのばんごうをいれてね
                  </p>
                  <Input
                    id="pin"
                    type="password"
                    maxLength={4}
                    placeholder="4けたのPIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="text-center text-2xl tracking-widest h-14"
                  />
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  PINなしでログインします
                </p>
              )}
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
              <Button
                className="w-full h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleLogin}
              >
                ログイン
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
