import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

// Paste-and-split editor: operator pastes full lyrics, separates each
// slide (verse/chorus/bridge) with a blank line, and optionally labels
export default function SongEditorModal({ open, song, onClose }) {
  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");
  const [ccli, setCcli] = useState("");
  const [tags, setTags] = useState("");

  const firstInputRef = useRef(null);
  const isEditing = !!song;

  // Pre-fill fields when editing an existing song
  useEffect(() => {
    if (open) {
      if (song) {
        setTitle(song.title ?? "");
        setCcli(song.ccli ?? "");
        setTags(Array.isArray(song.tags) ? song.tags.join(", ") : "");
        // Reconstruct raw text from slides
        const reconstructed =
          song.slides
            ?.map((s) => `${s.label}\n${s.lines.join("\n")}`)
            .join("\n\n") ?? "";
        setRaw(reconstructed);
      } else {
        setTitle("");
        setRaw("");
        setCcli("");
        setTags("");
      }
      // Focus title on open
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, song]);

  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const preview = blocks.map((block, i) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const looksLikeLabel =
      lines[0] &&
      lines[0].length < 30 &&
      /^[a-zA-Z0-9 \-]+$/.test(lines[0]) &&
      lines.length > 1;
    return {
      label: looksLikeLabel ? lines[0] : `Slide ${i + 1}`,
      lines: looksLikeLabel ? lines.slice(1) : lines,
    };
  });

  async function handleSave() {
    if (!title.trim() || preview.length === 0) return;
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      title: title.trim(),
      ccli: ccli.trim(),
      tags: tagsArray,
      slides: preview,
    };
    if (isEditing) {
      await db.songs.update(song.id, payload);
    } else {
      await db.songs.add(payload);
    }
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[88vh] flex flex-col p-4 gap-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xs uppercase font-bold">
            {isEditing ? "Edit Song" : "Add New Song"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-0">
            Enter song details and lyrics. Separate slides with a blank line.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2">
          {/* Title */}
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
              Song Title
            </label>
            <Input
              ref={firstInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Way Maker"
              className="mt-1 font-medium h-9"
            />
          </div>

          {/* CCLI + Tags row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                CCLI Number
              </label>
              <Input
                value={ccli}
                onChange={(e) => setCcli(e.target.value)}
                placeholder="e.g. 7026775"
                className="mt-1 text-xs h-9"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                Tags (comma-separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Worship, Praise"
                className="mt-1 text-xs h-9"
              />
            </div>
          </div>

          {/* Lyrics editor */}
          <div>
            <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
              Lyrics & Slides
            </label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={12}
              placeholder={
                "Verse 1\nYou are here, moving in our midst...\n\nChorus\nWay maker, miracle worker..."
              }
              className="mt-1 w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-foreground font-mono text-xs leading-relaxed outline-none focus:border-sky-700 transition-colors resize-y shadow-inner"
            />
          </div>

          {/* Slide preview */}
          {preview.length > 0 && (
            <div>
              <div className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground mb-2">
                Slide Preview ({preview.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {preview.map((s, i) => (
                  <div
                    key={i}
                    className="bg-muted/40 border border-border/80 rounded-xl p-3 text-xs"
                  >
                    <div className="text-sky-700 font-bold text-[11px] mb-1">
                      {s.label}
                    </div>
                    <div className="text-foreground/80 line-clamp-3 font-medium">
                      {s.lines.join(" / ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
          {isEditing ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (confirm("Delete this song from the library?")) {
                  await db.songs.delete(song.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold h-8 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold cursor-pointer h-8 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim() || preview.length === 0}
              className="bg-sky-700 hover:bg-sky-800 h-8 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm disabled:opacity-40"
            >
              {isEditing ? "Save Changes" : "Save Song"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
