import { useEffect, useRef } from "react";

function getRefreshInterval() {
  try {
    const raw = localStorage.getItem("recuperai-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.refreshInterval === "off") return null;
      const mins = Number(parsed.refreshInterval);
      if (mins > 0) return mins * 60 * 1000;
    }
  } catch {}
  return 5 * 60 * 1000;
}

export function useAutoRefresh(callback, defaultIntervalMs = 5 * 60 * 1000) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Load on mount
    callbackRef.current();

    const intervalMs = getRefreshInterval() ?? defaultIntervalMs;
    if (!intervalMs || intervalMs <= 0) return;

    const id = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [defaultIntervalMs]);
}
