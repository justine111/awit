import { create } from "zustand";
import { getChannel, MSG } from "@lib/broadcast";

const channel = getChannel();

export const useDisplayStore = create((set) => {
  if (channel) {
    channel.onmessage = (e) => {
      const { type, slide, theme, meta } = e.data || {};
      if (type === MSG.GO_LIVE) {
        set({ status: "live", slide, theme, meta });
      } else if (type === MSG.BLACKOUT) {
        set({ status: "blackout" });
      } else if (type === MSG.CLEAR) {
        set({ status: "clear" });
      }
    };
    // Ask the Control window to resend whatever is currently live —
    // covers the case where this Display window opened after Control
    // already had something on screen.
    channel.postMessage({ type: MSG.REQUEST_STATE });
  }

  return {
    status: "clear", // 'live' | 'blackout' | 'clear'
    slide: null,
    theme: null,
    meta: null,
  };
});
