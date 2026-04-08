import { supabase } from "@/lib/supabase";
import type { Family, User } from "@/lib/types";
import { setSession, clearSession } from "@/lib/session";

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  await supabase.auth.signOut();
  clearSession();
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  const { data } = await supabase.rpc("verify_pin", { p_user_id: userId, p_pin: pin });
  return !!data;
}

export async function setUserPin(userId: string, pin: string) {
  return supabase.rpc("set_pin_hash", { p_user_id: userId, p_pin: pin });
}

export function loginAsUser(user: User, familyId: string, authId?: string) {
  setSession({
    userId: user.id,
    familyId,
    role: user.role,
    name: user.name,
    authId,
  });
}

export async function deleteAccount(familyId: string, authId?: string) {
  return fetch("/api/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ family_id: familyId, auth_id: authId }),
  });
}
