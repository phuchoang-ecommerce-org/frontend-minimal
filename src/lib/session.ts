import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";
import { cookies } from "next/headers";
import { config } from "./config";
import type { Account } from "./types";

const NAME = "market_session";
type Session = { token: string; account: Account; expiresAt: number };
function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("SESSION_SECRET must be at least 32 characters");
  return createHash("sha256").update(secret).digest();
}
export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(NAME)?.value;
  if (!raw) return null;
  try {
    const data = Buffer.from(raw, "base64url");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key(),
      data.subarray(0, 12),
    );
    decipher.setAuthTag(data.subarray(12, 28));
    const value = JSON.parse(
      Buffer.concat([
        decipher.update(data.subarray(28)),
        decipher.final(),
      ]).toString(),
    ) as Session;
    return value.expiresAt > Date.now() ? value : null;
  } catch {
    return null;
  }
}
export async function setSession(
  token: string,
  account: Account,
  seconds: number,
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const expiresAt = Date.now() + seconds * 1000;
  const payload = Buffer.concat([
    cipher.update(JSON.stringify({ token, account, expiresAt })),
    cipher.final(),
  ]);
  const value = Buffer.concat([iv, cipher.getAuthTag(), payload]).toString(
    "base64url",
  );
  (await cookies()).set(NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: config().profile === "prod",
    path: "/",
    maxAge: seconds,
  });
}
export async function clearSession() {
  (await cookies()).delete(NAME);
}
