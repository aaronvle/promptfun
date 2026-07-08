"use client";

export default function SendButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`h-[104px] w-[104px] rounded-full border-2 border-noir-bg bg-noir-red font-bebas text-[26px] tracking-[3px] text-noir-bg shadow-[0_0_0_3px_#35353a,0_8px_0_#000] ${
          disabled
            ? "cursor-not-allowed opacity-45"
            : "cursor-pointer active:translate-y-[5px] active:shadow-[0_0_0_3px_#35353a,0_3px_0_#000]"
        }`}
      >
        SEND
      </button>
      <span className="font-mono-space text-[8px] tracking-[1px] text-noir-muted">
        FIRST PRESS WINS
      </span>
    </div>
  );
}
