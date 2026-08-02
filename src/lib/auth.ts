// Minimal shared-secret admin session for the Stage 0 MVP.
// Not a substitute for a real auth provider — see README "Security notes"
// before this ever handles real customer data in production.

export const SESSION_COOKIE = "admin_session";

async function hmac(message: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Buffer.from(signature).toString("hex");
}

export async function createSessionToken(): Promise<string> {
  return hmac("admin-session");
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await hmac("admin-session");
  if (token.length !== expected.length) return false;
  // Constant-time-ish comparison to avoid trivial timing leaks.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
