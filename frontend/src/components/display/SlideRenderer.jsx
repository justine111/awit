import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaUrl } from "@/lib/useMediaUrl";
import { getPresetClassName } from "@/data/backgroundPresets";
import { Mic, Music, Cross, Wifi, Sparkles, Radio, Clock } from "lucide-react";

const DEFAULT_THEME = {
  backgroundMode: "animated",
  background: "#0a0c10",
  animatedPreset: "aurora",
  mediaId: null,
  overlayOpacity: 0.45,
  textColor: "#f5f2ea",
  accentColor: "#f0b45c",
  fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
  fontFamily: "'Geist Variable', sans-serif",
  idleSettings: {
    enabled: true,
    icon: "clock",
    title: "SERVICE STARTS IN",
    timerEnabled: true,
    timerMode: "target",
    targetTime: "10:00",
    durationMinutes: 10,
  },
};

function IdleIcon({ icon, isThumbnail }) {
  const sizeClass = isThumbnail ? "w-3 h-3" : "w-6 h-6 md:w-8 md:h-8";
  switch (icon) {
    case "music":
      return <Music className={sizeClass} />;
    case "cross":
      return <Cross className={sizeClass} />;
    case "wifi":
      return <Wifi className={sizeClass} />;
    case "sparkles":
      return <Sparkles className={sizeClass} />;
    case "radio":
      return <Radio className={sizeClass} />;
    case "clock":
      return <Clock className={sizeClass} />;
    case "mic":
    default:
      return <Mic className={sizeClass} />;
  }
}

function useCountdown(idle) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!idle.timerEnabled) {
      setTimeLeft("");
      return;
    }

    function calculate() {
      const now = new Date();
      let target = new Date();

      if (idle.timerMode === "target" && idle.targetTime) {
        const [hours, minutes] = idle.targetTime.split(":").map(Number);
        target.setHours(hours || 0, minutes || 0, 0, 0);
        if (now.getTime() > target.getTime() + 30 * 60 * 1000) {
          target.setDate(target.getDate() + 1);
        }
      } else {
        const mins = Number(idle.durationMinutes) || 10;
        target = new Date(now.getTime() + mins * 60 * 1000);
      }

      const diff = Math.max(
        0,
        Math.floor((target.getTime() - now.getTime()) / 1000),
      );
      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      const pad = (n) => String(n).padStart(2, "0");
      if (h > 0) {
        setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
      } else {
        setTimeLeft(`${pad(m)}:${pad(s)}`);
      }
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [
    idle.timerEnabled,
    idle.timerMode,
    idle.targetTime,
    idle.durationMinutes,
  ]);

  return timeLeft;
}

function PreServiceLoop({ idleSettings, isThumbnail }) {
  const idle = {
    enabled: true,
    icon: "clock",
    title: "SERVICE STARTS IN",
    timerEnabled: true,
    timerMode: "target",
    targetTime: "10:00",
    durationMinutes: 10,
    ...(idleSettings || {}),
  };

  const timeLeft = useCountdown(idle);

  if (!idle.enabled) return null;

  if (isThumbnail) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center p-1 text-center text-white scale-[0.85] select-none">
        <div className="text-[7px] font-black uppercase tracking-tight text-white leading-tight truncate max-w-full">
          {idle.title}
        </div>
        {idle.timerEnabled && (
          <div className="mt-0.5 px-1.5 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 rounded text-[7px] font-mono font-bold tracking-wider text-white">
            {timeLeft || "00:00"}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative z-10 flex flex-col items-center justify-center px-6 py-8 text-center text-white max-w-3xl select-none"
    >
      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl leading-tight">
        {idle.title}
      </h1>

      {/* Countdown Timer Box */}
      {idle.timerEnabled && (
        <div className="mt-6 px-10 py-4 bg-white/15 backdrop-blur-2xl border border-white/25 rounded-3xl flex flex-col items-center shadow-2xl shadow-black/30">
          <span className="font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-widest drop-shadow-md">
            {timeLeft || "00:00"}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function SlideRenderer({
  status,
  slide,
  theme,
  meta,
  showMeta = false,
  isThumbnail = false,
}) {
  const t = { ...DEFAULT_THEME, ...(theme || {}) };
  const mediaUrl = useMediaUrl(
    t.backgroundMode === "image" || t.backgroundMode === "video"
      ? t.mediaId
      : null,
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 select-none">
      {status !== "blackout" && <Background theme={t} mediaUrl={mediaUrl} />}

      {/* Readability scrim — sits between the wallpaper and the text */}
      {status !== "blackout" && t.backgroundMode !== "color" && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${t.overlayOpacity})` }}
        />
      )}

      {/* Pre-Service Waiting Loop (shown when clear) */}
      {status === "clear" && (
        <PreServiceLoop
          idleSettings={t.idleSettings}
          isThumbnail={isThumbnail}
        />
      )}

      <AnimatePresence mode="wait">
        {status === "live" && slide && (
          <motion.div
            key={slide.label + slide.lines.join("")}
            initial={{ opacity: 0, y: isThumbnail ? 2 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isThumbnail ? -2 : -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative text-center ${
              isThumbnail ? "px-2 py-1 max-w-full" : "px-12 max-w-6xl"
            }`}
          >
            {slide.lines.map((line, i) => (
              <p
                key={i}
                className={`slide-text font-semibold leading-tight ${
                  isThumbnail ? "line-clamp-2 text-ellipsis" : ""
                }`}
                style={{
                  color: t.textColor,
                  fontSize: isThumbnail ? "0.6rem" : t.fontSize,
                  fontFamily: t.fontFamily,
                  textShadow: isThumbnail
                    ? "0 1px 3px rgba(0,0,0,0.8)"
                    : "0 2px 24px rgba(0,0,0,0.5)",
                }}
              >
                {line}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showMeta && meta && status === "live" && !isThumbnail && (
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
