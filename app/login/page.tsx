"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Family, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { R } from "@/components/ruby-text";
import { PixelCrossedSwordsIcon, PixelStarIcon, PixelCheckIcon, PixelTrashIcon, PixelDoorIcon } from "@/components/pixel-icons";
import PixelHeroSvg from "@/components/pixel-hero-svg";
import RpgButton from "@/components/rpg-button";

type LoginMode = "select" | "family" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const initialMode: LoginMode = searchParams.get("mode") === "admin" ? "admin" : "select";
  const [loginMode, setLoginMode] = useState<LoginMode>(initialMode);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Family | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadFamilies();
  }, []);

  function loadFamilies() {
    supabase
      .from("otetsudai_families")
      .select("*")
      .then(({ data }) => {
        setFamilies(data || []);
        setLoading(false);
      });
  }

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

  async function handleAdminLogin() {
    setError("");
    setAdminLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (authError || !authData.user) {
        setError("メールアドレスまたはパスワードが正しくありません");
        setAdminLoading(false);
        return;
      }
      // otetsudai_usersからadminロールを照合
      const { data: adminUser } = await supabase
        .from("otetsudai_users")
        .select("*")
        .eq("auth_id", authData.user.id)
        .eq("role", "admin")
        .single();
      if (!adminUser) {
        await supabase.auth.signOut();
        setError("管理者権限がありません");
        setAdminLoading(false);
        return;
      }
      localStorage.setItem(
        "otetsudai_session",
        JSON.stringify({
          userId: adminUser.id,
          familyId: null,
          role: "admin",
          name: adminUser.name,
          authId: authData.user.id,
        })
      );
      router.push("/admin");
    } catch {
      setError("ログインに失敗しました");
    }
    setAdminLoading(false);
  }

  async function handleDeleteFamily() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/family", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_id: deleteTarget.id }),
      });
      if (res.ok) {
        setDeleteTarget(null);
        loadFamilies();
      } else {
        const data = await res.json();
        setError(data.error || "削除に失敗しました");
      }
    } catch {
      setError("削除に失敗しました");
    }
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  // 管理者ログイン画面
  if (loginMode === "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-xl border-primary/40 bg-card">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🔧</div>
            <CardTitle className="text-xl font-bold text-primary">
              管理者ログイン
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              管理者アカウントでログインしてください
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm font-semibold text-card-foreground">
                メールアドレス
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-sm font-semibold text-card-foreground">
                パスワード
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワード"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <RpgButton
              tier="gold"
              size="lg"
              fullWidth
              onClick={handleAdminLogin}
              disabled={adminLoading || !adminEmail || !adminPassword}
            >
              {adminLoading ? "ログインちゅう..." : "ログイン"}
            </RpgButton>
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-card-foreground transition-colors"
              onClick={async () => {
                if (!adminEmail) { setError("メールアドレスを入力してください"); return; }
                setError("");
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(adminEmail, {
                  redirectTo: `${window.location.origin}/login`,
                });
                if (resetError) { setError(resetError.message); return; }
                setError("");
                alert("パスワードリセットメールを送信しました。メールを確認してください。");
              }}
            >
              パスワードを忘れた方はこちら
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-card-foreground"
              onClick={() => {
                setLoginMode("select");
                setError("");
                setAdminEmail("");
                setAdminPassword("");
                setShowPassword(false);
              }}
            >
              <span className="flex items-center gap-1"><PixelDoorIcon size={14} /> もどる</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // モード選択画面
  if (loginMode === "select") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-xl border-primary/40 bg-card">
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center"><PixelHeroSvg type="warrior" size={48} /></div>
            <CardTitle className="text-2xl font-bold text-primary drop-shadow-[0_2px_8px_rgba(255,166,35,0.4)]">
              おこづかいクエスト
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              クエストをクリアしてコインを<R k="稼" r="かせ" />ごう！
            </p>
            <div className="flex gap-2 mt-2 justify-center">
              <Link href="/signup">
                <Button variant="outline" size="sm" className="border-primary/60 text-primary hover:bg-primary/10">
                  <span className="flex items-center gap-1"><PixelStarIcon size={14} /> <R k="初" r="はじ" />めての<R k="方" r="かた" /></span>
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-secondary">
                  📖 <R k="使" r="つか" />い<R k="方" r="かた" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {verified === "true" && (
              <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/40 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-[#58d68d] flex items-center gap-1"><PixelCheckIcon size={14} /> メール<R k="認証" r="にんしょう" />が<R k="完了" r="かんりょう" />しました</p>
                <p className="text-xs text-[#58d68d]/80 mt-1">ログインしてください</p>
              </div>
            )}
            {verified === "error" && (
              <div className="bg-[#e74c3c]/10 border border-[#e74c3c]/40 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-[#ff6b6b]"><R k="認証" r="にんしょう" />リンクが<R k="無効" r="むこう" />です</p>
                <p className="text-xs text-[#ff6b6b]/80 mt-1">リンクの<R k="有効期限" r="ゆうこうきげん" />が<R k="切" r="き" />れている<R k="可能性" r="かのうせい" />があります</p>
              </div>
            )}
            <Label className="text-base font-semibold text-center block text-card-foreground">
              どちらでログインする？
            </Label>
            <div className="grid gap-3">
              <RpgButton tier="gold" size="lg" fullWidth onClick={() => setLoginMode("family")}>
                <span className="text-2xl" aria-hidden="true">🧒</span>
                <span className="text-lg">こどもモード</span>
              </RpgButton>
              <RpgButton
                tier="violet"
                size="lg"
                fullWidth
                onClick={() => {
                  setLoginMode("admin");
                  setError("");
                }}
              >
                <span className="text-2xl" aria-hidden="true">👨‍👩‍👧‍👦</span>
                <span className="text-lg">おやモード</span>
              </RpgButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/40 bg-card">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">⚔️</div>
          <CardTitle className="text-2xl font-bold text-primary drop-shadow-[0_2px_8px_rgba(255,166,35,0.4)]">
            おこづかいクエスト
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            クエストをクリアしてコインを<R k="稼" r="かせ" />ごう！
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFamily ? (
            <>
              <Label className="text-base font-semibold">
                おうちを<R k="選" r="えら" />んでね
              </Label>
              <div className="grid gap-2">
                {families.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-14 text-lg border-primary/60 hover:bg-primary/10 text-card-foreground flex-1"
                      onClick={() => handleFamilySelect(f)}
                    >
                      🏠 {f.name}
                    </Button>
                    {f.name !== "山田家" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-14 px-3 text-[#ff6b6b] hover:text-[#ff6b6b] hover:bg-[#e74c3c]/10 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(f);
                        }}
                      >
                        <PixelTrashIcon size={14} />
                      </Button>
                    )}
                  </div>
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
                  <span className="flex items-center gap-1"><PixelDoorIcon size={14} /> もどる</span>
                </Button>
                <span className="font-semibold text-primary">
                  {selectedFamily.name}
                </span>
              </div>
              <Label className="text-base font-semibold text-card-foreground"><R k="誰" r="だれ" />かな？</Label>
              <div className="grid gap-2">
                {members.map((m) => (
                  <Button
                    key={m.id}
                    variant="outline"
                    className="h-14 text-lg border-primary/60 hover:bg-primary/10 text-card-foreground"
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
                  <span className="flex items-center gap-1"><PixelDoorIcon size={14} /> もどる</span>
                </Button>
                <span className="font-semibold text-primary">
                  {selectedUser.name}
                </span>
              </div>
              {selectedUser.pin ? (
                <>
                  <Label htmlFor="pin" className="text-base font-semibold text-card-foreground">
                    PINを<R k="入" r="い" />れてね 🔑
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    おうちの<R k="人" r="ひと" />に<R k="聞" r="き" />いた4けたの<R k="番号" r="ばんごう" />を<R k="入" r="い" />れてね
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
              <RpgButton tier="gold" size="lg" fullWidth onClick={handleLogin}>
                クエストをはじめる！
              </RpgButton>
            </>
          )}
        </CardContent>
        <div className="text-center pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-card-foreground"
            onClick={() => {
              setLoginMode("select");
              setSelectedFamily(null);
              setSelectedUser(null);
              setMembers([]);
              setError("");
            }}
          >
            <span className="flex items-center gap-1"><PixelDoorIcon size={14} /> モードをえらびなおす</span>
          </Button>
        </div>
      </Card>

      {/* 家族削除確認ダイアログ（開発用） */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-[#e74c3c]/60 bg-card shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#ff6b6b] flex items-center gap-2">
                <PixelTrashIcon size={14} /> おうちデータの 削除
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-card-foreground">
                「{deleteTarget.name}」のデータをすべて削除しますか？
              </p>
              <p className="text-xs text-[#ff6b6b]">
                この操作は取り消せません。家族に紐づくすべてのデータ（ユーザー・クエスト・ウォレット・履歴等）が完全に削除されます。
              </p>
              {error && (
                <p className="text-destructive text-xs text-center">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setDeleteTarget(null); setError(""); }}
                  disabled={deleting}
                >
                  やめる
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-[#e74c3c] hover:bg-[#c0392b] text-white"
                  onClick={handleDeleteFamily}
                  disabled={deleting}
                >
                  {deleting ? "削除中..." : "削除する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
