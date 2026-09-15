import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import {
  BIBLE_BOOKS,
  TRANSLATIONS,
  OFFLINE_VERSES,
  fetchBiblePassage,
} from "@/data/bibleData";
import { useControlStore } from "@/store/useControlStore";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search } from "lucide-react";

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const fuse = new Fuse(OFFLINE_VERSES, {
  keys: ["text", "book"],
  threshold: 0.3,
  includeScore: true,
});

function PassagePreview({ result, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-5 text-muted-foreground/60 text-sm">
        <span className="animate-pulse">Loading…</span>
      </div>
    );
  }
  if (error) {
    return <p className="text-[11px] text-red-400/80 py-2 px-1">{error}</p>;
  }
  if (!result || result.verses.length === 0) return null;

  return (
    <div className="rounded-lg border border-white/8 bg-white/3 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-sky-400">{result.reference}</span>
        <span className="text-[10px] text-muted-foreground/40">
          {result.translationName}{result.offline && " · offline"}
        </span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {result.verses.map((v) => (
          <p key={v.verse} className="text-[11px] text-foreground/75 leading-relaxed">
            <sup className="text-sky-400/80 font-bold mr-1 not-italic">{v.verse}</sup>
            {v.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function BibleBrowserPanel() {
  const addToServiceOrder = useControlStore((s) => s.addToServiceOrder);
  const [translation, setTranslation] = useState("esv");
  const [mode, setMode] = useState("browse");

  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS[42]); // John
  const [chapter, setChapter] = useState(3);
  const [startVerse, setStartVerse] = useState(2);
  const [endVerse, setEndVerse] = useState(4);
  const [passageResult, setPassageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [query, setQuery] = useState("");
  const searchResults = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : OFFLINE_VERSES.slice(0, 20);

  // Fetch passage when picker changes (debounced)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce(async (book, ch, sv, ev, tr) => {
      setLoading(true);
      setFetchError("");
      const result = await fetchBiblePassage(book.name, ch, sv, ev || sv, tr);
      setLoading(false);
      if (result.error) {
        setFetchError(result.error);
        setPassageResult(null);
      } else {
        setPassageResult(result);
      }
    }, 600),
    [],
  );

  useEffect(() => {
    if (mode === "browse") {
      debouncedFetch(selectedBook, chapter, startVerse, endVerse, translation);
    }
  }, [
    selectedBook,
    chapter,
    startVerse,
    endVerse,
    translation,
    mode,
    debouncedFetch,
  ]);

  // Build a service-order item with 1 slide per verse for high readability
  function handleAddPassage() {
    if (!passageResult || passageResult.verses.length === 0) return;
    const trName = passageResult.translationName ?? translation.toUpperCase();

    const bookChapter = passageResult.reference.split(":")[0];
    const slides = passageResult.verses.map((v) => {
      const verseRef = `${bookChapter}:${v.verse}`;
      return {
        label: verseRef,
        lines: [`${v.verse} ${v.text}`, `${verseRef} (${trName})`],
      };
    });

    addToServiceOrder({
      id: `verse-${passageResult.reference}-${Date.now()}`,
      type: "verse",
      title: passageResult.reference,
      slides,
    });
  }

  function handleAddSearchVerse(v) {
    const ref = `${v.book} ${v.chapter}:${v.verse}`;
    addToServiceOrder({
      id: `verse-${ref}-${Date.now()}`,
      type: "verse",
      title: ref,
      slides: [
        {
          label: ref,
          lines: [`${v.verse} ${v.text}`, `${ref} (KJV)`],
        },
      ],
    });
  }

  function handleChapterChange(val) {
    const n = Math.max(1, Math.min(Number(val) || 1, selectedBook.chapters));
    setChapter(n);
  }

  return (
    <div className="flex flex-col h-full text-foreground">
      {/* Translation bar */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2 border-b border-border">
        <span className="text-xs text-muted-foreground shrink-0">
          Translation:
        </span>
        <div className="flex gap-1 flex-wrap">
          {TRANSLATIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTranslation(t.id)}
              title={t.name}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${translation === t.id
                  ? "bg-sky-700 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-border">
        {["browse", "search"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer ${mode === m
                ? "text-white border-b-2 border-sky-700"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {m === "browse" ? (
              <>
                <BookOpen size={16} /> Browse
              </>
            ) : (
              <>
                <Search size={16} /> Search
              </>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* ── Browse Mode ── */}
        {mode === "browse" && (
          <div className="p-3 space-y-3">
            {/* Book selector */}
            <div>
              <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Book
              </label>
              <Select
                value={selectedBook.name}
                onValueChange={(val) => {
                  const book = BIBLE_BOOKS.find((b) => b.name === val);
                  if (book) {
                    setSelectedBook(book);
                    setChapter(1);
                    setStartVerse(1);
                    setEndVerse(1);
                  }
                }}
              >
                <SelectTrigger className="mt-1 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground outline-none cursor-pointer">
                  <SelectValue placeholder="Select a book..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Old Testament</SelectLabel>
                    {BIBLE_BOOKS.filter((b) => b.testament === "OT").map(
                      (b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>New Testament</SelectLabel>
                    {BIBLE_BOOKS.filter((b) => b.testament === "NT").map(
                      (b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Chapter / Verse range */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Chapter
                </label>
                <Input
                  type="number"
                  min={1}
                  max={selectedBook.chapters}
                  value={chapter}
                  onChange={(e) => handleChapterChange(e.target.value)}
                  className="mt-1 w-full bg-background border border-input rounded-lg px-2 py-2 text-sm text-foreground outline-none focus:border-amber-500 text-center"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  From verse
                </label>
                <Input
                  type="number"
                  min={1}
                  value={startVerse}
                  onChange={(e) => {
                    const v = Math.max(1, Number(e.target.value) || 1);
                    setStartVerse(v);
                    if (endVerse < v) setEndVerse(v);
                  }}
                  className="mt-1 w-full bg-background border border-input rounded-lg px-2 py-2 text-sm text-foreground outline-none focus:border-amber-500 text-center"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  To verse
                </label>
                <Input
                  type="number"
                  min={startVerse}
                  value={endVerse}
                  onChange={(e) => {
                    const v = Math.max(
                      startVerse,
                      Number(e.target.value) || startVerse,
                    );
                    setEndVerse(v);
                  }}
                  className="mt-1 w-full bg-background border border-input rounded-lg px-2 py-2 text-sm text-foreground outline-none focus:border-amber-500 text-center"
                />
              </div>
            </div>

            {/* Passage preview */}
            <PassagePreview
              result={passageResult}
              loading={loading}
              error={fetchError}
            />

            {/* Add button */}
            <button
              onClick={handleAddPassage}
              disabled={!passageResult || passageResult.verses.length === 0}
              className="w-full py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-bold disabled:opacity-30 transition-all cursor-pointer shadow-md shadow-sky-500/20"
            >
              + Add to Service Order
            </button>
          </div>
        )}

        {/* ── Search Mode ── */}
        {mode === "search" && (
          <div className="p-3 space-y-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verses or book name…"
              className="w-full bg-transparent text-foreground border border-input placeholder:text-muted-foreground focus-visible:border-ring outline-none h-8 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Searching {OFFLINE_VERSES.length} key passages (KJV, offline)
            </p>
            <div className="space-y-1">
              {searchResults.map((v) => {
                const ref = `${v.book} ${v.chapter}:${v.verse}`;
                return (
                  <button
                    key={ref}
                    onClick={() => handleAddSearchVerse(v)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/4 border border-transparent hover:border-white/6 text-sm group cursor-pointer text-foreground transition-all"
                  >
                    <div className="text-sky-400 text-[10px] font-bold mb-0.5">{ref}</div>
                    <div className="text-foreground/70 line-clamp-2 text-[11px]">{v.text}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
