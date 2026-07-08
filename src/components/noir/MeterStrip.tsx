export type MeterState = "idle" | "typing" | "done";

// Deterministic per-meter idle rhythm (1.1–2.1s, staggered) so the
// strip hums out of phase without Math.random in render.
function idleDuration(i: number) {
  return 1.1 + ((i * 37) % 11) / 10;
}

export default function MeterStrip({
  meters,
}: {
  meters: { label: string; state: MeterState }[];
}) {
  return (
    <div className="flex items-center gap-[18px] rounded-[10px] border border-noir-border-faint bg-noir-bg px-[18px] py-[10px] opacity-85">
      <span className="hidden whitespace-nowrap font-mono-space text-[9px] tracking-[2px] text-noir-faint sm:block">
        7 MODELS
        <br />
        ON THE LINE
      </span>
      <div className="flex flex-1 items-end justify-between gap-2 overflow-x-auto">
        {meters.map((m, i) => (
          <div key={m.label} className="flex flex-col items-center gap-1">
            <div className="relative h-[38px] w-4 overflow-hidden rounded-[3px] border border-noir-border-faint bg-noir-track">
              {m.state === "done" && (
                <div
                  className="absolute inset-x-[2px] bottom-0 rounded-[1px]"
                  style={{
                    height: `${86 + (i % 3)}%`,
                    background:
                      "linear-gradient(0deg,#3a3a40 0%,#8d8d94 55%,#c22f2f 85%)",
                  }}
                />
              )}
              {m.state === "typing" && (
                <div
                  className="absolute inset-x-[2px] bottom-0 h-[45%] rounded-[1px] motion-safe:animate-[pf-vu_.45s_ease-in-out_infinite_alternate]"
                  style={{
                    background:
                      "linear-gradient(0deg,#3a3a40 0%,#8d8d94 60%,#c22f2f 90%)",
                    animationDelay: `${i * 0.23}s`,
                  }}
                />
              )}
              {m.state === "idle" && (
                <div
                  className="absolute inset-x-[2px] bottom-0 h-[45%] rounded-[1px] bg-noir-fill motion-safe:animate-[pf-vu_var(--vu-dur)_ease-in-out_infinite_alternate]"
                  style={
                    {
                      "--vu-dur": `${idleDuration(i)}s`,
                      animationDelay: `${i * 0.23}s`,
                    } as React.CSSProperties
                  }
                />
              )}
            </div>
            <span className="font-mono-space text-[8px] tracking-[.5px] text-noir-faint">
              {m.label}
            </span>
          </div>
        ))}
      </div>
      <span className="hidden whitespace-nowrap text-right font-mono-space text-[9px] text-noir-faint sm:block">
        same prompt
        <br />
        same moment
      </span>
    </div>
  );
}
