import { useHotkeys } from "react-hotkeys-hook";
import { useControlStore } from "@/store/useControlStore";
import SlideRenderer from "../display/SlideRenderer";

import { StepBack, StepForward, CircleOff, RotateCcw } from "lucide-react";

export default function LiveControlBar() {
  const next = useControlStore((s) => s.next);
  const prev = useControlStore((s) => s.prev);
  const blackout = useControlStore((s) => s.blackout);
  const clearScreen = useControlStore((s) => s.clearScreen);
  const resumeLive = useControlStore((s) => s.resumeLive);
  const liveState = useControlStore((s) => s.liveState);
  const serviceOrder = useControlStore((s) => s.serviceOrder);
  const currentItemIndex = useControlStore((s) => s.currentItemIndex);
  const currentSlideIndex = useControlStore((s) => s.currentSlideIndex);
  const theme = useControlStore((s) => s.theme);

  const item = serviceOrder[currentItemIndex];
  const slide = item?.slides?.[currentSlideIndex];

  // Space/Right = next slide, Left = previous, B = blackout, Escape = clear.
  // Operators run this live, so keyboard control matters more than clicking.
  useHotkeys(
    "space, right",
    (e) => {
      e.preventDefault();
      next();
    },
    { enableOnFormTags: false },
  );
  useHotkeys("left", () => prev());
  useHotkeys("b", () => (liveState === "blackout" ? resumeLive() : blackout()));
  useHotkeys("escape", () => clearScreen());

  return (
    <div className="border-t border-ink-800 bg-ink-900 px-4 py-3 flex items-center gap-4">
      <div className="w-40 aspect-video rounded-md overflow-hidden border border-ink-700 shrink-0">
        <SlideRenderer status={liveState} slide={slide} theme={theme} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink-50 truncate">
          {item ? `${item.title} — ${slide?.label ?? ""}` : "Nothing live"}
        </div>
        <div className="text-xs text-ink-600">
          Space / → next · ← previous · B blackout · Esc clear
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-50 text-sm"
        >
          <StepBack className="h-4 w-4" /> Prev
        </button>
        <button
          onClick={next}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-50 text-sm"
        >
          Next <StepForward className="h-4 w-4" />
        </button>
        <button
          onClick={() => (liveState === "blackout" ? resumeLive() : blackout())}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${
            liveState === "blackout"
              ? "bg-amber-500 text-slate-950"
              : "bg-slate-800 hover:bg-slate-700 text-slate-50"
          }`}
        >
          <CircleOff className="h-4 w-4" />
          Blackout
        </button>
        <button
          onClick={clearScreen}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-50 text-sm"
        >
          <RotateCcw className="h-4 w-4" /> Clear
        </button>
      </div>
    </div>
  );
}
