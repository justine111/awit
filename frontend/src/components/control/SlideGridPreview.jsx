import { useControlStore } from "@/store/useControlStore";

export default function SlideGridPreview() {
  const serviceOrder = useControlStore((s) => s.serviceOrder);
  const currentItemIndex = useControlStore((s) => s.currentItemIndex);
  const currentSlideIndex = useControlStore((s) => s.currentSlideIndex);
  const liveState = useControlStore((s) => s.liveState);
  const goToSlide = useControlStore((s) => s.goToSlide);

  const item = serviceOrder[currentItemIndex];

  if (!item) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-background">
        Select an item from the service order to see its slides.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 bg-background">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        {item.title}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {item.slides.map((slide, i) => {
          const isLive = liveState === "live" && i === currentSlideIndex;
          return (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`text-left aspect-video rounded-lg p-3 bg-slate-950 border-2 flex flex-col justify-between overflow-hidden cursor-pointer transition-all ${
                isLive
                  ? "border-amber-500 shadow-md scale-[0.98]"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wide font-semibold ${
                  isLive ? "text-amber-500" : "text-muted-foreground"
                }`}
              >
                {slide.label}
              </span>
              <span className="text-slate-50 text-xs leading-snug line-clamp-4 font-display">
                {slide.lines.join(" ")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
