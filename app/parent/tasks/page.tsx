"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import type { Task, User } from "@/lib/types";
import { getTaskIcon } from "@/lib/task-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const RECURRENCE_LABELS: Record<string, string> = {
  once: "1回",
  daily: "毎日",
  weekly: "毎週",
};

export default function TaskManagement() {
  const router = useRouter();
  const session = getSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [children, setChildren] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    reward_amount: 100,
    recurrence: "once" as "once" | "daily" | "weekly",
    assigned_child_id: "",
  });

  const loadData = useCallback(async () => {
    if (!session) return;
    const [taskRes, childRes] = await Promise.all([
      supabase
        .from("otetsudai_tasks")
        .select("*")
        .eq("family_id", session.familyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("otetsudai_users")
        .select("*")
        .eq("family_id", session.familyId)
        .eq("role", "child"),
    ]);
    setTasks(taskRes.data || []);
    setChildren(childRes.data || []);
  }, [session?.familyId]);

  useEffect(() => {
    if (!session || session.role !== "parent") {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  function openCreate() {
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      reward_amount: 100,
      recurrence: "once",
      assigned_child_id: "",
    });
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      reward_amount: task.reward_amount,
      recurrence: task.recurrence,
      assigned_child_id: task.assigned_child_id || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!session || !form.title) return;

    const payload = {
      family_id: session.familyId,
      title: form.title,
      description: form.description || null,
      reward_amount: form.reward_amount,
      recurrence: form.recurrence,
      assigned_child_id: form.assigned_child_id || null,
    };

    if (editingTask) {
      await supabase
        .from("otetsudai_tasks")
        .update(payload)
        .eq("id", editingTask.id);
    } else {
      await supabase.from("otetsudai_tasks").insert(payload);
    }

    setDialogOpen(false);
    loadData();
  }

  async function handleToggleActive(task: Task) {
    await supabase
      .from("otetsudai_tasks")
      .update({ is_active: !task.is_active })
      .eq("id", task.id);
    loadData();
  }

  async function handleDelete(taskId: string) {
    if (!confirm("このクエストを削除しますか？")) return;
    await supabase.from("otetsudai_tasks").delete().eq("id", taskId);
    loadData();
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/parent">
            <Button variant="ghost" size="sm">
              ← もどる
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-emerald-800">⚔️ クエスト管理</h1>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={openCreate}
        >
          ＋ あたらしいクエスト
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "クエストを編集" : "あたらしいクエスト"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">クエスト名</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例：お風呂そうじ"
                />
              </div>
              <div>
                <Label htmlFor="description">せつめい（任意）</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="どうやるか書いてね"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reward">ごほうび (¥)</Label>
                  <Input
                    id="reward"
                    type="number"
                    min={0}
                    step={10}
                    value={form.reward_amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reward_amount: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>くりかえし</Label>
                  <Select
                    value={form.recurrence}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        recurrence: v as "once" | "daily" | "weekly",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">1回</SelectItem>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>だれのクエスト？</Label>
                <Select
                  value={form.assigned_child_id}
                  onValueChange={(v) =>
                    setForm({ ...form, assigned_child_id: v ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="みんな" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">みんな</SelectItem>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleSave}
                disabled={!form.title}
              >
                {editingTask ? "更新する" : "作成する"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="border-amber-200">
            <CardContent className="p-8 text-center text-muted-foreground">
              まだクエストがありません。「＋ あたらしいクエスト」から作成しましょう！
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => {
            const assignedChild = children.find(
              (c) => c.id === task.assigned_child_id
            );
            return (
              <Card
                key={task.id}
                className={`border-amber-200 ${!task.is_active ? "opacity-50" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getTaskIcon(task.title)}</span>
                        <span className="font-semibold text-lg">
                          {task.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {RECURRENCE_LABELS[task.recurrence]}
                        </Badge>
                        {!task.is_active && (
                          <Badge variant="outline" className="text-xs">
                            停止中
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-amber-600 font-semibold">
                          ¥{task.reward_amount.toLocaleString()}
                        </span>
                        {assignedChild && (
                          <span className="text-muted-foreground">
                            🧒 {assignedChild.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(task)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(task)}
                      >
                        {task.is_active ? "⏸" : "▶️"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDelete(task.id)}
                      >
                        🗑
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
