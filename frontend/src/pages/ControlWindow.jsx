import { useEffect, useRef, useState } from "react";
import { seedIfEmpty } from "@/lib/db";
import SongLibraryPanel from "@/components/control/SongLibraryPanel";
import BibleBrowserPanel from "@/components/control/BibleBrowserPanel";
import ServiceOrderPanel from "@/components/control/ServiceOrderPanel";
import SlideGridPreview from "@/components/control/SlideGridPreview";
import LiveControlBar from "@/components/control/LiveControlBar";
import ThemeSettingsPanel from "@/components/control/ThemeSettingPanel";

import { Button } from "@/components/ui/button";
import { RadioTower } from "lucide-react";

export default function ControlWindow() {
  const [tab, setTab] = useState("songs");
  const displayWinRef = useRef(null);

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
    <div className="h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex flex-col items-start">
          <div className="font-display font-black text-lg tracking-tight">
            Verse<span className="text-amber-400">Side</span>
          </div>
          <p className="text-[9px] text-slate-300 tracking-wider leading-none">
            LYRICS + SCRIPT, LIVE
          </p>
        </div>
        <Button
          onClick={openDisplayWindow}
          variant="amber"
          className="px-4 py-2 h-8 rounded-lg bg-amber-500 text-slate-950 text-sm font-bold hover:bg-ember-400"
        >
          Go Live <RadioTower className="w-4 h-4 ml-1" />
        </Button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left: library / bible search */}
        <div className="w-80 shrink-0 border-r border-slate-800 flex flex-col min-h-0">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setTab("songs")}
              className={`flex-1 py-2.5 text-sm ${tab === "songs" ? "text-ember-400 border-b-2 border-ember-500" : "text-slate-600"}`}
            >
              Songs
            </button>
            <button
              onClick={() => setTab("bible")}
              className={`flex-1 py-2.5 text-sm ${tab === "bible" ? "text-ember-400 border-b-2 border-ember-500" : "text-slate-600"}`}
            >
              Bible
            </button>
            <button
              onClick={() => setTab("background")}
              className={`flex-1 py-2.5 text-sm ${tab === "background" ? "text-ember-400 border-b-2 border-ember-500" : "text-slate-600"}`}
            >
              Background
            </button>
          </div>
          <div className="flex-1 min-h-0">
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
        <div className="w-72 shrink-0 border-l border-slate-800 min-h-0">
          <ServiceOrderPanel />
        </div>
      </div>

      <LiveControlBar />
    </div>
  );
}
