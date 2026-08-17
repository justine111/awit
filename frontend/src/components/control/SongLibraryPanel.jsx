import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Fuse from "fuse.js";
import { db } from "@/lib/db";
import { useControlStore } from "@/store/useControlStore";
import SongEditorModal from "./SongEditorModal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SongLibraryPanel() {
  const songs = useLiveQuery(() => db.songs.toArray(), []) ?? [];
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const addToServiceOrder = useControlStore((s) => s.addToServiceOrder);

  const fuse = useMemo(
    () => new Fuse(songs, { keys: ["title"], threshold: 0.35 }),
    [songs],
  );
  const results = query.trim() ? fuse.search(query).map((r) => r.item) : songs;

  function handleAdd(song) {
    addToServiceOrder({
      id: `song-${song.id}-${Date.now()}`,
      type: "song",
      title: song.title,
      slides: song.slides,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs…"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 h-8 text-sm text-slate-50 outline-none focus:border-ember-500"
        />
        <Button
          onClick={() => setEditorOpen(true)}
          className="shrink-0 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 h-8 text-sm text-slate-50 outline-none focus:border-ember-500"
          title="Add a new song"
        >
          + Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {results.length === 0 && (
          <p className="text-slate-600 text-sm px-1 py-4">
            No songs yet — add one to get started.
          </p>
        )}
        {results.map((song) => (
          <button
            key={song.id}
            onClick={() => handleAdd(song)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-50 text-sm flex items-center justify-between group"
          >
            <span className="truncate">{song.title}</span>
            <span className="text-slate-600 opacity-0 group-hover:opacity-100 text-xs">
              + queue
            </span>
          </button>
        ))}
      </div>

      <SongEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} />
    </div>
  );
}
