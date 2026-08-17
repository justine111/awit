// Single BroadcastChannel used to sync the "live" slide between the
// Control window and the Display window. Two windows = two JS realms,
// so they can't share a zustand store instance directly — instead the
// Control window is the source of truth and broadcasts the live slide
// every time it changes. The Display window just listens and renders.

export const CHANNEL_NAME = "Awit Slide";

export const MSG = {
  GO_LIVE: "GO_LIVE", // { slide, theme } — show this slide
  BLACKOUT: "BLACKOUT", // hide everything (screen goes black)
  CLEAR: "CLEAR", // logo/clear screen (nothing live)
  REQUEST_STATE: "REQUEST_STATE", // Display asks "what's currently live?"
};

export function getChannel() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    console.warn("BroadcastChannel not supported in this browser.");
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
}
