import { useEffect, useRef } from "react";

export function useAutoRefresh(callback, intervalMs = 5 * 60 * 1000) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Carrega na montagem inicial
    callbackRef.current();

    const id = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);
}
