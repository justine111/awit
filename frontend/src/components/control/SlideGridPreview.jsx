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
      <div className="h-full flex items-center justify-center text-slate-600 text-sm">
        Select an item from the service order to see its slides.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="text-xs uppercase tracking-wide text-slate-600 mb-3">
        {item.title}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {item.slides.map((slide, i) => {
          const isLive = liveState === "live" && i === currentSlideIndex;
          return (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`text-left aspect-video rounded-lg p-3 bg-slate-950 border-2 flex flex-col justify-between overflow-hidden ${
                isLive
                  ? "border-amber-500"
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wide ${
                  isLive ? "text-amber-400" : "text-slate-600"
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
