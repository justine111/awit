import { create } from "zustand";
import { getChannel, MSG } from "@/lib/broadcast";

const channel = getChannel();

const DEFAULT_THEME = {
  background: "#0a0c10",
  textColor: "#f5f2ea",
  accentColor: "#f0b45c",
  fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
};

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
    theme: DEFAULT_THEME,

    addToServiceOrder: (item) =>
      set((s) => ({ serviceOrder: [...s.serviceOrder, item] })),

    removeFromServiceOrder: (id) =>
      set((s) => {
        const idx = s.serviceOrder.findIndex((i) => i.id === id);
        const serviceOrder = s.serviceOrder.filter((i) => i.id !== id);
        let currentItemIndex = s.currentItemIndex;
        if (idx === currentItemIndex) currentItemIndex = -1;
        else if (idx < currentItemIndex) currentItemIndex -= 1;
        return { serviceOrder, currentItemIndex };
      }),

    reorderServiceOrder: (fromIndex, toIndex) =>
      set((s) => {
        const items = [...s.serviceOrder];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        let currentItemIndex = s.currentItemIndex;
        if (fromIndex === currentItemIndex) currentItemIndex = toIndex;
        return { serviceOrder: items, currentItemIndex };
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
      set((s) => ({ theme: { ...s.theme, ...partial } }));
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
    channel.postMessage({ type: MSG.CLEAR });
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
