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
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs…"
          className="flex-1 bg-transparent text-foreground border border-input placeholder:text-muted-foreground focus-visible:border-ring outline-none h-8 text-sm"
        />
        <Button
          onClick={() => setEditorOpen(true)}
          variant="outline"
          className="shrink-0 px-3 py-2 rounded-lg h-8 text-sm outline-none cursor-pointer"
          title="Add a new song"
        >
          + Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {results.length === 0 && (
          <p className="text-muted-foreground text-sm px-1 py-4">
            No songs yet — add one to get started.
          </p>
        )}
        {results.map((song) => (
          <button
            key={song.id}
            onClick={() => handleAdd(song)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-foreground text-sm flex items-center justify-between group cursor-pointer"
          >
            <span className="truncate font-medium">{song.title}</span>
            <span className="text-muted-foreground opacity-0 group-hover:opacity-100 text-xs transition-opacity">
              + queue
            </span>
          </button>
        ))}
      </div>

      <SongEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} />
    </div>
  );
}
