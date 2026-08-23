import { useEffect, useRef, useState } from "react";
import { seedIfEmpty } from "@/lib/db";
import SongLibraryPanel from "@/components/control/SongLibraryPanel";
import BibleBrowserPanel from "@/components/control/BibleBrowserPanel";
import ServiceOrderPanel from "@/components/control/ServiceOrderPanel";
import SlideGridPreview from "@/components/control/SlideGridPreview";
import LiveControlBar from "@/components/control/LiveControlBar";
import ThemeSettingsPanel from "@/components/control/ThemeSettingPanel";

import { Button } from "@/components/ui/button";
import { RadioTower, Sun, Moon } from "lucide-react";

export default function ControlWindow() {
  const [tab, setTab] = useState("songs");
  const displayWinRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return false; // Default white (light) theme
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
  }, []);

  function openDisplayWindow() {
    const url = `${window.location.origin}${window.location.pathname}#/display`;
    displayWinRef.current = window.open(
      url,
      "verseside-display",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no",
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-card">
        <div className="flex flex-col items-start">
          <div className="font-display font-black text-lg tracking-tight">
            Verse<span className="text-amber-500">Side</span>
          </div>
          <p className="text-[9px] text-muted-foreground tracking-wider leading-none">
            LYRICS + SCRIPT, LIVE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDark(!isDark)}
            variant="ghost"
            size="icon"
            className="rounded-lg h-8 w-8 hover:bg-muted"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            onClick={openDisplayWindow}
            variant="amber"
            className="px-4 py-2 h-8 rounded-lg bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400 cursor-pointer"
          >
            Go Live <RadioTower className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 bg-background">
        {/* Left: library / bible search */}
        <div className="w-80 shrink-0 border-r border-border bg-card flex flex-col min-h-0">
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab("songs")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "songs"
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Songs
            </button>
            <button
              onClick={() => setTab("bible")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "bible"
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bible
            </button>
            <button
              onClick={() => setTab("background")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "background"
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Background
            </button>
          </div>
          <div className="flex-1 min-h-0 bg-card">
            {tab === "songs" && <SongLibraryPanel />}
            {tab === "bible" && <BibleBrowserPanel />}
            {tab === "background" && <ThemeSettingsPanel />}
          </div>
        </div>

        {/* Middle: slide grid for the selected item */}
        <div className="flex-1 min-w-0 flex flex-col">
          <SlideGridPreview />
        </div>

        {/* Right: service order queue */}
        <div className="w-72 shrink-0 border-l border-border bg-card min-h-0">
          <ServiceOrderPanel />
        </div>
      </div>
      <LiveControlBar />
    </div>
  );
}
