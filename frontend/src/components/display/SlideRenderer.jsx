import { AnimatePresence, motion } from "framer-motion";

// Renders one slide full-bleed. Used by the real Display window AND by
// the Control window's live preview thumbnail, so the operator always
// sees an accurate WYSIWYG of what the congregation sees.
export default function SlideRenderer({
  status,
  slide,
  theme,
  meta,
  showMeta = false,
}) {
  const t = theme || {
    background: "#0a0c10",
    textColor: "#f5f2ea",
    accentColor: "#f0b45c",
    fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: status === "blackout" ? "#000" : t.background }}
    >
      <AnimatePresence mode="wait">
        {status === "live" && slide && (
          <motion.div
            key={slide.label + slide.lines.join("")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="px-12 text-center max-w-6xl"
          >
            {slide.lines.map((line, i) => (
              <p
                key={i}
                className="slide-text font-display font-semibold leading-tight"
                style={{ color: t.textColor, fontSize: t.fontSize }}
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

      {status === "clear" && <div className="w-2 h-2 rounded-full opacity-0" />}
    </div>
  );
}
