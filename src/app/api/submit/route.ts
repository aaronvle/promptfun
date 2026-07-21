import { supabaseAdmin } from "@/lib/supabase";
import { getOpenWindow } from "@/lib/window";
import { MODELS, PROMPT_MAX_LENGTH } from "@/lib/models";
import { askModel } from "@/lib/openrouter";
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

  const prompt = body.prompt?.trim() ?? "";
  if (prompt.length === 0 || prompt.length > PROMPT_MAX_LENGTH) {
    return Response.json(
      { error: `prompt must be 1-${PROMPT_MAX_LENGTH} characters` },
      { status: 400 }
    );
  }
  const handle = body.handle?.trim().replace(/^@/, "").slice(0, 30) || null;

  let db;
  let win;
  try {
    db = supabaseAdmin();
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
        prompt_tokens: result.prompt_tokens,
        completion_tokens: result.completion_tokens,
        cost: result.cost,
      });
    })
  );
}
