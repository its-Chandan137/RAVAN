export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  return { ok: false, error: data?.error || "Invalid password" };
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function checkSession(): Promise<boolean> {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  return !!data?.authenticated;
}