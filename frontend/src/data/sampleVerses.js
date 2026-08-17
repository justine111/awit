// A small sample so the Bible browser has something to search/display.
// This is NOT a full Bible — for production, load a complete public-domain
// translation (WEB, KJV, or ASV all work and are free of copyright) as a
// JSON file structured the same way: { book, chapter, verse, text }[].
// Good sources: ebible.org, github.com/scrollmapper/bible_databases.
//
// NOTE: double-check the wording of any verse below against a real Bible —
// this sample set was typed from memory for demo purposes only.

export const sampleVerses = [
  { book: 'Psalms', chapter: 23, verse: 1, text: 'Yahweh is my shepherd; I shall lack nothing.' },
  { book: 'Psalms', chapter: 23, verse: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.' },
  { book: 'Psalms', chapter: 23, verse: 3, text: 'He restores my soul. He guides me in the paths of righteousness for his name\u2019s sake.' },
  { book: 'Psalms', chapter: 23, verse: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.' },
  { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.' },
  { book: 'John', chapter: 3, verse: 17, text: 'For God didn\u2019t send his Son into the world to judge the world, but that the world should be saved through him.' },
  { book: 'Philippians', chapter: 4, verse: 6, text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.' },
  { book: 'Philippians', chapter: 4, verse: 7, text: 'And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.' },
  { book: 'Romans', chapter: 8, verse: 28, text: 'We know that all things work together for good for those who love God, for those who are called according to his purpose.' },
  { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in Yahweh with all your heart, and don\u2019t lean on your own understanding.' },
  { book: 'Proverbs', chapter: 3, verse: 6, text: 'In all your ways acknowledge him, and he will make your paths straight.' },
]
