import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Sliding-window rate limit backed by the submit_attempts table (see
// README for the migration). Serverless instances share no memory, so
// the database is the source of truth. Counts are approximate under
// concurrency, which is fine for abuse control.
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

// Store a salted hash, never the raw IP.
export function clientIpHash(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const salt = process.env.RATE_LIMIT_SALT ?? "promptfun-rl";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

// Returns true when the caller is allowed to proceed. Fails open: if
// the table is missing or the query errors, submissions keep working
// and the guard silently stands down.
export async function allowSubmit(
  db: SupabaseClient,
  ipHash: string
): Promise<boolean> {
  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error } = await db
      .from("submit_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("attempted_at", since);
    if (error) return true;
    if ((count ?? 0) >= MAX_ATTEMPTS_PER_WINDOW) return false;
    await db.from("submit_attempts").insert({ ip_hash: ipHash });
    return true;
  } catch {
    return true;
  }
}
