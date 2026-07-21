// The lineup every prompt fans out to, as OpenRouter model slugs.
// Verify/refresh against https://openrouter.ai/models — slugs change as
// labs ship new versions (last verified 2026-07).
// Display order is intentional: GPT, Claude, Gemini, Grok, DeepSeek,
// Kimi, GLM. Each lab's most advanced generally-available model.
export const MODELS: { slug: string; label: string }[] = [
  { slug: "openai/gpt-5.6-sol", label: "GPT" },
  { slug: "anthropic/claude-opus-4.8", label: "Claude" },
  { slug: "google/gemini-3.1-pro-preview", label: "Gemini" },
  { slug: "x-ai/grok-4.5", label: "Grok" },
  { slug: "deepseek/deepseek-v4-pro", label: "DeepSeek" },
  { slug: "moonshotai/kimi-k2.6", label: "Kimi" },
  { slug: "z-ai/glm-5.2", label: "GLM" },
];

// Retired slugs from earlier lineups: archived runs keep their original
// slug in the responses table, so old runs still get pretty labels.
const LEGACY_LABELS: Record<string, string> = {
  "anthropic/claude-sonnet-4.5": "Claude",
  "openai/gpt-5.1": "GPT",
  "google/gemini-3-pro-preview": "Gemini",
  "deepseek/deepseek-chat-v3.1": "DeepSeek",
  "x-ai/grok-4": "Grok",
  "x-ai/grok-4.20": "Grok",
  "mistralai/mistral-large-2512": "Mistral",
  "meta-llama/llama-4-maverick": "Llama",
  "anthropic/claude-sonnet-5": "Claude",
  "openai/gpt-5.5": "GPT",
};

export function labelFor(slug: string): string {
  return (
    MODELS.find((m) => m.slug === slug)?.label ?? LEGACY_LABELS[slug] ?? slug
  );
}

export const PROMPT_MAX_LENGTH = 2000;
