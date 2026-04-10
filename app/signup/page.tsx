"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleStep1() {
    if (!email || !password) { setError("メールアドレスとパスワードを入力してください"); return; }
    if (password.length < 8) { setError("パスワードは8文字以上にしてください"); return; }
    setError("");
    setStep(2);
  }

  async function handleSignup() {
    if (!familyName.trim()) { setError("おうちの名前を入力してください"); return; }
    if (!parentName.trim()) { setError("あなたの名前を入力してください"); return; }
    setError(""); setLoading(true);

    // 1. Supabase Auth でユーザー登録
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. 家族レコード作成
    const { data: familyData, error: familyError } = await supabase
      .from("otetsudai_families")
      .insert({ name: familyName })
      .select()
      .single();
    if (familyError || !familyData) {
      setError("家族の登録に失敗しました");
      setLoading(false);
      return;
    }

    // 3. 親ユーザーレコード作成（auth_id紐付け）
    const { data: parentData, error: parentError } = await supabase
      .from("otetsudai_users")
      .insert({
        family_id: familyData.id,
        role: "parent",
        name: parentName,
        pin: null,
        auth_id: authData.user?.id || null,
      })
      .select()
      .single();
    if (parentError || !parentData) {
      setError("ユーザー登録に失敗しました");
      setLoading(false);
      return;
    }

    // 4. セッション保存
    localStorage.setItem(
      "otetsudai_session",
      JSON.stringify({
        userId: parentData.id,
        familyId: familyData.id,
        role: "parent",
        name: parentName,
        authId: authData.user?.id,
      })
    );

    // 5. 登録情報を一時保存（完了画面で表示用）
    sessionStorage.setItem("signup_info", JSON.stringify({ familyName }));

    // 6. 子供登録へ
    router.push("/signup/children");
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-xl border-amber-200">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">⚔️</div>
          <CardTitle className="text-2xl font-bold text-emerald-800">
            おこづかいクエストをはじめよう
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            ステップ {step}/2
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">パスワード</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8文字以上"
                    className="pr-12"
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
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <Button
                className="w-full h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleStep1}
              >
                つぎへ →
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="familyName">おうちの名前</Label>
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="例: やまだ家"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="parentName">あなたの名前（保護者）</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="例: 山田 太郎"
                  className="mt-1"
                />
              </div>
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setStep(1); setError(""); }}>
                  ← もどる
                </Button>
                <Button
                  className="flex-1 h-12 text-lg bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? "登録中..." : "登録する"}
                </Button>
              </div>
            </>
          )}

          <div className="text-center pt-2 space-y-2">
            <Link href="/login" className="text-sm text-amber-600 hover:underline block">
              すでにアカウントをお持ちのかた →
            </Link>
            <Link href="/login?mode=admin" className="text-xs text-slate-400 hover:text-slate-600 transition-colors block">
              🔧 管理者ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
