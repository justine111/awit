// All 66 canonical Bible books with chapter counts.
// Used to build the book/chapter picker in BibleBrowserPanel.
export const BIBLE_BOOKS = [
  // Old Testament
  { name: "Genesis", abbr: "Gen", chapters: 50, testament: "OT" },
  { name: "Exodus", abbr: "Exod", chapters: 40, testament: "OT" },
  { name: "Leviticus", abbr: "Lev", chapters: 27, testament: "OT" },
  { name: "Numbers", abbr: "Num", chapters: 36, testament: "OT" },
  { name: "Deuteronomy", abbr: "Deut", chapters: 34, testament: "OT" },
  { name: "Joshua", abbr: "Josh", chapters: 24, testament: "OT" },
  { name: "Judges", abbr: "Judg", chapters: 21, testament: "OT" },
  { name: "Ruth", abbr: "Ruth", chapters: 4, testament: "OT" },
  { name: "1 Samuel", abbr: "1Sam", chapters: 31, testament: "OT" },
  { name: "2 Samuel", abbr: "2Sam", chapters: 24, testament: "OT" },
  { name: "1 Kings", abbr: "1Kgs", chapters: 22, testament: "OT" },
  { name: "2 Kings", abbr: "2Kgs", chapters: 25, testament: "OT" },
  { name: "1 Chronicles", abbr: "1Chr", chapters: 29, testament: "OT" },
  { name: "2 Chronicles", abbr: "2Chr", chapters: 36, testament: "OT" },
  { name: "Ezra", abbr: "Ezra", chapters: 10, testament: "OT" },
  { name: "Nehemiah", abbr: "Neh", chapters: 13, testament: "OT" },
  { name: "Esther", abbr: "Esth", chapters: 10, testament: "OT" },
  { name: "Job", abbr: "Job", chapters: 42, testament: "OT" },
  { name: "Psalms", abbr: "Ps", chapters: 150, testament: "OT" },
  { name: "Proverbs", abbr: "Prov", chapters: 31, testament: "OT" },
  { name: "Ecclesiastes", abbr: "Eccl", chapters: 12, testament: "OT" },
  { name: "Song of Solomon", abbr: "Song", chapters: 8, testament: "OT" },
  { name: "Isaiah", abbr: "Isa", chapters: 66, testament: "OT" },
  { name: "Jeremiah", abbr: "Jer", chapters: 52, testament: "OT" },
  { name: "Lamentations", abbr: "Lam", chapters: 5, testament: "OT" },
  { name: "Ezekiel", abbr: "Ezek", chapters: 48, testament: "OT" },
  { name: "Daniel", abbr: "Dan", chapters: 12, testament: "OT" },
  { name: "Hosea", abbr: "Hos", chapters: 14, testament: "OT" },
  { name: "Joel", abbr: "Joel", chapters: 3, testament: "OT" },
  { name: "Amos", abbr: "Amos", chapters: 9, testament: "OT" },
  { name: "Obadiah", abbr: "Obad", chapters: 1, testament: "OT" },
  { name: "Jonah", abbr: "Jonah", chapters: 4, testament: "OT" },
  { name: "Micah", abbr: "Mic", chapters: 7, testament: "OT" },
  { name: "Nahum", abbr: "Nah", chapters: 3, testament: "OT" },
  { name: "Habakkuk", abbr: "Hab", chapters: 3, testament: "OT" },
  { name: "Zephaniah", abbr: "Zeph", chapters: 3, testament: "OT" },
  { name: "Haggai", abbr: "Hag", chapters: 2, testament: "OT" },
  { name: "Zechariah", abbr: "Zech", chapters: 14, testament: "OT" },
  { name: "Malachi", abbr: "Mal", chapters: 4, testament: "OT" },
  // New Testament
  { name: "Matthew", abbr: "Matt", chapters: 28, testament: "NT" },
  { name: "Mark", abbr: "Mark", chapters: 16, testament: "NT" },
  { name: "Luke", abbr: "Luke", chapters: 24, testament: "NT" },
  { name: "John", abbr: "John", chapters: 21, testament: "NT" },
  { name: "Acts", abbr: "Acts", chapters: 28, testament: "NT" },
  { name: "Romans", abbr: "Rom", chapters: 16, testament: "NT" },
  { name: "1 Corinthians", abbr: "1Cor", chapters: 16, testament: "NT" },
  { name: "2 Corinthians", abbr: "2Cor", chapters: 13, testament: "NT" },
  { name: "Galatians", abbr: "Gal", chapters: 6, testament: "NT" },
  { name: "Ephesians", abbr: "Eph", chapters: 6, testament: "NT" },
  { name: "Philippians", abbr: "Phil", chapters: 4, testament: "NT" },
  { name: "Colossians", abbr: "Col", chapters: 4, testament: "NT" },
  { name: "1 Thessalonians", abbr: "1Thess", chapters: 5, testament: "NT" },
  { name: "2 Thessalonians", abbr: "2Thess", chapters: 3, testament: "NT" },
  { name: "1 Timothy", abbr: "1Tim", chapters: 6, testament: "NT" },
  { name: "2 Timothy", abbr: "2Tim", chapters: 4, testament: "NT" },
  { name: "Titus", abbr: "Titus", chapters: 3, testament: "NT" },
  { name: "Philemon", abbr: "Phlm", chapters: 1, testament: "NT" },
  { name: "Hebrews", abbr: "Heb", chapters: 13, testament: "NT" },
  { name: "James", abbr: "Jas", chapters: 5, testament: "NT" },
  { name: "1 Peter", abbr: "1Pet", chapters: 5, testament: "NT" },
  { name: "2 Peter", abbr: "2Pet", chapters: 3, testament: "NT" },
  { name: "1 John", abbr: "1John", chapters: 5, testament: "NT" },
  { name: "2 John", abbr: "2John", chapters: 1, testament: "NT" },
  { name: "3 John", abbr: "3John", chapters: 1, testament: "NT" },
  { name: "Jude", abbr: "Jude", chapters: 1, testament: "NT" },
  { name: "Revelation", abbr: "Rev", chapters: 22, testament: "NT" },
];

// Translations available via bolls.life (free, no key required, no rate-limit
// headaches). bolls.life mirrors a much wider set of translations than
// bible-api.com, including copyrighted ones (NIV, ESV) and several Tagalog
// versions.
//
// `id` is the STABLE identifier the rest of the app should keep using
// (unchanged from before, so nothing else needs to change). `bollsCode` is
// the code bolls.life expects in its URL and is only used inside this file.
//
// IMPORTANT: bolls.life's exact translation code list can shift over time
// and copyrighted translations (NIV/ESV) are only there for personal-use
// lookups, not for bundling/redistribution. If a code below 404s, check the
// current list at https://bolls.life/api/ and update `bollsCode` — nothing
// else in the app needs to change since `id` stays the same.
export const TRANSLATIONS = [
  {
    id: "kjv",
    label: "KJV",
    name: "King James Version",
    free: true,
    bollsCode: "KJV",
  },
  {
    id: "niv",
    label: "NIV",
    name: "New International Version",
    free: true,
    bollsCode: "NIV",
  },
  {
    id: "esv",
    label: "ESV",
    name: "English Standard Version",
    free: true,
    bollsCode: "ESV",
  },
  {
    id: "web",
    label: "WEB",
    name: "World English Bible",
    free: true,
    bollsCode: "WEB",
  },
  {
    id: "bbe",
    label: "BBE",
    name: "Bible in Basic English",
    free: true,
    bollsCode: "BBE",
  },
  {
    id: "asvx",
    label: "ASV",
    name: "American Standard Version",
    free: true,
    bollsCode: "ASV",
  },
  // Tagalog
  {
    id: "adb1905",
    label: "ADB (1905)",
    name: "Ang Dating Biblia (1905, Tagalog)",
    free: true,
    bollsCode: "ADB1905",
  },
  {
    id: "mbbtag",
    label: "MBB",
    name: "Magandang Balita Biblia (Tagalog)",
    free: true,
    bollsCode: "MBBTAG",
  },
];

// Offline fallback for the most-used worship passages.
// Shape: { ref: string, text: string, translation: "kjv" }
export const OFFLINE_VERSES = [
  {
    book: "John",
    chapter: 3,
    verse: 16,
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
  },
  {
    book: "John",
    chapter: 3,
    verse: 17,
    text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
  },
  {
    book: "Psalms",
    chapter: 23,
    verse: 1,
    text: "The LORD is my shepherd; I shall not want.",
  },
  {
    book: "Psalms",
    chapter: 23,
    verse: 2,
    text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
  },
  {
    book: "Psalms",
    chapter: 23,
    verse: 3,
    text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
  },
  {
    book: "Psalms",
    chapter: 23,
    verse: 4,
    text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
  },
  {
    book: "Psalms",
    chapter: 23,
    verse: 6,
    text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.",
  },
  {
    book: "Romans",
    chapter: 8,
    verse: 28,
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
  },
  {
    book: "Romans",
    chapter: 8,
    verse: 38,
    text: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,",
  },
  {
    book: "Romans",
    chapter: 8,
    verse: 39,
    text: "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.",
  },
  {
    book: "Philippians",
    chapter: 4,
    verse: 13,
    text: "I can do all things through Christ which strengtheneth me.",
  },
  {
    book: "Philippians",
    chapter: 4,
    verse: 6,
    text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
  },
  {
    book: "Philippians",
    chapter: 4,
    verse: 7,
    text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
  },
  {
    book: "Isaiah",
    chapter: 40,
    verse: 31,
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
  },
  {
    book: "Isaiah",
    chapter: 41,
    verse: 10,
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
  },
  {
    book: "Jeremiah",
    chapter: 29,
    verse: 11,
    text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
  },
  {
    book: "Matthew",
    chapter: 28,
    verse: 19,
    text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:",
  },
  {
    book: "Matthew",
    chapter: 28,
    verse: 20,
    text: "Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world. Amen.",
  },
  {
    book: "Psalms",
    chapter: 100,
    verse: 1,
    text: "Make a joyful noise unto the LORD, all ye lands.",
  },
  {
    book: "Psalms",
    chapter: 100,
    verse: 2,
    text: "Serve the LORD with gladness: come before his presence with singing.",
  },
  {
    book: "Psalms",
    chapter: 100,
    verse: 3,
    text: "Know ye that the LORD he is God: it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture.",
  },
  {
    book: "Psalms",
    chapter: 100,
    verse: 4,
    text: "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.",
  },
  {
    book: "Psalms",
    chapter: 100,
    verse: 5,
    text: "For the LORD is good; his mercy is everlasting; and his truth endureth to all generations.",
  },
  {
    book: "Hebrews",
    chapter: 11,
    verse: 1,
    text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
  },
  {
    book: "1 John",
    chapter: 4,
    verse: 7,
    text: "Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God.",
  },
  {
    book: "1 John",
    chapter: 4,
    verse: 8,
    text: "He that loveth not knoweth not God; for God is love.",
  },
  {
    book: "Proverbs",
    chapter: 3,
    verse: 5,
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
  },
  {
    book: "Proverbs",
    chapter: 3,
    verse: 6,
    text: "In all thy ways acknowledge him, and he shall direct thy paths.",
  },
  {
    book: "Ephesians",
    chapter: 2,
    verse: 8,
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:",
  },
  {
    book: "Ephesians",
    chapter: 2,
    verse: 9,
    text: "Not of works, lest any man should boast.",
  },
  {
    book: "2 Timothy",
    chapter: 3,
    verse: 16,
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:",
  },
  {
    book: "Joshua",
    chapter: 1,
    verse: 9,
    text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
  },
  {
    book: "Matthew",
    chapter: 6,
    verse: 33,
    text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
  },
  {
    book: "Acts",
    chapter: 2,
    verse: 38,
    text: "Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost.",
  },
  {
    book: "Revelation",
    chapter: 21,
    verse: 4,
    text: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
  },
];

// bolls.life numbers books 1-66 in standard Protestant canon order, which is
// exactly the order BIBLE_BOOKS is already declared in above — so the book's
// array index + 1 is its bolls.life book id. Matches on name or abbr so
// existing calls (which may pass either) keep working unchanged.
function resolveBollsBookId(bookName) {
  const idx = BIBLE_BOOKS.findIndex(
    (b) =>
      b.name.toLowerCase() === bookName.toLowerCase() ||
      b.abbr.toLowerCase() === bookName.toLowerCase(),
  );
  return idx === -1 ? null : idx + 1;
}

// bolls.life's KJV feed embeds Strong's numbers into the text — sometimes
// glued directly to a word ("Peter4074"), sometimes as their own token
// separated by a space. KJV prose always spells numbers out in words
// ("threescore", "an hundred and five years"), so any bare digit in this
// feed is a Strong's artifact, never real verse content — safe to strip all
// of it, then clean up markup and the extra spaces/space-before-punctuation
// left behind.
function stripMarkup(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\d+/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

/**
 * Fetch a Bible passage from bolls.life (free, no API key).
 * Falls back to OFFLINE_VERSES if the network request fails.
 *
 * Signature and return shape are unchanged from the bible-api.com version,
 * so any code that already calls this doesn't need to change.
 *
 * @param {string} bookName  - Full book name or abbr, e.g. "John" / "John"
 * @param {number} chapter
 * @param {number} startVerse
 * @param {number} endVerse  - Same as startVerse for single verse
 * @param {string} translationId - one of TRANSLATIONS[].id, e.g. "kjv", "niv", "adb1905"
 * @returns {{ reference: string, verses: { verse: number, text: string }[], error?: string }}
 */
export async function fetchBiblePassage(
  bookName,
  chapter,
  startVerse,
  endVerse,
  translationId = "kjv",
) {
  const isSingle = startVerse === endVerse || !endVerse;
  const end = endVerse ?? startVerse;

  const bookId = resolveBollsBookId(bookName);
  const translation =
    TRANSLATIONS.find((t) => t.id === translationId) || TRANSLATIONS[0];
  const bollsCode = translation.bollsCode;

  // bolls.life's `verses=` query param doesn't reliably filter server-side —
  // it can return the whole chapter regardless of what's passed. So we fetch
  // the whole chapter and slice out the requested range ourselves, which
  // guarantees correctness no matter what that param actually does.
  const url = `https://bolls.life/get-text/${bollsCode}/${bookId}/${chapter}/`;

  try {
    if (!bookId) throw new Error(`Unknown book: ${bookName}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No verses returned");
    }

    const passage = data.filter((v) => v.verse >= startVerse && v.verse <= end);
    if (passage.length === 0) throw new Error("Verse range not found");

    const reference = isSingle
      ? `${bookName} ${chapter}:${startVerse}`
      : `${bookName} ${chapter}:${startVerse}-${end}`;

    return {
      reference,
      verses: passage.map((v) => ({
        verse: v.verse,
        text: stripMarkup(v.text),
      })),
      translationName: translation.name,
    };
  } catch {
    // Network failed or timed out — try to serve from offline cache (KJV only)
    const offline = OFFLINE_VERSES.filter(
      (v) =>
        v.book.toLowerCase() === bookName.toLowerCase() &&
        v.chapter === chapter &&
        v.verse >= startVerse &&
        v.verse <= end,
    );

    if (offline.length > 0) {
      const ref = isSingle
        ? `${bookName} ${chapter}:${startVerse}`
        : `${bookName} ${chapter}:${startVerse}-${end}`;
      return {
        reference: ref,
        verses: offline.map((v) => ({ verse: v.verse, text: v.text })),
        translationName: "KJV (offline)",
        offline: true,
      };
    }

    return {
      reference: "",
      verses: [],
      error: "Could not load verse. Check your connection.",
    };
  }
}
