import { supabase } from "@/lib/supabase";
import type { Task, TaskLog, User } from "@/lib/types";

export async function getTasks(familyId: string): Promise<Task[]> {
  const { data } = await supabase
    .from("otetsudai_tasks")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getActiveTasks(familyId: string, childId: string): Promise<Task[]> {
  const { data } = await supabase
    .from("otetsudai_tasks")
    .select("*")
    .eq("family_id", familyId)
    .eq("is_active", true)
    .or(`assigned_child_id.is.null,assigned_child_id.eq.${childId}`);
  return data || [];
}

export async function createTask(familyId: string, task: Omit<Task, "id" | "family_id" | "is_active" | "created_at">) {
  return supabase.from("otetsudai_tasks").insert({ family_id: familyId, ...task });
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  return supabase.from("otetsudai_tasks").update(updates).eq("id", taskId);
}

export async function deleteTask(taskId: string) {
  return supabase.from("otetsudai_tasks").delete().eq("id", taskId);
}

export async function toggleTaskActive(taskId: string, isActive: boolean) {
  return supabase.from("otetsudai_tasks").update({ is_active: !isActive }).eq("id", taskId);
}

export async function completeTask(taskId: string, childId: string) {
  return supabase.from("otetsudai_task_logs").insert({
    task_id: taskId,
    child_id: childId,
    status: "pending",
  });
}

export async function getPendingLogs(familyId: string) {
  const { data } = await supabase
    .from("otetsudai_task_logs")
    .select("*, task:otetsudai_tasks(*), child:child_id(id, name, role)")
    .eq("status", "pending")
    .order("completed_at", { ascending: false });
  return (data as (TaskLog & { task: Task; child: User })[]) || [];
}

export async function getApprovedLogs() {
  const { data } = await supabase
    .from("otetsudai_task_logs")
    .select("*, task:otetsudai_tasks(*)")
    .eq("status", "approved");
  return data || [];
}

export async function approveLog(logId: string, approvedBy: string) {
  return supabase
    .from("otetsudai_task_logs")
    .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: approvedBy })
    .eq("id", logId);
}

export async function rejectLog(logId: string) {
  return supabase.from("otetsudai_task_logs").update({ status: "rejected" }).eq("id", logId);
}
