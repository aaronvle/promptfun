// OpenRouter chat-completions client for the model fan-out.
// https://openrouter.ai/docs

const MODEL_TIMEOUT_MS = 45_000;
// Cost ceiling per model per run. Reasoning models spend "thinking"
// tokens from this same budget, so it must be much larger than the
// visible answer — 1024 left Kimi/GLM/Gemini empty or cut off.
const MAX_OUTPUT_TOKENS = 8192;

export interface ModelResult {
  model: string;
  output: string | null;
  error: string | null;
  latency_ms: number;
}

// Never throws: every failure mode becomes an error string on the
// result so it can be stored and shown alongside successful responses.
export async function askModel(
  slug: string,
  prompt: string
): Promise<ModelResult> {
  const started = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      model: slug,
      output: null,
      error: "OPENROUTER_API_KEY not configured",
      latency_ms: 0,
    };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    // App attribution, shown on openrouter.ai rankings.
    "X-Title": "promptfun",
  };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) headers["HTTP-Referer"] = siteUrl;

  let output: string | null = null;
  let error: string | null = null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: slug,
        messages: [{ role: "user", content: prompt }],
        max_tokens: MAX_OUTPUT_TOKENS,
        // Keep thinking short so the budget goes to the visible answer
        // and slow reasoners stay inside the timeout. OpenRouter drops
        // this for models without reasoning support.
        reasoning: { effort: "low" },
      }),
      signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    if (!res.ok) {
      error = `OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`;
    } else {
      const json = await res.json();
      // OpenRouter can also surface upstream provider failures as an
      // error object on a 200 response.
      if (json.error) {
        error = `${json.error.code ?? ""} ${json.error.message ?? "provider error"}`.trim();
      } else {
        const choice = json.choices?.[0];
        output = choice?.message?.content || null;
        if (!output) {
          // Distinguish "reasoned itself out of budget" from a true
          // empty response so the archive tells us what happened.
          error = choice?.message?.reasoning
            ? "spent the whole token budget reasoning, no answer left"
            : "empty completion";
        } else if (choice?.finish_reason === "length") {
          output += "\n\n*[cut off at the token limit]*";
        }
      }
    }
  } catch (err) {
    error =
      err instanceof Error && err.name === "TimeoutError"
        ? `timed out after ${MODEL_TIMEOUT_MS / 1000}s`
        : err instanceof Error
          ? err.message
          : "request failed";
  }

  return { model: slug, output, error, latency_ms: Date.now() - started };
}
