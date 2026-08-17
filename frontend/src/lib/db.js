import Dexie from "dexie";
import { sampleSongs } from "@/data/sampleSongs";

// Local-first storage — everything lives in the browser via IndexedDB.
// No backend, no network dependency during a live service.
export const db = new Dexie("verseside");

db.version(1).stores({
  // ++id = auto-increment primary key, title indexed for search
  songs: "++id, title",
  // Uploaded background images/videos for the "live wallpaper" feature.
  // The blob itself lives here; only the numeric id ever gets broadcast
  // to the Display window, which looks the blob up itself (IndexedDB is
  // shared across same-origin windows) — keeps BroadcastChannel messages
  // tiny even for large video files.
  media: "++id, name, kind, createdAt",
});

// Seed sample songs on first run so the app isn't empty out of the box.
export async function seedIfEmpty() {
  const count = await db.songs.count();
  if (count === 0) {
    await db.songs.bulkAdd(sampleSongs);
  }
}

// --- Media (background image/video) helpers ---------------------------

export async function saveMedia(file) {
  const kind = file.type.startsWith("video") ? "video" : "image";
  const id = await db.media.add({
    name: file.name,
    kind,
    blob: file,
    createdAt: Date.now(),
  });
  return { id, kind };
}

export async function listMedia() {
  return db.media.orderBy("createdAt").reverse().toArray();
}

export async function deleteMedia(id) {
  return db.media.delete(id);
}

export async function getMediaRecord(id) {
  if (id == null) return null;
  return db.media.get(id);
}
