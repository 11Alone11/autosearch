import { useEffect, type RefObject } from 'react';

interface Options {
  topOffset?: number;
  threshold?: number;
}

export function useHideOnScroll(
  ref: RefObject<HTMLElement | null>,
  { topOffset = 64, threshold = 8 }: Options = {},
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let lastY = window.scrollY;
    let hidden = false;

    const handleScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < threshold) return;

      const nextHidden = y > topOffset && y > lastY;
      if (nextHidden !== hidden) {
        hidden = nextHidden;
        element.classList.toggle('is-hidden', hidden);
      }
      lastY = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, topOffset, threshold]);
}
