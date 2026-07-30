import { supabaseAdmin } from "@/lib/supabase";
import { getOpenWindow } from "@/lib/window";
import { MODELS, PROMPT_MAX_LENGTH } from "@/lib/models";
import { askModel } from "@/lib/openrouter";
import { allowSubmit, clientIpHash } from "@/lib/rateLimit";
import type { SupabaseClient } from "@supabase/supabase-js";

// Fan-out can take a while on slow models; give the function room.
export const maxDuration = 60;

interface SubmitBody {
  prompt?: string;
  handle?: string;
  wantsCredit?: boolean;
}

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  // Strip control characters (keep \n and \t), then validate length.
  const prompt = (body.prompt ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (prompt.length < 2 || prompt.length > PROMPT_MAX_LENGTH) {
    return Response.json(
      { error: `prompt must be 2-${PROMPT_MAX_LENGTH} characters` },
      { status: 400 }
    );
  }

  // Only accept plausible X handles; anything else drops the credit.
  const rawHandle = body.handle?.trim().replace(/^@/, "") ?? "";
  const handle = /^[A-Za-z0-9_]{1,15}$/.test(rawHandle) ? rawHandle : null;

  let db;
  let win;
  try {
    db = supabaseAdmin();

    if (!(await allowSubmit(db, clientIpHash(request)))) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }

    win = await getOpenWindow(db);
  } catch {
    return Response.json({ error: "unavailable" }, { status: 500 });
  }
  if (!win) {
    return Response.json({ error: "closed" }, { status: 409 });
  }

  // Record the run first, then atomically claim the window for it. The
  // conditional update on claimed_run_id IS NULL is what makes this
  // first-come-first-served: exactly one submission can flip it.
  const { data: run, error: runError } = await db
    .from("runs")
    .insert({
      window_id: win.id,
      prompt,
      submitter_handle: handle,
      wants_credit: Boolean(body.wantsCredit && handle),
    })
    .select("id")
    .single();
  if (runError || !run) {
    return Response.json({ error: "could not record run" }, { status: 500 });
  }

  const { data: claimed, error: claimError } = await db
    .from("windows")
    .update({ claimed_run_id: run.id })
    .eq("id", win.id)
    .is("claimed_run_id", null)
    .select("id");

  if (claimError || !claimed || claimed.length === 0) {
    // Someone else won the race between our read and update.
    await db.from("runs").delete().eq("id", run.id);
    return Response.json({ error: "beaten" }, { status: 409 });
  }

  await fanOut(db, run.id, prompt);

  return Response.json({ runId: run.id });
}

// Ask every model in the lineup at once; store each answer (or error) as
// its own responses row so partial results still make it to the archive.
async function fanOut(db: SupabaseClient, runId: string, prompt: string) {
  await Promise.allSettled(
    MODELS.map(async ({ slug }) => {
      const result = await askModel(slug, prompt);
      await db.from("responses").insert({
        run_id: runId,
        model: result.model,
        output: result.output,
        error: result.error,
        latency_ms: result.latency_ms,
      });
    })
  );
}
