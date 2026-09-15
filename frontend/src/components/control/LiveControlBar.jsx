import { useHotkeys } from "react-hotkeys-hook";
import { useControlStore } from "@/store/useControlStore";
import SlideRenderer from "../display/SlideRenderer";

import { StepBack, StepForward, CircleOff, RotateCcw } from "lucide-react";

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border border-white/10 bg-white/5 text-muted-foreground/70 leading-none select-none">
      {children}
    </kbd>
  );
}

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
  const nextSlide = item?.slides?.[currentSlideIndex + 1] ?? null;
  const totalSlides = item?.slides?.length ?? 0;

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

  const isBlackout = liveState === "blackout";

  return (
    <div className="border-t border-white/6 bg-card/95 backdrop-blur-xl px-4 py-2.5 flex items-center gap-4 text-foreground shrink-0 relative">
      {/* Subtle top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/25 to-transparent" />

      {/* Live & Next preview thumbnails */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <span className="live-dot" />
            Live
          </div>
          <div className="w-32 aspect-video rounded-lg overflow-hidden ring-1 ring-sky-500/40 shadow-md shadow-sky-500/10 bg-slate-950 relative">
            <SlideRenderer status={liveState} slide={slide} theme={theme} isThumbnail={true} />
          </div>
        </div>

        {nextSlide && (
          <div className="flex flex-col items-start gap-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Next
            </div>
            <div className="w-24 aspect-video rounded-lg overflow-hidden border border-white/6 bg-slate-950 opacity-60 relative">
              <SlideRenderer status="live" slide={nextSlide} theme={theme} isThumbnail={true} />
            </div>
          </div>
        )}
      </div>

      {/* Current slide info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-semibold text-foreground/90 truncate">
            {item ? item.title : <span className="text-muted-foreground/50">Nothing live</span>}
          </div>
          {item && (
            <span className="shrink-0 text-[10px] font-mono bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-bold border border-sky-500/15">
              {currentSlideIndex + 1}/{totalSlides}
            </span>
          )}
        </div>
        {slide && (
          <div className="text-[11px] text-muted-foreground/50 truncate mt-0.5">{slide.label}</div>
        )}
        {/* Keyboard hints */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1">
            <Kbd>Space</Kbd><Kbd>→</Kbd>
            <span className="text-[9px] text-muted-foreground/40">next</span>
          </div>
          <span className="text-muted-foreground/20 text-xs">•</span>
          <div className="flex items-center gap-1">
            <Kbd>←</Kbd>
            <span className="text-[9px] text-muted-foreground/40">prev</span>
          </div>
          <span className="text-muted-foreground/20 text-xs">•</span>
          <div className="flex items-center gap-1">
            <Kbd>B</Kbd>
            <span className="text-[9px] text-muted-foreground/40">blackout</span>
          </div>
          <span className="text-muted-foreground/20 text-xs">•</span>
          <div className="flex items-center gap-1">
            <Kbd>Esc</Kbd>
            <span className="text-[9px] text-muted-foreground/40">clear</span>
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={prev}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 text-foreground/80 text-[11px] font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97]"
          aria-label="Previous slide"
        >
          <StepBack className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          onClick={next}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 text-foreground/80 text-[11px] font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97]"
          aria-label="Next slide"
        >
          Next <StepForward className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => (isBlackout ? resumeLive() : blackout())}
          aria-pressed={isBlackout}
          aria-label={isBlackout ? "Resume live (exit blackout)" : "Blackout screen"}
          className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer font-bold ${
            isBlackout
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25"
              : "border border-white/8 bg-white/4 hover:bg-white/8 text-foreground/80"
          }`}
        >
          {isBlackout && (
            <span className="absolute inset-0 rounded-lg animate-ping bg-amber-400 opacity-25 pointer-events-none" />
          )}
          <CircleOff className="h-3.5 w-3.5" />
          Blackout
        </button>
        <button
          onClick={clearScreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 text-foreground/80 text-[11px] font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97]"
          aria-label="Clear screen"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}
