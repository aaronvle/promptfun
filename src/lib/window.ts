import type { SupabaseClient } from "@supabase/supabase-js";

export interface OpenWindow {
  id: string;
  opens_at: string;
}

// An unclaimed window expires this long after it opens. Without an
// expiry, every unclaimed window (missed nights, test inserts) stayed
// open forever and the site could be open right after a claimed run.
const WINDOW_LIFETIME_MS = 12 * 60 * 60 * 1000;

// The window is open when its opens_at has passed, nobody has claimed
// it, and it hasn't expired. Newest qualifying window wins.
export async function getOpenWindow(
  db: SupabaseClient
): Promise<OpenWindow | null> {
  const now = Date.now();
  const { data, error } = await db
    .from("windows")
    .select("id, opens_at")
    .lte("opens_at", new Date(now).toISOString())
    .gt("opens_at", new Date(now - WINDOW_LIFETIME_MS).toISOString())
    .is("claimed_run_id", null)
    .order("opens_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`windows query failed: ${error.message}`);
  return data?.[0] ?? null;
}
