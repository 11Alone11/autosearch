import { useState } from 'react';

export function useSyncedDraft<T>(
  external: T,
  paused = false,
): [T, (next: T | null) => void] {
  const [draft, setDraft] = useState<T | null>(null);
  const [seen, setSeen] = useState<T>(external);

  if (!paused && !Object.is(seen, external)) {
    setSeen(external);
    setDraft(null);
  }

  return [draft === null ? external : draft, setDraft];
}
