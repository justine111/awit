import Dexie from "dexie";
import { sampleSongs } from "@/data/sampleSongs";

// Local-first storage — everything lives in the browser via IndexedDB.
// No backend, no network dependency during a live service.
export const db = new Dexie("verseside");

db.version(1).stores({
  // ++id = auto-increment primary key, title indexed for search
  songs: "++id, title",
});

// Seed sample songs on first run so the app isn't empty out of the box.
export async function seedIfEmpty() {
  const count = await db.songs.count();
  if (count === 0) {
    await db.songs.bulkAdd(sampleSongs);
  }
}
