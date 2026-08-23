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
    <div className="flex flex-col h-full bg-card">
      <div className="p-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search verses or type a book name…"
          className="w-full bg-transparent text-foreground border border-input placeholder:text-muted-foreground focus-visible:border-ring outline-none h-8 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {results.map((v) => {
          const ref = `${v.book} ${v.chapter}:${v.verse}`;
          return (
            <button
              key={ref}
              onClick={() => handleAdd(v)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm group cursor-pointer text-foreground"
            >
              <div className="text-amber-500 text-xs font-semibold mb-0.5">{ref}</div>
              <div className="text-foreground/80 line-clamp-2">{v.text}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
