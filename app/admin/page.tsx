"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { Family } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Stats = {
  totalFamilies: number;
  totalParents: number;
  totalChildren: number;
  activeTasks: number;
  approvedToday: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalFamilies: 0,
    totalParents: 0,
    totalChildren: 0,
    activeTasks: 0,
    approvedToday: 0,
  });
  const [families, setFamilies] = useState<(Family & { memberCount: number })[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Family | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
    loadData();
  }, [router]);

  async function loadData() {
    // 統計データ取得
    const [familiesRes, usersRes, tasksRes, logsRes] = await Promise.all([
      supabase.from("otetsudai_families").select("*"),
      supabase.from("otetsudai_users").select("*").in("role", ["parent", "child"]),
      supabase.from("otetsudai_tasks").select("id").eq("is_active", true),
      supabase
        .from("otetsudai_task_logs")
        .select("id")
        .eq("status", "approved")
        .gte("approved_at", new Date().toISOString().split("T")[0]),
    ]);

    const allFamilies = familiesRes.data || [];
    const allUsers = usersRes.data || [];

    setStats({
      totalFamilies: allFamilies.length,
      totalParents: allUsers.filter((u) => u.role === "parent").length,
      totalChildren: allUsers.filter((u) => u.role === "child").length,
      activeTasks: tasksRes.data?.length || 0,
      approvedToday: logsRes.data?.length || 0,
    });

    // 家族一覧にメンバー数を付与
    const familiesWithCount = allFamilies.map((f) => ({
      ...f,
      memberCount: allUsers.filter((u) => u.family_id === f.id).length,
    }));
    setFamilies(familiesWithCount);
  }

  async function handleDeleteFamily() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/family", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_id: deleteTarget.id }),
      });
      if (res.ok) {
        setDeleteTarget(null);
        loadData();
      } else {
        const data = await res.json();
        setError(data.error || "削除に失敗しました");
      }
    } catch {
      setError("削除に失敗しました");
    }
    setDeleting(false);
  }

  function handleLogout() {
    clearSession();
    supabase.auth.signOut();
    router.replace("/login");
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl animate-pulse text-slate-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <h1 className="text-lg font-bold text-slate-700">管理者ダッシュボード</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-500 hover:bg-slate-100"
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-slate-200">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFamilies}</div>
              <div className="text-xs text-slate-500 mt-1">🏠 総家族数</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.totalParents + stats.totalChildren}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                👥 ユーザー（親{stats.totalParents} / 子{stats.totalChildren}）
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.activeTasks}</div>
              <div className="text-xs text-slate-500 mt-1">⚔️ アクティブクエスト</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-violet-600">{stats.approvedToday}</div>
              <div className="text-xs text-slate-500 mt-1">✅ 本日の承認数</div>
            </CardContent>
          </Card>
        </div>

        {/* 家族一覧 */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-700">🏠 家族一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 font-medium">家族名</th>
                    <th className="pb-2 font-medium text-center">メンバー</th>
                    <th className="pb-2 font-medium">作成日</th>
                    <th className="pb-2 font-medium text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {families.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 font-medium text-slate-700">{f.name}</td>
                      <td className="py-3 text-center text-slate-600">{f.memberCount}名</td>
                      <td className="py-3 text-slate-500">
                        {new Date(f.created_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="py-3 text-center">
                        {f.name !== "山田家" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(f)}
                          >
                            🗑️
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {families.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        家族データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 今後の拡張エリア */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border-dashed border-slate-300 bg-slate-50/50">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl mb-1">📢</div>
              <div className="text-sm font-medium text-slate-400">お知らせ配信</div>
              <div className="text-xs text-slate-300 mt-1">Coming Soon</div>
            </CardContent>
          </Card>
          <Card className="border-dashed border-slate-300 bg-slate-50/50">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl mb-1">🔧</div>
              <div className="text-sm font-medium text-slate-400">メンテナンスモード</div>
              <div className="text-xs text-slate-300 mt-1">Coming Soon</div>
            </CardContent>
          </Card>
          <Card className="border-dashed border-slate-300 bg-slate-50/50">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-sm font-medium text-slate-400">株価マスタ管理</div>
              <div className="text-xs text-slate-300 mt-1">Coming Soon</div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-red-300 bg-white shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700 flex items-center gap-2">
                🗑️ 家族データの削除
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-red-800">
                「{deleteTarget.name}」のデータをすべて削除しますか？
              </p>
              <p className="text-xs text-red-500">
                この操作は取り消せません。家族に紐づくすべてのデータが完全に削除されます。
              </p>
              {error && (
                <p className="text-destructive text-xs text-center">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setDeleteTarget(null);
                    setError("");
                  }}
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
                  {deleting ? "削除ちゅう..." : "🗑️ 削除する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
