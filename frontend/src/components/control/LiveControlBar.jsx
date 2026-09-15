import { useHotkeys } from "react-hotkeys-hook";
import { useControlStore } from "@/store/useControlStore";
import SlideRenderer from "../display/SlideRenderer";

import { StepBack, StepForward, CircleOff, RotateCcw } from "lucide-react";

// Small keyboard shortcut badge
function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border border-border bg-muted text-muted-foreground leading-none select-none">
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
    <div className="border-t border-border bg-card/95 backdrop-blur-md px-4 py-2.5 flex items-center gap-4 text-foreground shrink-0 shadow-lg">
      {/* Live & Next preview thumbnails */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live thumbnail */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Live
          </div>
          <div className="w-32 aspect-video rounded-lg overflow-hidden border-2 border-sky-500/80 shadow-md shadow-amber-500/10 bg-slate-950 relative group">
            <SlideRenderer
              status={liveState}
              slide={slide}
              theme={theme}
              isThumbnail={true}
            />
          </div>
        </div>

        {/* Next slide preview */}
        {nextSlide && (
          <div className="flex flex-col items-start gap-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Next
            </div>
            <div className="w-24 aspect-video rounded-lg overflow-hidden border border-border bg-slate-950 opacity-75 relative">
              <SlideRenderer
                status="live"
                slide={nextSlide}
                theme={theme}
                isThumbnail={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current slide info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-foreground truncate">
            {item ? item.title : "Nothing live"}
          </div>
          {item && (
            <span className="shrink-0 text-xs font-mono bg-sky-500/15 text-sky-500 px-2 py-0.5 rounded-md font-bold border border-sky-500/20">
              {currentSlideIndex + 1} / {totalSlides}
            </span>
          )}
        </div>
        {slide && (
          <div className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
            {slide.label}
          </div>
        )}
        {/* Keyboard shortcut hints */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1">
            <Kbd>Space</Kbd>
            <Kbd>→</Kbd>
            <span className="text-[10px] font-medium text-muted-foreground">
              next
            </span>
          </div>
          <span className="text-muted-foreground/40 text-xs">•</span>
          <div className="flex items-center gap-1">
            <Kbd>←</Kbd>
            <span className="text-[10px] font-medium text-muted-foreground">
              prev
            </span>
          </div>
          <span className="text-muted-foreground/40 text-xs">•</span>
          <div className="flex items-center gap-1">
            <Kbd>B</Kbd>
            <span className="text-[10px] font-medium text-muted-foreground">
              blackout
            </span>
          </div>
          <span className="text-muted-foreground/40 text-xs">•</span>
          <div className="flex items-center gap-1">
            <Kbd>Esc</Kbd>
            <span className="text-[10px] font-medium text-muted-foreground">
              clear
            </span>
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={prev}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/80 bg-background/50 hover:bg-muted text-foreground text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Previous slide"
        >
          <StepBack className="h-4 w-4" /> Prev
        </button>
        <button
          onClick={next}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/80 bg-background/50 hover:bg-muted text-foreground text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Next slide"
        >
          Next <StepForward className="h-4 w-4" />
        </button>
        <button
          onClick={() => (isBlackout ? resumeLive() : blackout())}
          aria-pressed={isBlackout}
          aria-label={
            isBlackout ? "Resume live (exit blackout)" : "Blackout screen"
          }
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer font-bold ${
            isBlackout
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
              : "border border-border/80 bg-background/50 hover:bg-muted text-foreground"
          }`}
        >
          {/* Pulse ring when blackout is active */}
          {isBlackout && (
            <span className="absolute inset-0 rounded-xl animate-ping bg-amber-400 opacity-30 pointer-events-none" />
          )}
          <CircleOff className="h-4 w-4" />
          Blackout
        </button>
        <button
          onClick={clearScreen}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/80 bg-background/50 hover:bg-muted text-foreground text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Clear screen"
        >
          <RotateCcw className="h-4 w-4" /> Clear
        </button>
      </div>
    </div>
  );
}
