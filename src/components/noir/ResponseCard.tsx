import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface CardResponse {
  label: string;
  slug?: string;
  latencySec: string | null;
  text: string;
  isError: boolean;
}

// One model's answer as its own full-width card: readable on mobile
// (no inner scroll) and markdown rendered. Errors stay compact and dim.
export default function ResponseCard({ r }: { r: CardResponse }) {
  return (
    <article className="flex flex-col gap-2 rounded-[10px] border border-noir-border bg-noir-bg p-4">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-bebas text-lg tracking-[2px] text-noir-red">
          {r.label}
        </h3>
        <span className="font-mono-space text-[9px] text-noir-faint">
          {r.slug && <span className="hidden sm:inline">{r.slug} · </span>}
          {r.latencySec ? `${r.latencySec}s` : ""}
        </span>
      </header>
      {r.isError ? (
        <p className="break-words font-mono-space text-[11px] leading-[1.5] text-noir-faint">
          {r.text}
        </p>
      ) : (
        <div className="noir-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.text}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}
