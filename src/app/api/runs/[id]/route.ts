import { supabaseAdmin } from "@/lib/supabase";

// Truncated response previews for one run, fetched lazily when a
// gallery row is expanded. Full text lives on the run page. Public
// data (responses has a public read policy). Static siblings like
// /api/runs/latest take precedence over this dynamic segment.
const PREVIEW_CHARS = 240;

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/runs/[id]">
) {
  const { id } = await ctx.params;
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("responses")
      .select("model, output, error, latency_ms")
      .eq("run_id", id)
      .order("latency_ms", { ascending: true });
    if (error) throw new Error(error.message);

    const responses = (data ?? []).map((r) => ({
      model: r.model,
      latency_ms: r.latency_ms,
      error: r.error ? r.error.slice(0, 140) : null,
      output: r.output
        ? r.output.length > PREVIEW_CHARS
          ? `${r.output.slice(0, PREVIEW_CHARS)}…`
          : r.output
        : null,
    }));

    return Response.json(
      { responses },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ responses: null }, { status: 500 });
  }
}
