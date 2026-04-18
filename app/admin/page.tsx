"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession, clearSession } from "@/lib/session";
import type { Family, StockPrice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Stats = {
  totalFamilies: number;
  totalParents: number;
  totalChildren: number;
  activeTasks: number;
  approvedToday: number;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  target_role: "all" | "parent" | "child";
  is_active: boolean;
  priority: "normal" | "important" | "urgent";
  created_at: string;
  expires_at: string | null;
};

const TARGET_LABELS: Record<string, { label: string; color: string }> = {
  all: { label: "全員", color: "bg-muted text-muted-foreground" },
  parent: { label: "親のみ", color: "bg-[#1a2a3e] text-[#5dade2]" },
  child: { label: "子のみ", color: "bg-[#1a3e2a] text-[#58d68d]" },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  normal: { label: "通常", color: "bg-muted text-muted-foreground" },
  important: { label: "重要", color: "bg-[#3d2663] text-[#ffd700]" },
  urgent: { label: "緊急", color: "bg-[#3e1a2a] text-[#ff6b6b]" },
};

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sessionUserId, setSessionUserId] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalFamilies: 0, totalParents: 0, totalChildren: 0, activeTasks: 0, approvedToday: 0,
  });
  const [families, setFamilies] = useState<(Family & { memberCount: number })[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Family | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // 家族追加
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [addingFamily, setAddingFamily] = useState(false);

  // お知らせ管理
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "", body: "", target_role: "all", priority: "normal", expires_at: "",
  });
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [deleteAnnouncementTarget, setDeleteAnnouncementTarget] = useState<Announcement | null>(null);

  // 株価マスタ管理
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockForm, setStockForm] = useState({
    symbol: "", name: "", name_ja: "", category: "jp_stock" as string, icon: "", description_kids: "", currency: "JPY" as string,
  });
  const [stockSaving, setStockSaving] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; status: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ updated: string[]; failed: string[] } | null>(null);
  const [deleteStockTarget, setDeleteStockTarget] = useState<StockPrice | null>(null);

  // メンテナンスモード
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceEnd, setMaintenanceEnd] = useState("");
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.replace("/login");
      return;
    }
    setSessionUserId(session.userId);
    setAuthorized(true);
    loadData();
    loadAnnouncements();
    loadMaintenance();
    loadStocks();
  }, [router]);

  async function loadData() {
    const [familiesRes, usersRes, tasksRes, logsRes] = await Promise.all([
      supabase.from("otetsudai_families").select("*"),
      supabase.from("otetsudai_users").select("*").in("role", ["parent", "child"]),
      supabase.from("otetsudai_tasks").select("id").eq("is_active", true),
      supabase.from("otetsudai_task_logs").select("id").eq("status", "approved")
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
    setFamilies(allFamilies.map((f) => ({
      ...f,
      memberCount: allUsers.filter((u) => u.family_id === f.id).length,
    })));
  }

  async function loadAnnouncements() {
    const { data } = await supabase
      .from("otetsudai_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
  }

  async function loadStocks() {
    const { data } = await supabase
      .from("otetsudai_stock_prices")
      .select("*")
      .order("category")
      .order("symbol");
    setStocks(data || []);
  }

  async function handleAddStock() {
    setStockSaving(true);
    await supabase.from("otetsudai_stock_prices").insert({
      symbol: stockForm.symbol,
      name: stockForm.name,
      name_ja: stockForm.name_ja || null,
      category: stockForm.category,
      icon: stockForm.icon || "📊",
      description_kids: stockForm.description_kids || "",
      currency: stockForm.currency,
      price: 0,
      price_jpy: 0,
      change_percent: 0,
      is_preset: true,
    });
    setShowStockForm(false);
    setStockSaving(false);
    setStockForm({ symbol: "", name: "", name_ja: "", category: "jp_stock", icon: "", description_kids: "", currency: "JPY" });
    loadStocks();
  }

  async function handleDeleteStock() {
    if (!deleteStockTarget) return;
    await supabase.from("otetsudai_stock_prices").delete().eq("id", deleteStockTarget.id);
    setDeleteStockTarget(null);
    loadStocks();
  }

  async function handleSyncAll() {
    const symbols = stocks.map((s) => s.symbol);
    setSyncProgress({ current: 0, total: symbols.length, status: "開始..." });
    setSyncResult(null);
    const allUpdated: string[] = [];
    const allFailed: string[] = [];

    for (let i = 0; i < symbols.length; i++) {
      setSyncProgress({ current: i, total: symbols.length, status: `${symbols[i]} を取得中...` });
      try {
        const res = await fetch("/api/stock-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: [symbols[i]] }),
        });
        const data = await res.json();
        allUpdated.push(...(data.updated || []));
        allFailed.push(...(data.failed || []));
        // レート制限で中断された場合
        if (data.failed?.length > 0 && data.updated?.length === 0) {
          for (let j = i + 1; j < symbols.length; j++) allFailed.push(symbols[j]);
          break;
        }
      } catch {
        allFailed.push(symbols[i]);
      }
      // 13秒待機（最後の銘柄以外）
      if (i < symbols.length - 1) {
        setSyncProgress({ current: i + 1, total: symbols.length, status: "レート制限待機中（13秒）..." });
        await new Promise((r) => setTimeout(r, 13000));
      }
    }

    setSyncProgress(null);
    setSyncResult({ updated: allUpdated, failed: allFailed });
    loadStocks();
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "たった今";
    if (min < 60) return `${min}分前`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}時間前`;
    return `${Math.floor(hr / 24)}日前`;
  }

  async function loadMaintenance() {
    const res = await fetch("/api/settings?key=maintenance_mode");
    const data = await res.json();
    if (data?.value) {
      setMaintenanceEnabled(data.value.enabled || false);
      setMaintenanceMessage(data.value.message || "");
      setMaintenanceEnd(data.value.scheduled_end ? data.value.scheduled_end.slice(0, 16) : "");
    }
  }

  async function saveMaintenance(enabled: boolean) {
    setMaintenanceSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "maintenance_mode",
        value: {
          enabled,
          message: maintenanceMessage,
          scheduled_end: maintenanceEnd || null,
        },
        _sessionUserId: sessionUserId,
      }),
    });
    setMaintenanceEnabled(enabled);
    setMaintenanceSaving(false);
    setShowMaintenanceConfirm(false);
  }

  async function handleAddFamily() {
    if (!newFamilyName.trim()) return;
    setAddingFamily(true);
    setError("");
    try {
      // 家族作成
      const { data: familyData } = await supabase
        .from("otetsudai_families")
        .insert({ name: newFamilyName.trim() })
        .select()
        .single();
      if (familyData) {
        // family_settings 初期行作成
        await supabase.from("otetsudai_family_settings").insert({
          family_id: familyData.id,
          special_quest_enabled: true,
          special_quest_star1_enabled: true,
          special_quest_star2_enabled: true,
          special_quest_star3_enabled: true,
        });
      }
      setNewFamilyName("");
      setShowAddFamily(false);
      loadData();
    } catch { setError("家族の追加に失敗しました"); }
    setAddingFamily(false);
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
      if (res.ok) { setDeleteTarget(null); loadData(); }
      else { const d = await res.json(); setError(d.error || "削除に失敗しました"); }
    } catch { setError("削除に失敗しました"); }
    setDeleting(false);
  }

  function handleLogout() {
    clearSession();
    supabase.auth.signOut();
    router.replace("/login");
  }

  // お知らせ CRUD
  function openCreateForm() {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: "", body: "", target_role: "all", priority: "normal", expires_at: "" });
    setShowAnnouncementForm(true);
  }

  function openEditForm(a: Announcement) {
    setEditingAnnouncement(a);
    setAnnouncementForm({
      title: a.title,
      body: a.body,
      target_role: a.target_role,
      priority: a.priority,
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : "",
    });
    setShowAnnouncementForm(true);
  }

  async function handleSaveAnnouncement() {
    setAnnouncementSaving(true);
    const payload = {
      ...announcementForm,
      expires_at: announcementForm.expires_at || null,
      _sessionUserId: sessionUserId,
    };

    if (editingAnnouncement) {
      await fetch("/api/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingAnnouncement.id, ...payload }),
      });
    } else {
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowAnnouncementForm(false);
    setAnnouncementSaving(false);
    loadAnnouncements();
  }

  async function toggleAnnouncementActive(a: Announcement) {
    await fetch("/api/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, is_active: !a.is_active, _sessionUserId: sessionUserId }),
    });
    loadAnnouncements();
  }

  async function handleDeleteAnnouncement() {
    if (!deleteAnnouncementTarget) return;
    await fetch("/api/announcements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteAnnouncementTarget.id, _sessionUserId: sessionUserId }),
    });
    setDeleteAnnouncementTarget(null);
    loadAnnouncements();
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <h1 className="text-lg font-bold text-foreground">管理者ダッシュボード</h1>
          </div>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFamilies}</div>
              <div className="text-xs text-muted-foreground mt-1">🏠 総家族数</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.totalParents + stats.totalChildren}</div>
              <div className="text-xs text-muted-foreground mt-1">👥 ユーザー（親{stats.totalParents} / 子{stats.totalChildren}）</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.activeTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">⚔️ アクティブクエスト</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-violet-600">{stats.approvedToday}</div>
              <div className="text-xs text-muted-foreground mt-1">✅ 本日の承認数</div>
            </CardContent>
          </Card>
        </div>

        {/* 家族一覧 */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-foreground">🏠 家族一覧</CardTitle>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowAddFamily(true)}>
              ＋ 家族追加
            </Button>
          </CardHeader>
          <CardContent>
            {showAddFamily && (
              <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <Label className="text-sm font-semibold text-emerald-700">新しい家族名</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="例: 田中家"
                    className="flex-1"
                  />
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddFamily} disabled={addingFamily || !newFamilyName.trim()}>
                    {addingFamily ? "追加中..." : "追加"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowAddFamily(false); setNewFamilyName(""); }}>
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">家族名</th>
                    <th className="pb-2 font-medium text-center">メンバー</th>
                    <th className="pb-2 font-medium">作成日</th>
                    <th className="pb-2 font-medium text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {families.map((f) => (
                    <tr key={f.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium text-foreground">{f.name}</td>
                      <td className="py-3 text-center text-muted-foreground">{f.memberCount}名</td>
                      <td className="py-3 text-muted-foreground">{new Date(f.created_at).toLocaleDateString("ja-JP")}</td>
                      <td className="py-3 text-center">
                        {f.name !== "山田家" && (
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(f)}>🗑️</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {families.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted-foreground/70">家族データがありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* お知らせ管理 */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-foreground">📢 お知らせ管理</CardTitle>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreateForm}>
              ＋ お知らせ作成
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">タイトル</th>
                    <th className="pb-2 font-medium text-center">対象</th>
                    <th className="pb-2 font-medium text-center">優先度</th>
                    <th className="pb-2 font-medium text-center">状態</th>
                    <th className="pb-2 font-medium">作成日</th>
                    <th className="pb-2 font-medium text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium text-foreground max-w-48 truncate">{a.title}</td>
                      <td className="py-3 text-center">
                        <Badge variant="secondary" className={TARGET_LABELS[a.target_role].color}>
                          {TARGET_LABELS[a.target_role].label}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant="secondary" className={PRIORITY_LABELS[a.priority].color}>
                          {PRIORITY_LABELS[a.priority].label}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          className={`text-xs px-2 py-1 rounded-full font-medium ${a.is_active ? "bg-[#1a3e2a] text-[#58d68d]" : "bg-muted text-muted-foreground"}`}
                          onClick={() => toggleAnnouncementActive(a)}
                        >
                          {a.is_active ? "🟢 ON" : "⚪ OFF"}
                        </button>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{new Date(a.created_at).toLocaleDateString("ja-JP")}</td>
                      <td className="py-3 text-center space-x-1">
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700" onClick={() => openEditForm(a)}>✏️</Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => setDeleteAnnouncementTarget(a)}>🗑️</Button>
                      </td>
                    </tr>
                  ))}
                  {announcements.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-muted-foreground/70">お知らせはありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* メンテナンスモード */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground flex items-center justify-between">
              <span>🔧 メンテナンスモード</span>
              <span className={`text-sm font-normal ${maintenanceEnabled ? "text-red-600" : "text-green-600"}`}>
                {maintenanceEnabled ? "🔴 メンテナンス中" : "🟢 通常運用"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                className={`relative w-14 h-7 rounded-full transition-colors ${maintenanceEnabled ? "bg-destructive" : "bg-muted"}`}
                onClick={() => {
                  if (!maintenanceEnabled) {
                    setShowMaintenanceConfirm(true);
                  } else {
                    saveMaintenance(false);
                  }
                }}
                disabled={maintenanceSaving}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-foreground rounded-full shadow transition-transform ${maintenanceEnabled ? "translate-x-7" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm text-muted-foreground">
                {maintenanceEnabled ? "ONにすると管理者以外アクセス不可" : "OFFで通常運用"}
              </span>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">ユーザーへのメッセージ</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm min-h-16 resize-y mt-1"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">終了予定時刻（任意）</Label>
              <Input
                type="datetime-local"
                value={maintenanceEnd}
                onChange={(e) => setMaintenanceEnd(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              size="sm"
              className="bg-slate-700 hover:bg-slate-800 text-white"
              onClick={() => saveMaintenance(maintenanceEnabled)}
              disabled={maintenanceSaving}
            >
              {maintenanceSaving ? "保存中..." : "💾 メッセージ保存"}
            </Button>
          </CardContent>
        </Card>

        {/* 株価マスタ管理 */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-foreground">📈 株価マスタ管理</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-border" onClick={() => setShowStockForm(true)}>＋ 銘柄追加</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSyncAll} disabled={!!syncProgress || stocks.length === 0}>
                🔄 全銘柄更新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 同期プログレス */}
            {syncProgress && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between text-xs text-blue-700 mb-1">
                  <span>{syncProgress.status}</span>
                  <span>{syncProgress.current}/{syncProgress.total}</span>
                </div>
                <Progress value={(syncProgress.current / syncProgress.total) * 100} className="h-2" />
              </div>
            )}
            {syncResult && (
              <div className={`mb-3 p-3 rounded-lg border text-sm ${syncResult.failed.length > 0 ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-green-50 border-green-200 text-green-800"}`}>
                {syncResult.failed.length > 0
                  ? `⚠️ ${syncResult.updated.length}銘柄更新完了、${syncResult.failed.length}銘柄失敗: ${syncResult.failed.join(", ")}`
                  : `✅ ${syncResult.updated.length}銘柄更新完了`}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium"></th>
                    <th className="pb-2 font-medium">シンボル</th>
                    <th className="pb-2 font-medium">名前</th>
                    <th className="pb-2 font-medium text-center">分類</th>
                    <th className="pb-2 font-medium text-right">価格</th>
                    <th className="pb-2 font-medium text-right">円換算</th>
                    <th className="pb-2 font-medium text-right">変動</th>
                    <th className="pb-2 font-medium">更新</th>
                    <th className="pb-2 font-medium text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2">{s.icon}</td>
                      <td className="py-2 font-mono text-xs text-muted-foreground">{s.symbol}</td>
                      <td className="py-2 text-foreground">{s.name_ja || s.name}</td>
                      <td className="py-2 text-center">
                        <Badge variant="secondary" className={
                          s.category === "index" ? "bg-purple-100 text-purple-700" :
                          s.category === "jp_stock" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }>
                          {s.category === "index" ? "指数" : s.category === "jp_stock" ? "日本株" : "米国株"}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        {s.currency === "USD" ? `$${s.price.toFixed(2)}` : `¥${s.price.toLocaleString()}`}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">¥{s.price_jpy.toLocaleString()}</td>
                      <td className={`py-2 text-right text-xs font-medium ${s.change_percent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {s.change_percent >= 0 ? "▲" : "▼"}{Math.abs(s.change_percent).toFixed(2)}%
                      </td>
                      <td className="py-2 text-xs text-muted-foreground/70">{timeAgo(s.updated_at)}</td>
                      <td className="py-2 text-center">
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => setDeleteStockTarget(s)}>🗑️</Button>
                      </td>
                    </tr>
                  ))}
                  {stocks.length === 0 && (
                    <tr><td colSpan={9} className="py-6 text-center text-muted-foreground/70">銘柄が登録されていません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* お知らせ作成/編集ダイアログ */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg border-border bg-card shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-blue-700">
                {editingAnnouncement ? "📢 お知らせ編集" : "📢 お知らせ作成"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">タイトル</Label>
                <Input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="お知らせタイトル" />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">本文</Label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-24 resize-y"
                  value={announcementForm.body}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
                  placeholder="お知らせ本文（改行可）"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground">対象</Label>
                  <select className="w-full border rounded-md p-2 text-sm" value={announcementForm.target_role} onChange={(e) => setAnnouncementForm({ ...announcementForm, target_role: e.target.value })}>
                    <option value="all">全員</option>
                    <option value="parent">親のみ</option>
                    <option value="child">子のみ</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">優先度</Label>
                  <select className="w-full border rounded-md p-2 text-sm" value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}>
                    <option value="normal">通常</option>
                    <option value="important">重要</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">有効期限（任意）</Label>
                <Input type="datetime-local" value={announcementForm.expires_at} onChange={(e) => setAnnouncementForm({ ...announcementForm, expires_at: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowAnnouncementForm(false)} disabled={announcementSaving}>やめる</Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveAnnouncement} disabled={announcementSaving || !announcementForm.title || !announcementForm.body}>
                  {announcementSaving ? "保存中..." : editingAnnouncement ? "更新" : "作成"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* お知らせ削除確認 */}
      {deleteAnnouncementTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-destructive/60 bg-card shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700">🗑️ お知らせ削除</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-800">「{deleteAnnouncementTarget.title}」を削除しますか？</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDeleteAnnouncementTarget(null)}>やめる</Button>
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteAnnouncement}>🗑️ 削除する</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 銘柄追加ダイアログ */}
      {showStockForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg border-border bg-card shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-blue-700">📈 銘柄追加</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground">シンボル</Label>
                  <Input value={stockForm.symbol} onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value })} placeholder="例: 7203.T, AAPL" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">英語名</Label>
                  <Input value={stockForm.name} onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })} placeholder="Toyota Motor" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground">日本語名</Label>
                  <Input value={stockForm.name_ja} onChange={(e) => setStockForm({ ...stockForm, name_ja: e.target.value })} placeholder="トヨタ自動車" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">アイコン（絵文字）</Label>
                  <Input value={stockForm.icon} onChange={(e) => setStockForm({ ...stockForm, icon: e.target.value })} placeholder="🚗" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground">カテゴリ</Label>
                  <select className="w-full border rounded-md p-2 text-sm" value={stockForm.category} onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}>
                    <option value="index">指数（ETF）</option>
                    <option value="jp_stock">日本株</option>
                    <option value="us_stock">米国株</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">通貨</Label>
                  <select className="w-full border rounded-md p-2 text-sm" value={stockForm.currency} onChange={(e) => setStockForm({ ...stockForm, currency: e.target.value })}>
                    <option value="JPY">JPY（円）</option>
                    <option value="USD">USD（ドル）</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">子供向け説明</Label>
                <textarea className="w-full border rounded-md p-2 text-sm min-h-16 resize-y" value={stockForm.description_kids} onChange={(e) => setStockForm({ ...stockForm, description_kids: e.target.value })} placeholder="子供にわかりやすい説明" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowStockForm(false)}>やめる</Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddStock} disabled={stockSaving || !stockForm.symbol || !stockForm.name}>
                  {stockSaving ? "追加中..." : "追加"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 銘柄削除確認 */}
      {deleteStockTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-destructive/60 bg-card shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700">🗑️ 銘柄削除</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-800">「{deleteStockTarget.name_ja || deleteStockTarget.name}（{deleteStockTarget.symbol}）」を削除しますか？</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDeleteStockTarget(null)}>やめる</Button>
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteStock}>🗑️ 削除する</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* メンテナンスON確認 */}
      {showMaintenanceConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-destructive/60 bg-card shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700">🔧 メンテナンスモードON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-800">
                メンテナンスモードをONにすると、管理者以外の全ユーザーがアプリを利用できなくなります。よろしいですか？
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowMaintenanceConfirm(false)}>やめる</Button>
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => saveMaintenance(true)} disabled={maintenanceSaving}>
                  {maintenanceSaving ? "処理中..." : "ONにする"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 家族削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border-destructive/60 bg-card shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700 flex items-center gap-2">🗑️ 家族データの削除</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-red-800">「{deleteTarget.name}」のデータをすべて削除しますか？</p>
              <p className="text-xs text-red-500">この操作は取り消せません。家族に紐づくすべてのデータが完全に削除されます。</p>
              {error && <p className="text-destructive text-xs text-center">{error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { setDeleteTarget(null); setError(""); }} disabled={deleting}>やめる</Button>
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteFamily} disabled={deleting}>
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
