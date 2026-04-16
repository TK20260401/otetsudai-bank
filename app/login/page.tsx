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

type LoginMode = "family" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "family";
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
        <Card className="w-full max-w-md shadow-xl border-slate-300">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🔧</div>
            <CardTitle className="text-xl font-bold text-slate-700">
              管理者ログイン
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              管理者アカウントでログインしてください
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm font-semibold text-slate-600">
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
              <Label htmlFor="admin-password" className="text-sm font-semibold text-slate-600">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <Button
              className="w-full h-12 text-lg bg-slate-700 hover:bg-slate-800 text-white"
              onClick={handleAdminLogin}
              disabled={adminLoading || !adminEmail || !adminPassword}
            >
              {adminLoading ? "ログインちゅう..." : "ログイン"}
            </Button>
            <button
              type="button"
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
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
              className="w-full text-slate-500"
              onClick={() => {
                setLoginMode("family");
                setError("");
                setAdminEmail("");
                setAdminPassword("");
                setShowPassword(false);
              }}
            >
              ← もどる
            </Button>
          </CardContent>
        </Card>
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
            クエストをクリアしてコインを<R k="稼" r="かせ" />ごう！
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            <Link href="/signup">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-600 hover:bg-amber-50">
                ✨ <R k="初" r="はじ" />めての<R k="方" r="かた" />
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-500 hover:bg-gray-50">
                📖 <R k="使" r="つか" />い<R k="方" r="かた" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {verified === "true" && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold text-emerald-700">✅ メール認証が完了しました</p>
              <p className="text-xs text-emerald-600 mt-1">ログインしてください</p>
            </div>
          )}
          {verified === "error" && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold text-red-700">認証リンクが無効です</p>
              <p className="text-xs text-red-600 mt-1">リンクの有効期限が切れている可能性があります</p>
            </div>
          )}
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
                      className="h-14 text-lg border-amber-300 hover:bg-amber-100 flex-1"
                      onClick={() => handleFamilySelect(f)}
                    >
                      🏠 {f.name}
                    </Button>
                    {f.name !== "山田家" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-14 px-3 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(f);
                        }}
                      >
                        🗑️
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
                  ← もどる
                </Button>
                <span className="font-semibold text-amber-700">
                  {selectedFamily.name}
                </span>
              </div>
              <Label className="text-base font-semibold"><R k="誰" r="だれ" />かな？</Label>
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
              <Button
                className="w-full h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleLogin}
              >
                ログイン
              </Button>
            </>
          )}
        </CardContent>
        {/* 管理者ログインリンク（控えめに配置） */}
        <div className="text-center pb-4">
          <button
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => {
              setLoginMode("admin");
              setError("");
            }}
          >
            🔧 管理者ログイン
          </button>
        </div>
      </Card>

      {/* 家族削除確認ダイアログ（開発用） */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-red-300 bg-white shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700 flex items-center gap-2">
                🗑️ おうちデータの 削除
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-red-800">
                「{deleteTarget.name}」のデータをすべて削除しますか？
              </p>
              <p className="text-xs text-red-500">
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
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteFamily}
                  disabled={deleting}
                >
                  {deleting ? "削除中..." : "🗑️ 削除する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
