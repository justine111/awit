import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Fuse from "fuse.js";
import { db } from "@/lib/db";
import { useControlStore } from "@/store/useControlStore";
import SongEditorModal from "./SongEditorModal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SquarePen, Plus } from "lucide-react";

export default function SongLibraryPanel() {
  const songs = useLiveQuery(() => db.songs.toArray(), []) ?? [];
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const addToServiceOrder = useControlStore((s) => s.addToServiceOrder);

  // Fuse searches both title AND flattened lyric text for better recall
  const fuse = useMemo(() => {
    const docs = songs.map((s) => ({
      ...s,
      _lyricsText: s.slides?.map((sl) => sl.lines?.join(" ")).join(" ") ?? "",
    }));
    return new Fuse(docs, {
      keys: [
        { name: "title", weight: 2 },
        { name: "_lyricsText", weight: 1 },
      ],
      threshold: 0.35,
    });
  }, [songs]);

  const results = query.trim() ? fuse.search(query).map((r) => r.item) : songs;

  function handleAdd(song) {
    addToServiceOrder({
      id: `song-${song.id}-${Date.now()}`,
      type: "song",
      title: song.title,
      slides: song.slides,
    });
  }

  function openAdd() {
    setEditingSong(null);
    setEditorOpen(true);
  }

  function openEdit(e, song) {
    e.stopPropagation();
    setEditingSong(song);
    setEditorOpen(true);
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-3 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or lyrics…"
          className="flex-1 bg-transparent text-foreground border border-input placeholder:text-muted-foreground outline-none h-8 rounded-xl text-sm"
        />
        <Button
          onClick={openAdd}
          variant="outline"
          className="shrink-0 px-2 py-2 rounded-xl h-8 text-xs outline-none cursor-pointer"
          title="Add a new song"
        >
          <Plus size={16} /> ADD
        </Button>
      </div>

      {/* Song count */}
      <div className="px-3 pb-1 text-[10px] text-muted-foreground">
        {songs.length} song{songs.length !== 1 ? "s" : ""} in library
        {query.trim()
          ? ` · ${results.length} match${results.length !== 1 ? "es" : ""}`
          : ""}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {results.length === 0 && (
          <p className="text-muted-foreground text-sm px-1 py-4">
            {query.trim()
              ? "No matches found."
              : "No songs yet — add one to get started."}
          </p>
        )}
        {results.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-1 group rounded-lg hover:bg-sky-700/20 hover:text-white transition-colors"
          >
            <button
              onClick={() => handleAdd(song)}
              className="flex-1 text-left px-3 py-2 text-foreground text-sm cursor-pointer min-w-0"
              aria-label={`Add ${song.title} to service order`}
            >
              <span className="block truncate font-medium">{song.title}</span>
              {song.ccli && (
                <span className="text-[10px] text-muted-foreground">
                  CCLI #{song.ccli}
                </span>
              )}
            </button>
            <button
              onClick={(e) => openEdit(e, song)}
              className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label={`Edit ${song.title}`}
              title="Edit song"
            >
              <SquarePen className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <SongEditorModal
        open={editorOpen}
        song={editingSong}
        onClose={() => {
          setEditorOpen(false);
          setEditingSong(null);
        }}
      />
    </div>
  );
}
