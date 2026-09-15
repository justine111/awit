import { useControlStore } from "@/store/useControlStore";
import { getPresetClassName } from "@/data/backgroundPresets";
import { useMediaUrl } from "@/lib/useMediaUrl";

// ─── SlideThumbnail ──────────────────────────────────────────────────────────
// A lightweight WYSIWYG thumbnail that mirrors the slide's theme without
// the vw-based font scaling of the full SlideRenderer (which is designed
// to fill a projector screen, not a tiny card).
function SlideThumbnail({ slide, theme, isLive, onClick }) {
  const t = theme || {};
  const bgClass =
    t.backgroundMode === "animated" ? getPresetClassName(t.animatedPreset) : "";
  const mediaUrl = useMediaUrl(
    t.backgroundMode === "image" || t.backgroundMode === "video"
      ? t.mediaId
      : null,
  );

  return (
    <button
      onClick={onClick}
      aria-label={`${isLive ? "Currently live: " : ""}Slide: ${slide.label}`}
      className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-sky-500 ${
        isLive
          ? "border-sky-500 shadow-lg shadow-sky-500/20 scale-[0.97]"
          : "border-border hover:border-muted-foreground/50"
      }`}
      style={{
        background:
          t.backgroundMode === "color" ? t.background || "#0a0c10" : "#0a0c10",
      }}
    >
      {/* Animated gradient background */}
      {t.backgroundMode === "animated" && (
        <div className={`absolute inset-0 ${bgClass}`} />
      )}
      {/* Image background */}
      {t.backgroundMode === "image" && mediaUrl && (
        <img
          src={mediaUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Video background (static thumbnail — just show overlay) */}
      {t.backgroundMode === "video" && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <span className="text-white/30 text-lg">▶</span>
        </div>
      )}
      {/* Dim scrim */}
      {t.backgroundMode !== "color" && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${t.overlayOpacity ?? 0.45})` }}
        />
      )}

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-between p-2 z-10">
        <span
          className="text-[9px] uppercase tracking-wide font-bold leading-tight"
          style={{ color: t.accentColor || "#f0b45c" }}
        >
          {slide.label}
        </span>
        <span
          className="text-[8px] leading-snug line-clamp-4 font-semibold"
          style={{ color: t.textColor || "#f5f2ea" }}
        >
          {slide.lines.join(" ")}
        </span>
      </div>
    </button>
  );
}

export default function SlideGridPreview() {
  const serviceOrder = useControlStore((s) => s.serviceOrder);
  const currentItemIndex = useControlStore((s) => s.currentItemIndex);
  const currentSlideIndex = useControlStore((s) => s.currentSlideIndex);
  const liveState = useControlStore((s) => s.liveState);
  const goToSlide = useControlStore((s) => s.goToSlide);
  const theme = useControlStore((s) => s.theme);

  const item = serviceOrder[currentItemIndex];

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-background">
        <p className="text-sm">
          Select an item from the service order to see its slides.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 shrink-0 flex items-center justify-between">
        <div className="text-sm font-semibold uppercase tracking-wide text-sky-500 truncate">
          {item.title}
        </div>
        <span className="text-sm text-muted-foreground uppercase shrink-0 ml-2">
          {item.slides.length} slide{item.slides.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {item.slides.map((slide, i) => {
            const isLive = liveState === "live" && i === currentSlideIndex;
            return (
              <SlideThumbnail
                key={i}
                slide={slide}
                theme={theme}
                isLive={isLive}
                onClick={() => goToSlide(i)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
