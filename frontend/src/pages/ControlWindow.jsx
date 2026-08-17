import { useEffect, useRef, useState } from "react";
import { seedIfEmpty } from "@/lib/db";
import SongLibraryPanel from "@/components/control/SongLibraryPanel";
import BibleBrowserPanel from "@/components/control/BibleBrowserPanel";
import ServiceOrderPanel from "@/components/control/ServiceOrderPanel";
import SlideGridPreview from "@/components/control/SlideGridPreview";
import LiveControlBar from "@/components/control/LiveControlBar";

import { Button } from "@/components/ui/button";
import { RadioTower } from "lucide-react";

export default function ControlWindow() {
  const [tab, setTab] = useState("songs");
  const displayWinRef = useRef(null);

  useEffect(() => {
    document.title = "Awit Slide";
    seedIfEmpty();
  }, []);

  function openDisplayWindow() {
    const url = `${window.location.origin}${window.location.pathname}#/display`;
    displayWinRef.current = window.open(
      url,
      "Awit Slide",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no",
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-ink-50">
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="font-display text-lg text-white tracking-wide">
          Awit<span className="text-ember-400">Slide</span>
        </div>
        <Button
          onClick={openDisplayWindow}
          className="px-3 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm uppercase font-bold hover:bg-ember-400"
        >
          Go Live <RadioTower className="ml-2 h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="w-80 shrink-0 border-r border-slate-800 flex flex-col min-h-0">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setTab("songs")}
              className={`flex-1 py-2.5 text-sm ${tab === "songs" ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-100"}`}
            >
              Songs
            </button>
            <button
              onClick={() => setTab("bible")}
              className={`flex-1 py-2.5 text-sm ${tab === "bible" ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-100"}`}
            >
              Bible
            </button>
            <button
              onClick={() => setTab("favorites")}
              className={`flex-1 py-2.5 text-sm ${tab === "favorites" ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-100"}`}
            >
              Favorites
            </button>
          </div>
          <div className="flex-1 min-h-0">
            {tab === "songs" ? <SongLibraryPanel /> : <BibleBrowserPanel />}
          </div>
        </div>
        {/* Middle: slide grid for the selected item */}
        <div className="flex-1 min-w-0 flex flex-col">
          <SlideGridPreview />
        </div>

        {/* Right: service order queue */}
        <div className="w-72 shrink-0 border-l border-ink-800 min-h-0">
          <ServiceOrderPanel />
        </div>
      </div>

      <LiveControlBar />
    </div>
  );
}
