import { describeCriteria, isSameCriteria, isSortKey } from '../lib/lotFilters';
import { STORAGE_KEYS } from './storage';
import type { SavedSearch, SearchCriteria } from '../types';
import { createId, createPersistentList, usePersistentList } from './store';

const savedSearchesStore = createPersistentList<SavedSearch>(
  STORAGE_KEYS.savedSearches,
  parseSavedSearches,
);

export function useSavedSearches(): SavedSearch[] {
  return usePersistentList(savedSearchesStore);
}

export function getSavedSearches(): SavedSearch[] {
  return savedSearchesStore.get();
}

export type SaveSearchResult =
  | { status: 'saved'; search: SavedSearch }
  | { status: 'duplicate'; search: SavedSearch };

export function saveSearch(criteria: SearchCriteria, now: Date = new Date()): SaveSearchResult {
  const duplicate = savedSearchesStore
    .get()
    .find((item) => isSameCriteria(item.criteria, criteria));
  if (duplicate) return { status: 'duplicate', search: duplicate };

  const search: SavedSearch = {
    id: createId('search'),
    name: describeCriteria(criteria),
    criteria,
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
  };
  savedSearchesStore.set([search, ...savedSearchesStore.get()]);
  return { status: 'saved', search };
}

export interface DeletedSearch {
  search: SavedSearch;
  index: number;
}

export function deleteSearch(id: string): DeletedSearch | null {
  const current = savedSearchesStore.get();
  const index = current.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const search = current[index];
  if (!search) return null;
  savedSearchesStore.set(current.filter((item) => item.id !== id));
  return { search, index };
}

export function restoreSearch(search: SavedSearch, index: number): void {
  const current = savedSearchesStore.get();
  if (current.some((item) => item.id === search.id)) return;
  const next = [...current];
  next.splice(Math.min(index, next.length), 0, search);
  savedSearchesStore.set(next);
}

export function markSearchSeen(id: string, now: Date = new Date()): void {
  const current = savedSearchesStore.get();
  if (!current.some((item) => item.id === id)) return;
  savedSearchesStore.set(
    current.map((item) => (item.id === id ? { ...item, lastSeenAt: now.toISOString() } : item)),
  );
}

function parseSavedSearches(raw: unknown): SavedSearch[] | null {
  if (!Array.isArray(raw)) return null;

  return raw.filter((value): value is SavedSearch => {
    if (typeof value !== 'object' || value === null) return false;
    const item = value as Record<string, unknown>;
    const criteria = item.criteria as Record<string, unknown> | undefined;
    if (!criteria || typeof criteria !== 'object') return false;
    const filters = criteria.filters as Record<string, unknown> | undefined;
    if (!filters || typeof filters !== 'object') return false;

    return (
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.createdAt === 'string' &&
      typeof item.lastSeenAt === 'string' &&
      isSortKey(criteria.sort) &&
      (filters.make === undefined || typeof filters.make === 'string') &&
      (filters.yearFrom === undefined || typeof filters.yearFrom === 'number') &&
      (filters.yearTo === undefined || typeof filters.yearTo === 'number') &&
      (filters.maxPrice === undefined || typeof filters.maxPrice === 'number')
    );
  });
}
