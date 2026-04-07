export type Session = {
  userId: string;
  familyId: string;
  role: "parent" | "child";
  name: string;
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

export function clearSession() {
  localStorage.removeItem("otetsudai_session");
}
