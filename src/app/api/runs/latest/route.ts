import { supabaseAdmin } from "@/lib/supabase";
import { getLatestRun } from "@/lib/runs";
import { MODELS } from "@/lib/models";

// Polled by the homepage terminal while a run is in flight: responses
// appear here row by row as each model finishes, because the submit
// fan-out inserts them individually. All of this is public data.
export async function GET() {
  try {
    const run = await getLatestRun(supabaseAdmin());
    return Response.json(
      { run, total: MODELS.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ run: null, total: MODELS.length }, { status: 500 });
  }
}
