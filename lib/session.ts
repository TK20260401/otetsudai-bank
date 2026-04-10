export type Session = {
  userId: string;
  familyId: string | null;
  role: "admin" | "parent" | "child";
  name: string;
  authId?: string; // Supabase Auth UID（親・adminのみ）
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("otetsudai_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  localStorage.setItem("otetsudai_session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("otetsudai_session");
}
