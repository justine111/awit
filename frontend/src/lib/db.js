import Dexie from "dexie";
import { sampleSongs } from "@/data/sampleSongs";

// Local-first storage — everything lives in the browser via IndexedDB.
// No backend, no network dependency during a live service.
export const db = new Dexie("verseside");

// v1 — original tables (songs + media)
db.version(1).stores({
  songs: "++id, title",
  media: "++id, name, kind, createdAt",
});

// v2 — add service order persistence and a generic key-value settings table
db.version(2).stores({
  songs: "++id, title",
  media: "++id, name, kind, createdAt",
  // Service order: a single row keyed by id "current"
  serviceOrder: "id",
  // Generic settings: any key → value pairs (theme presets, etc.)
  settings: "key",
});

// Seed sample songs on first run so the app isn't empty out of the box.
export async function seedIfEmpty() {
  const count = await db.songs.count();
  if (count === 0) {
    await db.songs.bulkAdd(sampleSongs);
  }
}

// --- Service Order persistence ----------------------------------------

export async function persistServiceOrder(items) {
  await db.serviceOrder.put({ id: "current", items, updatedAt: Date.now() });
}

export async function loadServiceOrder() {
  const record = await db.serviceOrder.get("current");
  return record?.items ?? [];
}

// --- Generic settings -------------------------------------------------

export async function saveSetting(key, value) {
  await db.settings.put({ key, value });
}

export async function loadSetting(key, defaultValue = null) {
  const record = await db.settings.get(key);
  return record?.value ?? defaultValue;
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
