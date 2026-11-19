import { useCallback, useEffect, useRef } from 'react';

interface Options {
  fastDelay?: number;
  slowGap?: number;
}

export function useAdaptiveCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  { fastDelay = 250, slowGap = 400 }: Options = {},
): [(...args: Args) => void, () => void] {
  const callbackRef = useRef(callback);
  const timerRef = useRef<number | undefined>(undefined);
  const lastInputRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const run = useCallback(
    (...args: Args) => {
      const now = Date.now();
      const gap = lastInputRef.current === 0 ? 0 : now - lastInputRef.current;
      lastInputRef.current = now;
      window.clearTimeout(timerRef.current);

      if (gap > slowGap) {
        callbackRef.current(...args);
        return;
      }
      timerRef.current = window.setTimeout(() => callbackRef.current(...args), fastDelay);
    },
    [fastDelay, slowGap],
  );

  const reset = useCallback(() => {
    window.clearTimeout(timerRef.current);
    lastInputRef.current = 0;
  }, []);

  return [run, reset];
}
