// The lineup every prompt fans out to, as OpenRouter model slugs.
// Verify/refresh against https://openrouter.ai/models — slugs change as
// labs ship new versions.
export const MODELS: { slug: string; label: string }[] = [
  { slug: "anthropic/claude-sonnet-4.5", label: "Claude" },
  { slug: "openai/gpt-5.1", label: "GPT" },
  { slug: "google/gemini-3-pro-preview", label: "Gemini" },
  { slug: "meta-llama/llama-4-maverick", label: "Llama" },
  { slug: "deepseek/deepseek-chat-v3.1", label: "DeepSeek" },
  { slug: "x-ai/grok-4", label: "Grok" },
  { slug: "mistralai/mistral-large-2512", label: "Mistral" },
];

export const PROMPT_MAX_LENGTH = 2000;
