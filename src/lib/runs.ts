import type { SupabaseClient } from "@supabase/supabase-js";

export interface RunResponse {
  model: string;
  output: string | null;
  error: string | null;
  latency_ms: number | null;
}

export interface LatestRun {
  id: string;
  prompt: string;
  created_at: string;
  submitter_handle: string | null;
  wants_credit: boolean;
  responses: RunResponse[];
}

// Most recent run with whatever responses have landed so far. Used by
// the homepage (last-run panel) and polled by the terminal while a run
// is live so responses stream in incrementally.
export async function getLatestRun(
  db: SupabaseClient
): Promise<LatestRun | null> {
  const { data, error } = await db
    .from("runs")
    .select(
      "id, prompt, created_at, submitter_handle, wants_credit, responses(model, output, error, latency_ms)"
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`runs query failed: ${error.message}`);
  return data;
}
