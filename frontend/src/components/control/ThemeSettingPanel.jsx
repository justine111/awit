import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveMedia, deleteMedia } from "@/lib/db";
import { useMediaUrl } from "@/lib/useMediaUrl";
import { ANIMATED_PRESETS, getPresetClassName } from "@/data/backgroundPresets";
import { useControlStore } from "@/store/useControlStore";

const MODES = [
  { id: "color", label: "Solid color" },
  { id: "animated", label: "Animated" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video loop" },
];

export default function ThemeSettingsPanel() {
  const theme = useControlStore((s) => s.theme);
  const updateTheme = useControlStore((s) => s.updateTheme);
  const mediaList =
    useLiveQuery(() => db.media.orderBy("createdAt").reverse().toArray(), []) ??
    [];
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { id, kind } = await saveMedia(file);
      updateTheme({ backgroundMode: kind, mediaId: id });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteMedia(id) {
    if (theme.mediaId === id)
      updateTheme({ mediaId: null, backgroundMode: "color" });
    await deleteMedia(id);
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Background mode */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-600 mb-2">
          Live wallpaper
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => updateTheme({ backgroundMode: m.id })}
              className={`px-3 py-2 rounded-lg text-sm border ${
                theme.backgroundMode === m.id
                  ? "border-ember-500 bg-ember-500/15 text-ember-400"
                  : "border-slate-700 text-slate-50 hover:bg-slate-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Solid color picker */}
      {theme.backgroundMode === "color" && (
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-600">
            Background color
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={theme.background}
              onChange={(e) => updateTheme({ background: e.target.value })}
              className="w-12 h-9 rounded-md bg-transparent border border-slate-700 cursor-pointer"
            />
            <span className="text-sm text-slate-600">{theme.background}</span>
          </div>
        </div>
      )}

      {/* Animated gradient presets */}
      {theme.backgroundMode === "animated" && (
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-600">
            Preset
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ANIMATED_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => updateTheme({ animatedPreset: p.id })}
                className={`h-16 rounded-lg overflow-hidden relative border-2 ${
                  theme.animatedPreset === p.id
                    ? "border-ember-500"
                    : "border-slate-700"
                }`}
              >
                <div
                  className={`absolute inset-0 ${getPresetClassName(p.id)}`}
                />
                <span className="absolute bottom-1 left-2 text-xs text-white drop-shadow">
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image / video upload + library */}
      {(theme.backgroundMode === "image" ||
        theme.backgroundMode === "video") && (
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-600">
            {theme.backgroundMode === "image"
              ? "Background image"
              : "Background video loop"}
          </label>
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={theme.backgroundMode === "image" ? "image/*" : "video/*"}
              onChange={handleFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-700 text-slate-50 text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {uploading
                ? "Uploading…"
                : `Upload ${theme.backgroundMode === "image" ? "image" : "video"}…`}
            </button>
            {theme.backgroundMode === "video" && (
              <p className="text-xs text-slate-600 mt-1">
                Keep loops short and compressed (under ~20MB) — it's stored in
                the browser.
              </p>
            )}
          </div>

          {mediaList.filter((m) => m.kind === theme.backgroundMode).length >
            0 && (
            <div className="mt-3 space-y-1">
              <div className="text-xs text-slate-600 mb-1">
                Or reuse a previous upload:
              </div>
              {mediaList
                .filter((m) => m.kind === theme.backgroundMode)
                .map((m) => (
                  <MediaRow
                    key={m.id}
                    media={m}
                    active={theme.mediaId === m.id}
                    onSelect={() => updateTheme({ mediaId: m.id })}
                    onDelete={() => handleDeleteMedia(m.id)}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Readability scrim, shown whenever there's a wallpaper to dim */}
      {theme.backgroundMode !== "color" && (
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-600">
            Dim overlay ({Math.round(theme.overlayOpacity * 100)}%)
          </label>
          <input
            type="range"
            min={0}
            max={0.85}
            step={0.05}
            value={theme.overlayOpacity}
            onChange={(e) =>
              updateTheme({ overlayOpacity: Number(e.target.value) })
            }
            className="w-full mt-2 accent-ember-500"
          />
          <p className="text-xs text-slate-600 mt-1">
            Darkens the wallpaper so lyrics stay readable.
          </p>
        </div>
      )}

      {/* Text + accent colors */}
      <div>
        <label className="text-xs uppercase tracking-wide text-slate-600">
          Text color
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={theme.textColor}
            onChange={(e) => updateTheme({ textColor: e.target.value })}
            className="w-12 h-9 rounded-md bg-transparent border border-slate-700 cursor-pointer"
          />
          <span className="text-sm text-slate-600">{theme.textColor}</span>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-slate-600">
          Font size
        </label>
        <select
          value={theme.fontSize}
          onChange={(e) => updateTheme({ fontSize: e.target.value })}
          className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none focus:border-ember-500"
        >
          <option value="clamp(1.8rem, 4vw, 3.5rem)">Small</option>
          <option value="clamp(2.2rem, 5vw, 4.5rem)">Medium (default)</option>
          <option value="clamp(2.8rem, 6vw, 5.5rem)">Large</option>
          <option value="clamp(3.4rem, 7vw, 6.5rem)">Extra large</option>
        </select>
      </div>
    </div>
  );
}

function MediaRow({ media, active, onSelect, onDelete }) {
  const url = useMediaUrl(media.id);
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${
        active
          ? "border-ember-500 bg-ember-500/10"
          : "border-slate-700 hover:bg-slate-800"
      }`}
    >
      <button
        onClick={onSelect}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <div className="w-9 h-9 rounded bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
          {media.kind === "image" && url && (
            <img src={url} alt="" className="w-full h-full object-cover" />
          )}
          {media.kind === "video" && (
            <span className="text-slate-600 text-xs">▶</span>
          )}
        </div>
        <span className="text-sm text-slate-50 truncate">{media.name}</span>
      </button>
      <button
        onClick={onDelete}
        className="text-slate-600 hover:text-red-400 px-1 text-sm"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
