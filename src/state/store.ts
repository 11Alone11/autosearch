import { useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from './storage';

export interface PersistentList<T> {
  get(): T[];
  set(next: T[]): void;
  subscribe(listener: () => void): () => void;
}

export function createPersistentList<T>(
  key: string,
  validate: (raw: unknown) => T[] | null,
): PersistentList<T> {
  let cache: T[] | null = null;
  const listeners = new Set<() => void>();

  const get = (): T[] => {
    if (cache === null) cache = readJSON(key, validate, []);
    return cache;
  };

  const emit = (): void => {
    for (const listener of listeners) listener();
  };

  const set = (next: T[]): void => {
    cache = next;
    writeJSON(key, next);
    emit();
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === key || event.key === null) {
        cache = null;
        emit();
      }
    });
  }

  return { get, set, subscribe };
}

export function usePersistentList<T>(store: PersistentList<T>): T[] {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function createId(prefix: string): string {
  const suffix = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${suffix}`;
}
