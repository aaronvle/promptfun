import { supabaseAdmin } from "@/lib/supabase";

// Feeds the homepage gallery panel: newest runs with truncated response
// previews (full text lives on the run page). Public data.
const PREVIEW_CHARS = 240;

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("runs")
      .select(
        "id, prompt, created_at, responses(model, output, error, latency_ms)"
      )
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw new Error(error.message);

    const runs = (data ?? []).map((run) => ({
      ...run,
      responses: run.responses.map((r) => ({
        model: r.model,
        latency_ms: r.latency_ms,
        error: r.error ? r.error.slice(0, 140) : null,
        output: r.output
          ? r.output.length > PREVIEW_CHARS
            ? `${r.output.slice(0, PREVIEW_CHARS)}…`
            : r.output
          : null,
      })),
    }));

    return Response.json(
      { runs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ runs: null }, { status: 500 });
  }
}
