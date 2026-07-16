"use client";

export type PanelId = "how" | "gallery";

const KNOB_FACE =
  "relative h-[74px] w-[74px] rounded-full border-2 bg-noir-knob shadow-[0_5px_0_#000]";
const INDICATOR =
  "absolute left-1/2 top-[6px] h-[22px] w-[5px] -translate-x-1/2 rounded-[3px]";
const LABEL = "font-bebas text-sm tracking-[2px] text-center leading-tight";
const WOBBLE = "motion-safe:hover:animate-[pf-wobble_.5s_ease]";
const SPRING =
  "block cursor-pointer transition-transform duration-[.35s] ease-[cubic-bezier(.34,1.56,.64,1)]";

// Indicator bars rotate around the knob's center (top 6px + 22px bar
// centered in a 74px circle -> origin 31px below the bar's top).
const spin = (deg: number) =>
  ({
    transform: `translateX(-50%) rotate(${deg}deg)`,
    transformOrigin: "center 31px",
  }) as React.CSSProperties;

// Vertical channel-selector column. Toggleable knobs (HOW, GALLERY)
// light up red and rotate when their panel is open on the right.
export default function KnobRail({
  active,
  onSelect,
}: {
  active: PanelId | null;
  onSelect: (panel: PanelId) => void;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-6">
      <div className="flex w-[84px] flex-col items-center gap-[9px]">
        {/* Wobble on the wrapper so it doesn't fight the spring rotation */}
        <div className={WOBBLE}>
          <button
            type="button"
            onClick={() => onSelect("how")}
            aria-expanded={active === "how"}
            className={`${KNOB_FACE} ${SPRING} ${
              active === "how"
                ? "border-noir-red"
                : "border-noir-border-strong"
            }`}
            style={{ transform: `rotate(${active === "how" ? 95 : 0}deg)` }}
          >
            <div className={`${INDICATOR} bg-noir-red`} />
          </button>
        </div>
        <span className={`${LABEL} text-noir-text`}>
          HOW IT
          <br />
          WORKS
        </span>
      </div>

      <div className="flex w-[84px] flex-col items-center gap-[9px]">
        <div className={WOBBLE}>
          <button
            type="button"
            onClick={() => onSelect("gallery")}
            aria-expanded={active === "gallery"}
            className={`${KNOB_FACE} ${SPRING} ${
              active === "gallery"
                ? "border-noir-red"
                : "border-noir-border-strong"
            }`}
            style={{
              transform: `rotate(${active === "gallery" ? 50 : -45}deg)`,
            }}
          >
            <div className={`${INDICATOR} bg-noir-text`} />
          </button>
        </div>
        <span className={`${LABEL} text-noir-text`}>GALLERY</span>
      </div>

      <div className="flex w-[84px] flex-col items-center gap-[9px]">
        <a
          href="https://github.com/aaronvle/promptfun"
          className={`${KNOB_FACE} ${WOBBLE} block border-noir-border-strong`}
        >
          <div className={`${INDICATOR} bg-noir-text`} style={spin(90)} />
        </a>
        <span className={`${LABEL} text-noir-text`}>GITHUB</span>
      </div>

      <div className="flex w-[84px] flex-col items-center gap-[9px] opacity-55">
        <div className={`${KNOB_FACE} border-noir-border-strong`}>
          <div className={`${INDICATOR} bg-noir-text2`} style={spin(-135)} />
        </div>
        <span className={`${LABEL} text-noir-text2`}>
          X BOT
          <br />· SOON
        </span>
      </div>
    </div>
  );
}
