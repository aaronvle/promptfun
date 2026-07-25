import { supabaseAdmin } from "@/lib/supabase";

// Responses for one run, fetched lazily when a gallery row is
// expanded. Full text: the client collapses long answers visually so
// "show more" can reveal the rest without another request. Public
// data (responses has a public read policy). Static siblings like
// /api/runs/latest take precedence over this dynamic segment.

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
      output: r.output,
    }));

    return Response.json(
      { responses },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ responses: null }, { status: 500 });
  }
}
