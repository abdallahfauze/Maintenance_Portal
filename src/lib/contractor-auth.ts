// Contractor portal auth for the Stage 0 MVP: each contractor company logs
// in with their phone number + an admin-generated password (shared by phone
// call, no self-serve signup/reset flow — same simplicity tradeoff as the
// admin shared-secret auth, see README "Security notes").
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const CONTRACTOR_SESSION_COOKIE = "contractor_session";

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/** Generates a short, easy-to-read-over-the-phone password, e.g. "7F3K-9QRT". */
export function generateReadablePassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  const part = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${part()}-${part()}`;
}

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

export async function createContractorSessionToken(contractorId: string): Promise<string> {
  const signature = await hmac(`contractor:${contractorId}`);
  return `${contractorId}.${signature}`;
}

/** Returns the contractor ID the token proves, or null if invalid/tampered. */
export async function getSessionContractorId(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;
  const contractorId = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expected = await hmac(`contractor:${contractorId}`);
  if (signature.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0 ? contractorId : null;
}
