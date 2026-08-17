import { useEffect } from "react";
import { useDisplayStore } from "@/store/useDisplayStore";
import SlideRenderer from "@/components/display/SlideRenderer";

// This is the window you drag onto the projector / second monitor and
// send fullscreen (press F, or use the browser's fullscreen shortcut).
// It has zero controls on purpose — operators shouldn't touch this window.
export default function DisplayWindow() {
  const { status, slide, theme, meta } = useDisplayStore();

  useEffect(() => {
    document.title = "Awit Slide — Display";
  }, []);

  // Press F to toggle fullscreen on this window, Escape to exit —
  // handy once it's dragged onto the projector monitor.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement)
          document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="w-screen h-screen cursor-none">
      <SlideRenderer status={status} slide={slide} theme={theme} meta={meta} />
    </div>
  );
}
