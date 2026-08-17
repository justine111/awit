import { AnimatePresence, motion } from "framer-motion";
import { useMediaUrl } from "@/lib/useMediaUrl";
import { getPresetClassName } from "@/data/backgroundPresets";

const DEFAULT_THEME = {
  backgroundMode: "color",
  background: "#0a0c10",
  animatedPreset: "aurora",
  mediaId: null,
  overlayOpacity: 0.45,
  textColor: "#f5f2ea",
  accentColor: "#f0b45c",
  fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
};

// Renders one slide full-bleed, including its background layer. Used by
// the real Display window AND by the Control window's live preview
// thumbnail, so the operator always sees an accurate WYSIWYG of what
// the congregation sees — including the live wallpaper.
export default function SlideRenderer({
  status,
  slide,
  theme,
  meta,
  showMeta = false,
}) {
  const t = { ...DEFAULT_THEME, ...(theme || {}) };
  const mediaUrl = useMediaUrl(
    t.backgroundMode === "image" || t.backgroundMode === "video"
      ? t.mediaId
      : null,
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      {status !== "blackout" && <Background theme={t} mediaUrl={mediaUrl} />}

      {/* Readability scrim — sits between the wallpaper and the text */}
      {status !== "blackout" && t.backgroundMode !== "color" && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${t.overlayOpacity})` }}
        />
      )}

      <AnimatePresence mode="wait">
        {status === "live" && slide && (
          <motion.div
            key={slide.label + slide.lines.join("")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative px-12 text-center max-w-6xl"
          >
            {slide.lines.map((line, i) => (
              <p
                key={i}
                className="slide-text font-display font-semibold leading-tight"
                style={{
                  color: t.textColor,
                  fontSize: t.fontSize,
                  textShadow: "0 2px 24px rgba(0,0,0,0.5)",
                }}
              >
                {line}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showMeta && meta && status === "live" && (
        <div
          className="absolute bottom-4 right-6 text-sm font-body tracking-wide"
          style={{ color: t.accentColor }}
        >
          {meta.itemTitle} — {meta.slideLabel} ({meta.position})
        </div>
      )}
    </div>
  );
}

function Background({ theme, mediaUrl }) {
  if (theme.backgroundMode === "animated") {
    return (
      <div
        className={`absolute inset-0 ${getPresetClassName(theme.animatedPreset)}`}
      />
    );
  }

  if (theme.backgroundMode === "image" && mediaUrl) {
    return (
      <img
        src={mediaUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  if (theme.backgroundMode === "video" && mediaUrl) {
    return (
      <video
        src={mediaUrl}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  // Fallback: solid color (also covers backgroundMode === 'color')
  return (
    <div
      className="absolute inset-0"
      style={{ background: theme.background }}
    />
  );
}
