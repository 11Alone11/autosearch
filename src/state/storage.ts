export const STORAGE_KEYS = {
  savedSearches: 'autosearch.v1.searches',
  addedLots: 'autosearch.v1.lots',
} as const;

export type StorageErrorHandler = (message: string) => void;

let errorHandler: StorageErrorHandler | null = null;

export function setStorageErrorHandler(handler: StorageErrorHandler | null): void {
  errorHandler = handler;
}

function reportStorageError(message: string): void {
  errorHandler?.(message);
}

export function readJSON<T>(
  key: string,
  validate: (raw: unknown) => T | null,
  fallback: T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return validate(JSON.parse(raw)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    reportStorageError(
      'Не удалось сохранить данные: в браузере закончилось место. ' +
        'Удалите часть сохранённых поисков.',
    );
    return false;
  }
}
