import { useEffect, useRef, useState, useCallback } from "react";
import { seedIfEmpty } from "@/lib/db";
import { useControlStore } from "@/store/useControlStore";
import SongLibraryPanel from "@/components/control/SongLibraryPanel";
import BibleBrowserPanel from "@/components/control/BibleBrowserPanel";
import ServiceOrderPanel from "@/components/control/ServiceOrderPanel";
import SlideGridPreview from "@/components/control/SlideGridPreview";
import LiveControlBar from "@/components/control/LiveControlBar";
import ThemeSettingsPanel from "@/components/control/ThemeSettingPanel";

import { Button } from "@/components/ui/button";
import {
  RadioTower,
  Sun,
  Moon,
  Monitor,
  MonitorOff,
  Music,
  BookOpen,
  Palette,
} from "lucide-react";

export default function ControlWindow() {
  const [tab, setTab] = useState("songs");
  const displayWinRef = useRef(null);
  const pollRef = useRef(null);

  // Track whether the display popup window is open
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

  // Poll the display window's closed state every second
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
    // If already open and not closed, focus it
    if (displayWinRef.current && !displayWinRef.current.closed) {
      displayWinRef.current.focus();
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}#/display`;
    displayWinRef.current = window.open(
      url,
      "verseside-display",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no",
    );
    if (displayWinRef.current) {
      setDisplayOpen(true);
      startPolling();
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans select-none overflow-hidden">
      {/* ── Header ── */}
      <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-border bg-card/90 backdrop-blur-md z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col items-start leading-tight">
            <div className="font-display font-black text-base tracking-tight">
              Verse<span className="text-sky-700">Side</span>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/90 tracking-wide uppercase">
              Church Worship Presenter
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          {/* Display window status badge */}
          {displayOpen ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-semibold animate-fade-in">
              <Monitor className="w-3.5 h-3.5" />
              Display Active
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/60 border border-border text-muted-foreground text-xs font-medium">
              <MonitorOff className="w-3.5 h-3.5" />
              Display Offline
            </div>
          )}

          {/* Dark mode toggle */}
          <Button
            onClick={() => setIsDark(!isDark)}
            variant="ghost"
            size="icon"
            className="rounded-xl h-7 w-7 bg-gray-100 dark:bg-sky-700 text-muted-foreground hover:text-foreground cursor-pointer transition-all"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-black" />
            )}
          </Button>

          {/* Go Live / Reopen */}
          <Button
            onClick={openDisplayWindow}
            variant="amber"
            className="px-2 py-1 rounded-lg bg-sky-700 text-white text-xs uppercase font-bold cursor-pointer shadow-md"
            aria-label={
              displayOpen ? "Focus display window" : "Open display window"
            }
          >
            {displayOpen ? (
              <>
                <Monitor className="w-3.5 h-3.5" /> Focus Display
              </>
            ) : (
              <>
                <RadioTower className="w-3.5 h-3.5" /> Go Live
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex-1 flex min-h-0 bg-background/50">
        {/* Left: library panel */}
        <div className="w-96 shrink-0 border-r border-border bg-card/60 flex flex-col min-h-0 shadow-sm">
          <div className="flex border-b border-border/80 p-1 bg-muted/30 shrink-0 gap-1">
            {[
              { id: "songs", label: "Songs", icon: <Music size={18} /> },
              { id: "bible", label: "Bible", icon: <BookOpen size={18} /> },
              {
                id: "background",
                label: "Theme",
                icon: <Palette size={18} />,
              },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === id
                    ? "bg-card text-sky-700 border border-border/60 dark:bg-sky-700 dark:text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{icon}</span>
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

        {/* Middle: slide grid preview */}
        <div className="flex-1 min-w-0 flex flex-col bg-background/30">
          <SlideGridPreview />
        </div>

        {/* Right: service order */}
        <div className="w-72 shrink-0 border-l border-border bg-card/60 min-h-0 shadow-sm">
          <ServiceOrderPanel />
        </div>
      </div>

      {/* ── Live control bar ── */}
      <LiveControlBar />
    </div>
  );
}
