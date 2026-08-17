import { useEffect, useState } from "react";
import { getMediaRecord } from "./db";

// Both the Control and Display windows call this independently — they
// don't share JS memory, but they DO share the same IndexedDB (same
// origin), so each window just looks up the blob itself from the id
// it received over BroadcastChannel and turns it into a local object URL.
export function useMediaUrl(mediaId) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    if (mediaId == null) {
      setUrl(null);
      return;
    }

    getMediaRecord(mediaId).then((record) => {
      if (cancelled || !record?.blob) return;
      objectUrl = URL.createObjectURL(record.blob);
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId]);

  return url;
}
