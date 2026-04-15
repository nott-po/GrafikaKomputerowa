// rAF loop — callback dostaje dt w sekundach

import { useEffect, useRef } from 'react';

export function useAnimationFrame(callback: (deltaSeconds: number) => void): void {
  // ref żeby nie restartować rAF przy każdym renderze
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let rafId = 0;
    let previousMs: number | null = null;

    const tick = (nowMs: number) => {
      if (previousMs !== null) {
        const deltaSeconds = (nowMs - previousMs) / 1000;
        // cap 0.1s — żeby nie skakało po alt-tab
        callbackRef.current(Math.min(deltaSeconds, 0.1));
      }
      previousMs = nowMs;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
}
