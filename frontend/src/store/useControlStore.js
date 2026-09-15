import { create } from "zustand";
import { getChannel, MSG } from "@/lib/broadcast";
import {
  persistServiceOrder,
  loadServiceOrder,
} from "@/lib/db";

const channel = getChannel();

const DEFAULT_THEME = {
  // backgroundMode: 'color' | 'animated' | 'image' | 'video'
  backgroundMode: "color",
  background: "#0a0c10", // used when backgroundMode === 'color'
  animatedPreset: "aurora", // used when backgroundMode === 'animated'
  mediaId: null, // used when backgroundMode === 'image' | 'video'
  overlayOpacity: 0.45, // dark scrim over image/video/animated so text stays readable
  textColor: "#f5f2ea",
  accentColor: "#f0b45c",
  fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
  fontFamily: "'Geist Variable', sans-serif",
};

// Load theme from localStorage synchronously (safe: no async needed for theme).
function loadTheme() {
  try {
    const raw = localStorage.getItem("verseside-theme");
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    /* ignore malformed JSON */
  }
  return DEFAULT_THEME;
}

function saveTheme(theme) {
  try {
    localStorage.setItem("verseside-theme", JSON.stringify(theme));
  } catch {
    /* quota exceeded — ignore */
  }
}

export const useControlStore = create((set, get) => {
  // Reply to the Display window whenever it asks "what's live right now?"
  // (e.g. it was just opened, or got refreshed mid-service)
  if (channel) {
    channel.onmessage = (e) => {
      if (e.data?.type === MSG.REQUEST_STATE) {
        broadcastCurrent(get());
      }
    };
  }

  return {
    // service order = the queued-up list of songs/verses for today
    serviceOrder: [],
    currentItemIndex: -1,
    currentSlideIndex: 0,
    liveState: "clear", // 'live' | 'blackout' | 'clear'
    theme: loadTheme(), // hydrated synchronously from localStorage

    // Call this once on app mount to restore a saved service order from Dexie.
    hydrateServiceOrder: async () => {
      const items = await loadServiceOrder();
      if (items.length > 0) {
        set({ serviceOrder: items });
      }
    },

    addToServiceOrder: (item) =>
      set((s) => {
        const serviceOrder = [...s.serviceOrder, item];
        persistServiceOrder(serviceOrder);
        return { serviceOrder };
      }),

    removeFromServiceOrder: (id) =>
      set((s) => {
        const idx = s.serviceOrder.findIndex((i) => i.id === id);
        const serviceOrder = s.serviceOrder.filter((i) => i.id !== id);
        let currentItemIndex = s.currentItemIndex;
        if (idx === currentItemIndex) currentItemIndex = -1;
        else if (idx < currentItemIndex) currentItemIndex -= 1;
        persistServiceOrder(serviceOrder);
        return { serviceOrder, currentItemIndex };
      }),

    reorderServiceOrder: (fromIndex, toIndex) =>
      set((s) => {
        const items = [...s.serviceOrder];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        let currentItemIndex = s.currentItemIndex;
        if (fromIndex === currentItemIndex) currentItemIndex = toIndex;
        persistServiceOrder(items);
        return { serviceOrder: items, currentItemIndex };
      }),

    clearServiceOrder: () =>
      set(() => {
        persistServiceOrder([]);
        return { serviceOrder: [], currentItemIndex: -1, currentSlideIndex: 0, liveState: "clear" };
      }),

    selectItem: (index) => {
      set({ currentItemIndex: index, currentSlideIndex: 0, liveState: "live" });
      broadcastCurrent(get());
    },

    goToSlide: (slideIndex) => {
      set({ currentSlideIndex: slideIndex, liveState: "live" });
      broadcastCurrent(get());
    },

    next: () => {
      const s = get();
      const item = s.serviceOrder[s.currentItemIndex];
      if (!item) return;
      if (s.currentSlideIndex < item.slides.length - 1) {
        set({ currentSlideIndex: s.currentSlideIndex + 1, liveState: "live" });
      } else if (s.currentItemIndex < s.serviceOrder.length - 1) {
        set({
          currentItemIndex: s.currentItemIndex + 1,
          currentSlideIndex: 0,
          liveState: "live",
        });
      }
      broadcastCurrent(get());
    },

    prev: () => {
      const s = get();
      if (s.currentSlideIndex > 0) {
        set({ currentSlideIndex: s.currentSlideIndex - 1, liveState: "live" });
      } else if (s.currentItemIndex > 0) {
        const prevItem = s.serviceOrder[s.currentItemIndex - 1];
        set({
          currentItemIndex: s.currentItemIndex - 1,
          currentSlideIndex: prevItem.slides.length - 1,
          liveState: "live",
        });
      }
      broadcastCurrent(get());
    },

    blackout: () => {
      set({ liveState: "blackout" });
      channel?.postMessage({ type: MSG.BLACKOUT });
    },

    clearScreen: () => {
      set({ liveState: "clear" });
      channel?.postMessage({ type: MSG.CLEAR });
    },

    resumeLive: () => {
      set({ liveState: "live" });
      broadcastCurrent(get());
    },

    updateTheme: (partial) => {
      set((s) => {
        const theme = { ...s.theme, ...partial };
        saveTheme(theme);
        return { theme };
      });
      broadcastCurrent(get());
    },

    resetTheme: () => {
      saveTheme(DEFAULT_THEME);
      set({ theme: DEFAULT_THEME });
      broadcastCurrent(get());
    },
  };
});

function broadcastCurrent(state) {
  if (!channel) return;
  if (state.liveState === "blackout") {
    channel.postMessage({ type: MSG.BLACKOUT });
    return;
  }
  if (state.liveState === "clear" || state.currentItemIndex === -1) {
    channel.postMessage({ type: MSG.CLEAR, theme: state.theme });
    return;
  }
  const item = state.serviceOrder[state.currentItemIndex];
  const slide = item?.slides?.[state.currentSlideIndex];
  if (!slide) return;
  channel.postMessage({
    type: MSG.GO_LIVE,
    theme: state.theme,
    slide,
    meta: {
      itemTitle: item.title,
      slideLabel: slide.label,
      position: `${state.currentSlideIndex + 1} / ${item.slides.length}`,
    },
  });
}
