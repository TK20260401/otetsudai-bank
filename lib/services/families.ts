import { supabase } from "@/lib/supabase";
import type { Family, User } from "@/lib/types";

export async function getFamilies(): Promise<Family[]> {
  const { data } = await supabase.from("otetsudai_families").select("*");
  return data || [];
}

export async function createFamily(name: string): Promise<Family | null> {
  const { data } = await supabase.from("otetsudai_families").insert({ name }).select().single();
  if (data) {
    // 家族設定の初期行を作成（特別クエスト有効化）
    await supabase.from("otetsudai_family_settings").insert({
      family_id: data.id,
      special_quest_enabled: true,
      special_quest_star1_enabled: true,
      special_quest_star2_enabled: true,
      special_quest_star3_enabled: true,
    });
  }
  return data;
}

export async function getFamilyMembers(familyId: string): Promise<User[]> {
  const { data } = await supabase.from("otetsudai_users").select("*").eq("family_id", familyId);
  return data || [];
}

export async function getChildren(familyId: string): Promise<User[]> {
  const { data } = await supabase
    .from("otetsudai_users")
    .select("*")
    .eq("family_id", familyId)
    .eq("role", "child");
  return data || [];
}

export async function createUser(familyId: string, role: "parent" | "child", name: string, authId?: string) {
  return supabase
    .from("otetsudai_users")
    .insert({ family_id: familyId, role, name, pin: null, auth_id: authId || null })
    .select()
    .single();
}

export async function createChildWithWallet(familyId: string, name: string, pin?: string) {
  const { data: childData, error } = await supabase
    .from("otetsudai_users")
    .insert({ family_id: familyId, role: "child", name, pin: pin || null })
    .select()
    .single();

  if (error || !childData) return { data: null, error };

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

  return { data: childData, error: null };
}
