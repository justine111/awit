import { useEffect, useRef, useState, useCallback } from "react";
import { seedIfEmpty } from "@/lib/db";
import { useControlStore } from "@/store/useControlStore";
import SongLibraryPanel from "@/components/control/SongLibraryPanel";
import BibleBrowserPanel from "@/components/control/BibleBrowserPanel";
import ServiceOrderPanel from "@/components/control/ServiceOrderPanel";
import SlideGridPreview from "@/components/control/SlideGridPreview";
import LiveControlBar from "@/components/control/LiveControlBar";
import ThemeSettingsPanel from "@/components/control/ThemeSettingPanel";
import { RadioTower, Sun, Moon, Monitor, MonitorOff, Music, BookOpen, Palette } from "lucide-react";

export default function ControlWindow() {
  const [tab, setTab] = useState("songs");
  const displayWinRef = useRef(null);
  const pollRef = useRef(null);
  const [displayOpen, setDisplayOpen] = useState(false);
  const hydrateServiceOrder = useControlStore((s) => s.hydrateServiceOrder);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    document.title = "VerseSide — Control";
    seedIfEmpty();
    hydrateServiceOrder();
  }, [hydrateServiceOrder]);

  const startPolling = useCallback(() => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      if (displayWinRef.current?.closed) {
        setDisplayOpen(false);
        clearInterval(pollRef.current);
      }
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(pollRef.current), []);

  function openDisplayWindow() {
    if (displayWinRef.current && !displayWinRef.current.closed) {
      displayWinRef.current.focus();
      return;
    }
    const url = `${window.location.origin}#/display`;
    displayWinRef.current = window.open(
      url,
      "verseside-display",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
    if (displayWinRef.current) {
      setDisplayOpen(true);
      startPolling();
    }
  }

  const TABS = [
    { id: "songs", label: "Songs", icon: <Music size={14} /> },
    { id: "bible", label: "Bible", icon: <BookOpen size={14} /> },
    { id: "background", label: "Theme", icon: <Palette size={14} /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-xl z-20 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
        <div className="flex flex-col items-start leading-4">
          <div className="font-black text-[15px] tracking-tight text-foreground">
            Verse<span className="text-sky-400">Side</span>
          </div>
          <p className="text-[8.5px] font-semibold text-muted-foreground/60 tracking-widest uppercase">
            Worship Presenter
          </p>
        </div>

        <div className="flex items-center gap-2">
          {displayOpen ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="live-dot" style={{ background: "#10b981", width: 5, height: 5 }} />
              Display Live
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border text-muted-foreground text-[11px]">
              <MonitorOff className="w-3 h-3" /> No Display
            </div>
          )}

          <button
            onClick={() => setIsDark(!isDark)}
            className="h-7 w-7 rounded-lg flex items-center justify-center border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer transition-all"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={openDisplayWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-all bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 active:scale-95"
            aria-label={displayOpen ? "Focus display window" : "Open display window"}
          >
            {displayOpen ? (
              <>
                <Monitor className="w-3.5 h-3.5" /> Focus
              </>
            ) : (
              <>
                <RadioTower className="w-3.5 h-3.5" /> Go Live
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 bg-background">
        {/* Left: library */}
        <div className="w-[22rem] shrink-0 border-r border-border flex flex-col min-h-0 bg-card/30">
          <div className="flex shrink-0 p-1.5 gap-1 border-b border-border bg-card/50">
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${tab === id
                  ? "bg-white/10 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
              >
                <span className={tab === id ? "text-sky-400" : ""}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            {tab === "songs" && <SongLibraryPanel />}
            {tab === "bible" && <BibleBrowserPanel />}
            {tab === "background" && <ThemeSettingsPanel />}
          </div>
        </div>

        {/* Middle: slide grid */}
        <div className="flex-1 min-w-0 flex flex-col">
          <SlideGridPreview />
        </div>

        {/* Right: service order */}
        <div className="w-[17rem] shrink-0 border-l border-border bg-card/30 min-h-0">
          <ServiceOrderPanel />
        </div>
      </div>

      <LiveControlBar />
    </div>
  );
}
