import { useState } from "react";
import { db } from "@/lib/db";

// Paste-and-split editor: operator pastes full lyrics, separates each
// slide (verse/chorus/bridge) with a blank line, and optionally labels
// it on the first line of that block ("Chorus\nWay maker...").
// This mirrors how EasyWorship/ProPresenter import flows work.
export default function SongEditorModal({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");

  if (!open) return null;

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
      lines[0].length < 24 &&
      /^[a-zA-Z0-9 \-]+$/.test(lines[0]) &&
      lines.length > 1;
    return {
      label: looksLikeLabel ? lines[0] : `Slide ${i + 1}`,
      lines: looksLikeLabel ? lines.slice(1) : lines,
    };
  });

  async function handleSave() {
    if (!title.trim() || preview.length === 0) return;
    await db.songs.add({ title: title.trim(), ccli: "", slides: preview });
    setTitle("");
    setRaw("");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <h2 className="font-display text-xl text-slate-50">Add song</h2>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-600">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 outline-none focus:border-ember-500"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-slate-600">
              Lyrics — separate each slide with a blank line. Optionally start a
              block with a label (e.g. "Chorus") on its own line.
            </label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              placeholder={
                "Verse 1\nGreat is Your faithfulness...\n\nChorus\nGreat is Thy faithfulness..."
              }
              className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 font-mono text-sm outline-none focus:border-ember-500"
            />
          </div>

          {preview.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-600 mb-2">
                Preview — {preview.length} slide
                {preview.length !== 1 ? "s" : ""}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {preview.map((s, i) => (
                  <div
                    key={i}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm"
                  >
                    <div className="text-ember-400 text-xs mb-1">{s.label}</div>
                    <div className="text-slate-50/80 line-clamp-3">
                      {s.lines.join(" / ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || preview.length === 0}
            className="px-4 py-2 rounded-lg bg-ember-500 text-slate-950 font-medium disabled:opacity-40"
          >
            Save song
          </button>
        </div>
      </div>
    </div>
  );
}
