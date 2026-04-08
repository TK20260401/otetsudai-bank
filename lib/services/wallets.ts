import { supabase } from "@/lib/supabase";
import type { Wallet, Transaction, SpendRequest, SavingGoal, Badge } from "@/lib/types";

export async function getWallets(): Promise<Record<string, Wallet>> {
  const { data } = await supabase.from("otetsudai_wallets").select("*");
  const map: Record<string, Wallet> = {};
  (data || []).forEach((w: Wallet) => { map[w.child_id] = w; });
  return map;
}

export async function getWallet(childId: string): Promise<Wallet | null> {
  const { data } = await supabase
    .from("otetsudai_wallets")
    .select("*")
    .eq("child_id", childId)
    .single();
  return data;
}

export async function updateSplitRatio(walletId: string, splitRatio: number) {
  return supabase.from("otetsudai_wallets").update({ split_ratio: splitRatio }).eq("id", walletId);
}

export async function updateWalletBalance(walletId: string, spending: number, saving: number) {
  return supabase
    .from("otetsudai_wallets")
    .update({ spending_balance: spending, saving_balance: saving })
    .eq("id", walletId);
}

export async function createTransaction(walletId: string, type: "earn" | "spend" | "save", amount: number, description: string, taskLogId?: string) {
  return supabase.from("otetsudai_transactions").insert({
    wallet_id: walletId,
    type,
    amount,
    description,
    task_log_id: taskLogId || null,
  });
}

export async function getTransactions(limit: number = 20): Promise<Transaction[]> {
  const { data } = await supabase
    .from("otetsudai_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

// 支出関連
export async function getPendingSpendRequests() {
  const { data } = await supabase
    .from("otetsudai_spend_requests")
    .select("*, child:child_id(id, name, role)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getRejectedSpendRequests(childId: string, limit: number = 5): Promise<SpendRequest[]> {
  const { data } = await supabase
    .from("otetsudai_spend_requests")
    .select("*")
    .eq("child_id", childId)
    .eq("status", "rejected")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as SpendRequest[]) || [];
}

// 貯金目標
export async function getSavingGoals(childId: string): Promise<SavingGoal[]> {
  const { data } = await supabase
    .from("otetsudai_saving_goals")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });
  return (data as SavingGoal[]) || [];
}

// バッジ
export async function getBadges(childId: string): Promise<Badge[]> {
  const { data } = await supabase
    .from("otetsudai_badges")
    .select("*")
    .eq("child_id", childId);
  return (data as Badge[]) || [];
}
