import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { sampleVerses } from "@/data/sampleVerses";
import { useControlStore } from "@/store/useControlStore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// NOTE: sampleVerses is a tiny demo set. Swap it for a full public-domain
// translation (WEB/KJV/ASV) JSON file with the same { book, chapter, verse,
// text } shape and everything here keeps working unchanged.
export default function BibleBrowserPanel() {
  const [query, setQuery] = useState("");
  const addToServiceOrder = useControlStore((s) => s.addToServiceOrder);

  const fuse = useMemo(
    () => new Fuse(sampleVerses, { keys: ["text", "book"], threshold: 0.3 }),
    [],
  );

  const results = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : sampleVerses;

  function handleAdd(verse) {
    const ref = `${verse.book} ${verse.chapter}:${verse.verse}`;
    addToServiceOrder({
      id: `verse-${ref}-${Date.now()}`,
      type: "verse",
      title: ref,
      slides: [{ label: ref, lines: [verse.text, `— ${ref}`] }],
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search verses or type a book name…"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 h-8 text-sm text-slate-50 outline-none focus:border-ember-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {results.map((v) => {
          const ref = `${v.book} ${v.chapter}:${v.verse}`;
          return (
            <button
              key={ref}
              onClick={() => handleAdd(v)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-sm group"
            >
              <div className="text-amber-400 text-xs mb-0.5">{ref}</div>
              <div className="text-slate-50/80 line-clamp-2">{v.text}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
