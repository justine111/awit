import { useRef, useState, useEffect } from "react";
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

// Available slide fonts. System fonts need no loading; Google Fonts are
// loaded on demand by appending a <link> tag the first time they're selected.
const FONT_OPTIONS = [
  {
    id: "geist",
    label: "Geist (default)",
    value: "'Geist Variable', sans-serif",
    googleFont: null,
  },
  {
    id: "inter",
    label: "Inter",
    value: "'Inter', sans-serif",
    googleFont: "Inter:wght@600;700",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    value: "'Playfair Display', serif",
    googleFont: "Playfair+Display:wght@700",
  },
  {
    id: "oswald",
    label: "Oswald",
    value: "'Oswald', sans-serif",
    googleFont: "Oswald:wght@500;700",
  },
  {
    id: "raleway",
    label: "Raleway",
    value: "'Raleway', sans-serif",
    googleFont: "Raleway:wght@600;700",
  },
  {
    id: "georgia",
    label: "Georgia (classic)",
    value: "Georgia, serif",
    googleFont: null,
  },
  {
    id: "impact",
    label: "Impact (bold)",
    value: "Impact, 'Arial Narrow', sans-serif",
    googleFont: null,
  },
];

const PRESET_STORAGE_KEY = "verseside-theme-presets";
const MAX_PRESETS = 3;

// Slide font sizes. `value` is the real clamp() used on the live slide;
// `previewSize` is a much smaller cap used only inside the tiny live-preview
// card so the four options are visibly different there too, without
// overflowing the small preview box (the real vw-based clamp is tuned for
// a full-screen slide, not a thumbnail).
const FONT_SIZE_OPTIONS = [
  {
    id: "sm",
    label: "Small",
    value: "clamp(1.8rem, 4vw, 3.5rem)",
    previewSize: "0.85rem",
  },
  {
    id: "md",
    label: "Medium (default)",
    value: "clamp(2.2rem, 5vw, 4.5rem)",
    previewSize: "1.05rem",
  },
  {
    id: "lg",
    label: "Large",
    value: "clamp(2.8rem, 6vw, 5.5rem)",
    previewSize: "1.3rem",
  },
  {
    id: "xl",
    label: "Extra large",
    value: "clamp(3.4rem, 7vw, 6.5rem)",
    previewSize: "1.55rem",
  },
];

function loadPresets() {
  try {
    return JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function savePresets(presets) {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
}

function loadGoogleFont(fontSpec) {
  if (!fontSpec) return;
  const id = `gf-${fontSpec.replace(/[^a-z0-9]/gi, "")}`;
  if (document.getElementById(id)) return; // already loaded
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontSpec}&display=swap`;
  document.head.appendChild(link);
}

// WCAG relative-luminance contrast ratio between two hex colors, used to
// warn when text won't be readable against a solid background.
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function relativeLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA, hexB) {
  try {
    const lA = relativeLuminance(hexToRgb(hexA));
    const lB = relativeLuminance(hexToRgb(hexB));
    const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return null;
  }
}

// ─── Mini live preview ──────────────────────────────────────────────────────

function ThemePreviewCard({ theme }) {
  const bgClass =
    theme.backgroundMode === "animated"
      ? getPresetClassName(theme.animatedPreset)
      : "";

  const sizeOption =
    FONT_SIZE_OPTIONS.find((f) => f.value === theme.fontSize) ??
    FONT_SIZE_OPTIONS[1];

  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden border border-border"
      style={{
        background:
          theme.backgroundMode === "color" ? theme.background : "#0a0c10",
      }}
    >
      {theme.backgroundMode === "animated" && (
        <div className={`absolute inset-0 ${bgClass}`} />
      )}
      {theme.backgroundMode !== "color" && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${theme.overlayOpacity})` }}
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center gap-1">
        <p
          className="font-bold leading-tight"
          style={{
            color: theme.textColor,
            fontSize: `clamp(0.75rem, 3vw, ${sizeOption.previewSize})`,
            fontFamily: theme.fontFamily,
          }}
        >
          Great is Your faithfulness
        </p>
        <p
          className="text-xs font-semibold"
          style={{ color: theme.accentColor }}
        >
          Verse 1
        </p>
      </div>
    </div>
  );
}

// Tiny background thumbnail shown next to each saved preset's name, so
// presets are visually distinguishable without opening each one.
function PresetSwatch({ theme }) {
  const showImage = theme.backgroundMode === "image" && !!theme.mediaId;
  const url = useMediaUrl(theme.mediaId);
  const bgClass =
    theme.backgroundMode === "animated"
      ? getPresetClassName(theme.animatedPreset)
      : "";

  return (
    <div
      className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-border"
      style={{
        background:
          theme.backgroundMode === "color" ? theme.background : "#0a0c10",
      }}
    >
      {theme.backgroundMode === "animated" && (
        <div className={`absolute inset-0 ${bgClass}`} />
      )}
      {showImage && url && (
        <img
          src={url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {theme.backgroundMode === "video" && (
        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-muted-foreground">
          ▶
        </span>
      )}
      <span
        className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black/40"
        style={{ backgroundColor: theme.accentColor }}
      />
    </div>
  );
}

// ─── Main panel ─────────────────────────────────────────────────────────────

export default function ThemeSettingsPanel() {
  const theme = useControlStore((s) => s.theme);
  const updateTheme = useControlStore((s) => s.updateTheme);
  const resetTheme = useControlStore((s) => s.resetTheme);

  const mediaList =
    useLiveQuery(() => db.media.orderBy("createdAt").reverse().toArray(), []) ??
    [];
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Theme presets stored in localStorage
  const [presets, setPresets] = useState(loadPresets);
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm } | null
  const importInputRef = useRef(null);

  // Live-preview drafts for color/range inputs: updated instantly on every
  // onChange for a responsive slider/swatch and preview, but the actual
  // store write (updateTheme) is debounced so dragging a slider doesn't
  // fire dozens of writes/persists per second.
  const [draft, setDraft] = useState({});
  const debounceTimers = useRef({});
  function setLive(key, value, delay = 250) {
    setDraft((d) => ({ ...d, [key]: value }));
    clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => {
      updateTheme({ [key]: value });
      setDraft((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
    }, delay);
  }
  const previewTheme = { ...theme, ...draft };

  // Inline preset rename
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  function commitRename(i) {
    const name = renameValue.trim();
    if (name) {
      setPresets((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, name } : p)),
      );
    }
    setRenamingIndex(null);
  }

  // Reset-to-defaults undo window
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const undoTimeoutRef = useRef(null);
  function handleResetConfirmed() {
    clearTimeout(undoTimeoutRef.current);
    setUndoSnapshot({ ...theme });
    resetTheme();
    undoTimeoutRef.current = setTimeout(() => setUndoSnapshot(null), 6000);
  }
  function handleUndoReset() {
    clearTimeout(undoTimeoutRef.current);
    if (undoSnapshot) updateTheme(undoSnapshot);
    setUndoSnapshot(null);
  }

  // Keep presets in localStorage in sync
  useEffect(() => {
    savePresets(presets);
  }, [presets]);

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

  async function performDeleteMedia(id) {
    if (theme.mediaId === id)
      updateTheme({ mediaId: null, backgroundMode: "color" });
    // Clean up any presets pointing at this media so applying them later
    // doesn't fall back silently — they still work, just with a solid color.
    setPresets((prev) =>
      prev.map((p) =>
        p.theme.mediaId === id
          ? {
              ...p,
              theme: { ...p.theme, mediaId: null, backgroundMode: "color" },
            }
          : p,
      ),
    );
    await deleteMedia(id);
  }

  function handleDeleteMedia(id) {
    const affected = presets
      .filter((p) => p.theme.mediaId === id)
      .map((p) => p.name);
    if (affected.length > 0) {
      setConfirmDialog({
        message: `This is used in the preset${affected.length > 1 ? "s" : ""} "${affected.join('", "')}". Deleting it will reset ${affected.length > 1 ? "those presets" : "that preset"} to a solid color. Continue?`,
        onConfirm: () => performDeleteMedia(id),
      });
    } else {
      performDeleteMedia(id);
    }
  }

  function handleFontChange(fontId) {
    const opt = FONT_OPTIONS.find((f) => f.id === fontId);
    if (!opt) return;
    if (opt.googleFont) loadGoogleFont(opt.googleFont);
    updateTheme({ fontFamily: opt.value });
  }

  function savePreset() {
    const name = presetName.trim() || `Preset ${presets.length + 1}`;
    const newPresets = [
      ...presets.slice(0, MAX_PRESETS - 1),
      { name, theme: { ...theme } },
    ];
    setPresets(newPresets);
    setPresetName("");
    setShowPresetInput(false);
  }

  function applyPreset(preset) {
    // Load Google Font if needed
    const fontOpt = FONT_OPTIONS.find(
      (f) => f.value === preset.theme.fontFamily,
    );
    if (fontOpt?.googleFont) loadGoogleFont(fontOpt.googleFont);

    // Guard against a dangling media reference (the image/video this preset
    // pointed at may have been deleted since it was saved) — fall back to a
    // solid background instead of silently showing nothing.
    const needsMedia =
      preset.theme.backgroundMode === "image" ||
      preset.theme.backgroundMode === "video";
    const mediaStillExists =
      !needsMedia || mediaList.some((m) => m.id === preset.theme.mediaId);

    updateTheme(
      mediaStillExists
        ? preset.theme
        : { ...preset.theme, backgroundMode: "color", mediaId: null },
    );
  }

  function deletePreset(i) {
    setPresets((p) => p.filter((_, idx) => idx !== i));
  }

  function exportPresets() {
    const blob = new Blob([JSON.stringify(presets, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "verseside-theme-presets.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("Not a preset list");
        const valid = parsed.filter(
          (p) => p && typeof p.name === "string" && p.theme,
        );
        if (valid.length === 0) throw new Error("No valid presets found");

        const doImport = () => {
          setPresets((prev) => {
            // Merge: an imported preset with the same name replaces the
            // existing one; anything new is appended. Then keep only the
            // most recent MAX_PRESETS overall.
            const byName = new Map(prev.map((p) => [p.name, p]));
            for (const p of valid) byName.set(p.name, p);
            return Array.from(byName.values()).slice(-MAX_PRESETS);
          });
        };

        setConfirmDialog({
          message: `Import ${valid.length} preset(s)? They'll be merged into your saved presets (kept to the most recent ${MAX_PRESETS}).`,
          onConfirm: doImport,
        });
      } catch {
        setConfirmDialog({
          message: "That file doesn't look like a valid presets export.",
          onConfirm: null,
        });
      }
    };
    reader.readAsText(file);
  }

  // Determine current font ID for the selector
  const currentFontId =
    FONT_OPTIONS.find((f) => f.value === theme.fontFamily)?.id ?? "geist";

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5 bg-card text-foreground">
      {/* Live preview */}
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Live preview
        </div>
        <ThemePreviewCard theme={previewTheme} />
      </div>

      {/* Theme presets */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Saved presets
          </div>
          <button
            onClick={() => setShowPresetInput((v) => !v)}
            className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer transition-colors"
          >
            {presets.length < MAX_PRESETS
              ? "+ Save current"
              : "+ Save (replaces oldest)"}
          </button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={exportPresets}
            disabled={presets.length === 0}
            className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Export presets
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            Import presets
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        {showPresetInput && (
          <div className="flex gap-2 mb-2">
            <input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name…"
              className="flex-1 bg-background border border-input rounded-lg px-2 py-1 text-sm text-foreground outline-none focus:border-amber-500"
              onKeyDown={(e) => e.key === "Enter" && savePreset()}
            />
            <button
              onClick={savePreset}
              className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-amber-400"
            >
              Save
            </button>
          </div>
        )}
        {presets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No presets saved yet.</p>
        ) : (
          <div className="space-y-1">
            {presets.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-input hover:bg-muted group"
              >
                <PresetSwatch theme={p.theme} />
                {renamingIndex === i ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(i);
                      if (e.key === "Escape") setRenamingIndex(null);
                    }}
                    onBlur={() => commitRename(i)}
                    className="flex-1 min-w-0 bg-background border border-amber-500 rounded px-1.5 py-0.5 text-sm text-foreground outline-none"
                  />
                ) : (
                  <button
                    onClick={() => applyPreset(p)}
                    className="flex-1 text-left text-sm text-foreground cursor-pointer truncate"
                    title={`Apply preset: ${p.name}`}
                  >
                    {p.name}
                  </button>
                )}
                <button
                  onClick={() => {
                    setRenamingIndex(i);
                    setRenameValue(p.name);
                  }}
                  className="text-muted-foreground hover:text-amber-500 text-xs opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  aria-label={`Rename preset ${p.name}`}
                >
                  ✎
                </button>
                <button
                  onClick={() => deletePreset(i)}
                  className="text-muted-foreground hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  aria-label={`Delete preset ${p.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Background mode */}
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Live wallpaper
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => updateTheme({ backgroundMode: m.id })}
              aria-pressed={theme.backgroundMode === m.id}
              className={`px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                theme.backgroundMode === m.id
                  ? "border-amber-500 bg-amber-500/10 text-amber-500 font-medium"
                  : "border-input text-foreground hover:bg-muted"
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
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Background color
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={draft.background ?? theme.background}
              onChange={(e) => setLive("background", e.target.value)}
              className="w-12 h-9 rounded-md bg-transparent border border-input cursor-pointer"
              aria-label="Background color"
            />
            <span className="text-sm text-muted-foreground font-mono">
              {draft.background ?? theme.background}
            </span>
          </div>
        </div>
      )}

      {/* Animated gradient presets */}
      {theme.backgroundMode === "animated" && (
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Preset
            </label>
            <button
              onClick={() => {
                const others = ANIMATED_PRESETS.filter(
                  (p) => p.id !== theme.animatedPreset,
                );
                const pool = others.length > 0 ? others : ANIMATED_PRESETS;
                const pick = pool[Math.floor(Math.random() * pool.length)];
                updateTheme({ animatedPreset: pick.id });
              }}
              className="text-[11px] text-amber-500 hover:text-amber-400 cursor-pointer transition-colors"
            >
              🎲 Randomize
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ANIMATED_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => updateTheme({ animatedPreset: p.id })}
                aria-pressed={theme.animatedPreset === p.id}
                className={`h-16 rounded-lg overflow-hidden relative border-2 cursor-pointer transition-all ${
                  theme.animatedPreset === p.id
                    ? "border-amber-500 scale-[0.98]"
                    : "border-input hover:border-foreground/45"
                }`}
              >
                <div
                  className={`absolute inset-0 ${getPresetClassName(p.id)}`}
                />
                <span className="absolute bottom-1 left-2 text-xs text-white drop-shadow font-semibold">
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
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
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
              className="w-full px-3 py-2 rounded-lg border border-dashed border-input text-foreground text-sm hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              {uploading
                ? "Uploading…"
                : `Upload ${theme.backgroundMode === "image" ? "image" : "video"}…`}
            </button>
            {theme.backgroundMode === "video" && (
              <p className="text-xs text-muted-foreground mt-1">
                Keep loops short and compressed (under ~20MB) — stored in the
                browser.
              </p>
            )}
          </div>

          {mediaList.filter((m) => m.kind === theme.backgroundMode).length >
            0 && (
            <div className="mt-3 space-y-1">
              <div className="text-xs text-muted-foreground mb-1">
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

      {/* Dim overlay */}
      {theme.backgroundMode !== "color" && (
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Dim overlay (
            {Math.round((draft.overlayOpacity ?? theme.overlayOpacity) * 100)}%)
          </label>
          <input
            type="range"
            min={0}
            max={0.85}
            step={0.05}
            value={draft.overlayOpacity ?? theme.overlayOpacity}
            onChange={(e) => setLive("overlayOpacity", Number(e.target.value))}
            className="w-full mt-2 accent-amber-500 cursor-pointer"
            aria-label="Dim overlay percentage"
          />
        </div>
      )}

      {/* Text color */}
      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Text color
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={draft.textColor ?? theme.textColor}
            onChange={(e) => setLive("textColor", e.target.value)}
            className="w-12 h-9 rounded-md bg-transparent border border-input cursor-pointer"
            aria-label="Text color"
          />
          <span className="text-sm text-muted-foreground font-mono">
            {draft.textColor ?? theme.textColor}
          </span>
        </div>
        {theme.backgroundMode === "color" &&
          (() => {
            const ratio = contrastRatio(
              draft.background ?? theme.background,
              draft.textColor ?? theme.textColor,
            );
            return ratio !== null && ratio < 3 ? (
              <p className="text-xs text-amber-500 mt-1">
                ⚠️ Low contrast ({ratio.toFixed(1)}:1) against your background —
                may be hard to read on screen.
              </p>
            ) : null;
          })()}
      </div>

      {/* Accent color (verse labels, slide labels) */}
      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Accent color{" "}
          <span className="normal-case text-muted-foreground/60">(labels)</span>
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={draft.accentColor ?? theme.accentColor}
            onChange={(e) => setLive("accentColor", e.target.value)}
            className="w-12 h-9 rounded-md bg-transparent border border-input cursor-pointer"
            aria-label="Accent color"
          />
          <span className="text-sm text-muted-foreground font-mono">
            {draft.accentColor ?? theme.accentColor}
          </span>
        </div>
      </div>

      {/* Font size */}
      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Font size
        </label>
        <select
          value={theme.fontSize}
          onChange={(e) => updateTheme({ fontSize: e.target.value })}
          className="mt-2 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-amber-500 cursor-pointer"
          aria-label="Font size"
        >
          {FONT_SIZE_OPTIONS.map((f) => (
            <option key={f.id} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font family */}
      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">
          Font family
        </label>
        <select
          value={currentFontId}
          onChange={(e) => handleFontChange(e.target.value)}
          className="mt-2 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-amber-500 cursor-pointer"
          aria-label="Font family"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
              {f.googleFont ? " (loads from Google Fonts)" : ""}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Google Fonts require an internet connection on first use.
        </p>
      </div>

      {/* Pre-Service Idle Screen customization */}
      <div className="pt-3 border-t border-border/80">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            ⏱️ Pre-Service Countdown & Idle Screen
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={theme.idleSettings?.enabled ?? true}
              onChange={(e) =>
                updateTheme({
                  idleSettings: {
                    ...(theme.idleSettings || {}),
                    enabled: e.target.checked,
                  },
                })
              }
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sky-700"></div>
          </label>
        </div>

        {(theme.idleSettings?.enabled ?? true) && (
          <div className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border/60">
            {/* Main Title */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Main Heading
              </label>
              <input
                type="text"
                value={theme.idleSettings?.title ?? "SERVICE STARTS IN"}
                onChange={(e) =>
                  updateTheme({
                    idleSettings: {
                      ...(theme.idleSettings || {}),
                      title: e.target.value,
                    },
                  })
                }
                placeholder="e.g. SERVICE STARTS IN"
                className="mt-1 w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs text-foreground font-semibold outline-none focus:border-sky-700"
              />
            </div>

            {/* Countdown Timer Settings */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground">
                  Countdown Timer
                </span>
                <input
                  type="checkbox"
                  checked={theme.idleSettings?.timerEnabled ?? true}
                  onChange={(e) =>
                    updateTheme({
                      idleSettings: {
                        ...(theme.idleSettings || {}),
                        timerEnabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded cursor-pointer accent-sky-700"
                />
              </div>

              {(theme.idleSettings?.timerEnabled ?? true) && (
                <div className="space-y-2">
                  <div className="flex gap-1 p-0.5 rounded-lg bg-muted/40 border border-border/60">
                    {[
                      { id: "duration", label: "Duration from now" },
                      { id: "target", label: "At specific time" },
                    ].map((opt) => {
                      const active =
                        (theme.idleSettings?.timerMode ?? "duration") ===
                        opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() =>
                            updateTheme({
                              idleSettings: {
                                ...(theme.idleSettings || {}),
                                timerMode: opt.id,
                              },
                            })
                          }
                          aria-pressed={active}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                            active
                              ? "bg-sky-700 text-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {(theme.idleSettings?.timerMode ?? "duration") ===
                  "target" ? (
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Target Time (24h)
                      </label>
                      <input
                        type="time"
                        value={theme.idleSettings?.targetTime ?? "10:00"}
                        onChange={(e) =>
                          updateTheme({
                            idleSettings: {
                              ...(theme.idleSettings || {}),
                              targetTime: e.target.value,
                            },
                          })
                        }
                        className="mt-1 w-full bg-background border border-input rounded-lg px-2 py-1 text-xs text-foreground font-mono outline-none focus:border-sky-700"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Minutes Duration
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={theme.idleSettings?.durationMinutes ?? 10}
                        onChange={(e) =>
                          updateTheme({
                            idleSettings: {
                              ...(theme.idleSettings || {}),
                              durationMinutes: Number(e.target.value),
                            },
                          })
                        }
                        className="mt-1 w-full bg-background border border-input rounded-lg px-2 py-1 text-xs text-foreground font-mono outline-none focus:border-sky-700"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="pt-2 border-t border-border space-y-2">
        <button
          onClick={() =>
            setConfirmDialog({
              message: "Reset all theme settings to defaults?",
              onConfirm: handleResetConfirmed,
            })
          }
          className="w-full py-2 rounded-lg border border-input text-muted-foreground hover:text-red-500 hover:border-red-500/40 text-sm cursor-pointer transition-colors"
        >
          Reset to defaults
        </button>
        {undoSnapshot && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs">
            <span className="text-muted-foreground">
              Theme reset to defaults.
            </span>
            <button
              onClick={handleUndoReset}
              className="text-amber-500 hover:text-amber-400 font-semibold cursor-pointer"
            >
              Undo
            </button>
          </div>
        )}
      </div>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={
            confirmDialog.onConfirm
              ? () => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }
              : null
          }
        />
      )}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="w-full max-w-xs rounded-xl border border-border bg-card p-4 space-y-4 shadow-xl">
        <p className="text-sm text-foreground">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            {onConfirm ? "Cancel" : "OK"}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-500 cursor-pointer transition-colors"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaRow({ media, active, onSelect, onDelete }) {
  const url = useMediaUrl(media.id);
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${
        active
          ? "border-amber-500 bg-amber-500/10"
          : "border-input hover:bg-muted"
      }`}
    >
      <button
        onClick={onSelect}
        className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
        aria-label={`Use ${media.name}`}
      >
        <div className="w-9 h-9 rounded bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {media.kind === "image" && url && (
            <img src={url} alt="" className="w-full h-full object-cover" />
          )}
          {media.kind === "video" && (
            <span className="text-muted-foreground text-xs">▶</span>
          )}
        </div>
        <span className="text-sm text-foreground truncate">{media.name}</span>
      </button>
      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-red-500 px-1 text-sm cursor-pointer"
        title="Delete"
        aria-label={`Delete ${media.name}`}
      >
        ✕
      </button>
    </div>
  );
}
