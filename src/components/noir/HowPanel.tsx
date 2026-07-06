const STEPS = [
  {
    num: "01",
    title: "The window opens",
    body: "Once every ~12 hours, at a random time nobody knows in advance, the site unlocks for prompting.",
  },
  {
    num: "02",
    title: "First come, first served",
    body: "Anyone on the site can write a prompt and hit send. The first submission claims the run — then it locks again.",
  },
  {
    num: "03",
    title: "Every model answers",
    body: "The prompt fans out to a handful of flagship models at once via OpenRouter. Same prompt, same moment.",
  },
  {
    num: "04",
    title: "The results live forever",
    body: "Responses are archived and tweeted as a thread — with credit to the prompter, if they want it.",
  },
];

export default function HowPanel() {
  return (
    <div className="grid grid-cols-1 gap-[10px] rounded-[10px] border border-noir-border bg-noir-bg p-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s) => (
        <div
          key={s.num}
          className="flex flex-col gap-[5px] border-l-2 border-noir-red px-3 py-[11px]"
        >
          <span className="font-bebas text-lg tracking-[1px] text-noir-text">
            {s.num} {s.title}
          </span>
          <span className="font-mono-space text-[10px] leading-[1.55] text-noir-text2">
            {s.body}
          </span>
        </div>
      ))}
    </div>
  );
}
