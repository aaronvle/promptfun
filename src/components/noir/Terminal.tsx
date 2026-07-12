"use client";

export default function Terminal({
  phase,
  prompt,
  onPromptChange,
  onSubmit,
  runPrompt,
  pending,
  notice,
  onReset,
}: {
  phase: "closed" | "open" | "running" | "done";
  prompt: string;
  onPromptChange: (v: string) => void;
  onSubmit: () => void;
  runPrompt: string;
  pending: number;
  notice: string | null;
  onReset: () => void;
}) {
  const isRun = phase === "running" || phase === "done";

  return (
    <div className="flex min-h-[190px] flex-1 flex-col justify-center gap-3 rounded-xl border-2 border-noir-border-strong bg-noir-bg px-[22px] py-5 motion-safe:animate-[pf-flicker_8s_infinite]">
      {!isRun ? (
        <>
          <div className="font-mono-space text-[11px] tracking-[1px] text-noir-muted">
            {notice ??
              (phase === "open"
                ? "it's live right now. one person gets this."
                : "input locked · opens at a random moment, once every ~12 hours")}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-space text-[22px] font-bold text-noir-red">
              &gt;
            </span>
            <input
              type="text"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
              disabled={phase !== "open"}
              placeholder={
                phase === "open"
                  ? "go. first prompt sent wins the run."
                  : "when the window opens, whoever types here first gets the run..."
              }
              className="min-w-0 flex-1 border-none bg-transparent font-mono-space text-[19px] text-noir-text caret-noir-red outline-none placeholder:text-noir-text/35 disabled:cursor-not-allowed"
            />
            <span className="font-mono-space text-[19px] text-noir-red motion-safe:animate-[pf-cursor_1s_steps(1)_infinite]">
              █
            </span>
          </div>
          <div className="h-px bg-noir-border" />
          <div className="font-mono-space text-[10px] text-noir-faint">
            first prompt sent claims the run · everyone else watches
          </div>
        </>
      ) : (
        <>
          {notice && (
            <div className="font-mono-space text-[11px] tracking-[1px] text-noir-muted">
              {notice}
            </div>
          )}
          <div className="font-mono-space text-[13px] text-noir-text">
            &gt; &ldquo;{runPrompt}&rdquo;
          </div>
          <div className="font-mono-space text-[10px] text-noir-faint">
            responses land below as each model finishes ▾
          </div>
          {phase === "running" && (
            <div className="font-mono-space text-[10px] text-noir-muted">
              {pending} still typing
              <span className="motion-safe:animate-[pf-cursor_1s_steps(1)_infinite]">
                _
              </span>
            </div>
          )}
          {phase === "done" && (
            <button
              type="button"
              onClick={onReset}
              className="self-start cursor-pointer font-mono-space text-[11px] text-noir-red underline"
            >
              wait for the next window ▸
            </button>
          )}
        </>
      )}
    </div>
  );
}
