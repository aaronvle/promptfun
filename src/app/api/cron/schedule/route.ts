import { supabaseAdmin } from "@/lib/supabase";

// Runs daily via Vercel Cron (Hobby plan allows one invocation per day).
// Divides time into fixed 12-hour cycles and guarantees each of the next
// few cycles has one window at a uniformly random moment inside it.
// Idempotent: cycles that already have a window are left alone.

const CYCLE_MS = 12 * 60 * 60 * 1000;
const CYCLES_AHEAD = 3; // cover ~36h so a delayed cron never leaves a gap

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const now = Date.now();
  const created: string[] = [];

  for (let i = 0; i < CYCLES_AHEAD; i++) {
    const cycleStart = Math.floor(now / CYCLE_MS) * CYCLE_MS + i * CYCLE_MS;
    const cycleEnd = cycleStart + CYCLE_MS;

    const { data: existing, error } = await db
      .from("windows")
      .select("id")
      .gte("opens_at", new Date(cycleStart).toISOString())
      .lt("opens_at", new Date(cycleEnd).toISOString())
      .limit(1);
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    if (existing && existing.length > 0) continue;

    // For the current cycle, only schedule in the time that's left.
    const earliest = Math.max(cycleStart, now);
    const opensAt = new Date(
      earliest + Math.random() * (cycleEnd - earliest)
    ).toISOString();

    const { error: insertError } = await db
      .from("windows")
      .insert({ opens_at: opensAt });
    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }
    created.push(opensAt);
  }

  // Don't echo opens_at values anywhere a human might screenshot; count only.
  return Response.json({ scheduled: created.length });
}
