import type { SupabaseClient } from "@supabase/supabase-js";

export interface OpenWindow {
  id: string;
  opens_at: string;
}

// The window is open when its opens_at has passed and nobody has claimed
// it yet. It stays open until someone wins it. If several unclaimed
// windows have elapsed (quiet stretch with no visitors), the newest one
// is the live window.
export async function getOpenWindow(
  db: SupabaseClient
): Promise<OpenWindow | null> {
  const { data, error } = await db
    .from("windows")
    .select("id, opens_at")
    .lte("opens_at", new Date().toISOString())
    .is("claimed_run_id", null)
    .order("opens_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`windows query failed: ${error.message}`);
  return data?.[0] ?? null;
}
