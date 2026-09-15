import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Fuse from "fuse.js";
import { db } from "@/lib/db";
import { useControlStore } from "@/store/useControlStore";
import SongEditorModal from "./SongEditorModal";
import { Input } from "@/components/ui/input";
import { SquarePen, Plus, Search } from "lucide-react";

export default function SongLibraryPanel() {
  const songs = useLiveQuery(() => db.songs.toArray(), []) ?? [];
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const addToServiceOrder = useControlStore((s) => s.addToServiceOrder);

  const fuse = useMemo(() => {
    const docs = songs.map((s) => ({
      ...s,
      _lyricsText: s.slides?.map((sl) => sl.lines?.join(" ")).join(" ") ?? "",
    }));
    return new Fuse(docs, {
      keys: [{ name: "title", weight: 2 }, { name: "_lyricsText", weight: 1 }],
      threshold: 0.35,
    });
  }, [songs]);

  const results = query.trim() ? fuse.search(query).map((r) => r.item) : songs;

  function handleAdd(song) {
    addToServiceOrder({
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
    <div className="flex flex-col h-full bg-transparent">
      {/* Search + Add */}
      <div className="p-3 flex gap-2 border-b border-border/60">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs or lyrics…"
            className="pl-8 bg-muted/20 border-border/60 placeholder:text-muted-foreground/60 h-8 text-sm rounded-lg"
          />
        </div>
        <button
          onClick={openAdd}
          className="shrink-0 h-8 px-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-400 text-muted-foreground text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1"
          title="Add a new song"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Count */}
      <div className="px-3 py-1.5 text-[10px] text-muted-foreground/60 border-b border-border/40">
        {songs.length} song{songs.length !== 1 ? "s" : ""}
        {query.trim()
          ? ` · ${results.length} match${results.length !== 1 ? "es" : ""}`
          : ""}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
        {results.length === 0 && (
          <p className="text-muted-foreground/60 text-sm px-2 py-6 text-center">
            {query.trim()
              ? "No matches found."
              : "No songs yet — add one to get started."}
          </p>
        )}
        {results.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-1 group rounded-lg hover:bg-sky-500/8 border border-transparent hover:border-sky-500/15 transition-all"
          >
            <button
              onClick={() => handleAdd(song)}
              className="flex-1 text-left px-3 py-2 text-foreground text-sm cursor-pointer min-w-0"
              aria-label={`Add ${song.title} to service order`}
            >
              <span className="block truncate font-medium text-[13px] text-foreground/90">
                {song.title}
              </span>
              {song.ccli && (
                <span className="text-[10px] text-muted-foreground/50">
                  CCLI #{song.ccli}
                </span>
              )}
            </button>
            <button
              onClick={(e) => openEdit(e, song)}
              className="p-2 text-muted-foreground/40 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
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
