import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedSearch, SearchCriteria } from '../types';

const criteria: SearchCriteria = { filters: { make: 'BMW' }, sort: 'newest' };

async function loadModule() {
  vi.resetModules();
  return import('./savedSearches');
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('сохранённые поиски', () => {
  it('сохраняет поиск с именем и обнуляет счётчик новых', async () => {
    const { saveSearch, getSavedSearches } = await loadModule();
    const now = new Date('2026-11-18T20:00:00.000Z');

    const result = saveSearch(criteria, now);

    expect(result.status).toBe('saved');
    expect(getSavedSearches()).toHaveLength(1);
    expect(result.search.name).toBe('BMW');
    expect(result.search.createdAt).toBe(now.toISOString());
    expect(result.search.lastSeenAt).toBe(now.toISOString());
  });

  it('не сохраняет одинаковый поиск дважды', async () => {
    const { saveSearch, getSavedSearches } = await loadModule();

    saveSearch(criteria);
    const second = saveSearch({ filters: { make: 'BMW' }, sort: 'newest' });

    expect(second.status).toBe('duplicate');
    expect(getSavedSearches()).toHaveLength(1);
  });

  it('сохраняет поиск с другой сортировкой отдельно', async () => {
    const { saveSearch, getSavedSearches } = await loadModule();

    saveSearch(criteria);
    const second = saveSearch({ filters: { make: 'BMW' }, sort: 'cheapest' });

    expect(second.status).toBe('saved');
    expect(getSavedSearches()).toHaveLength(2);
  });

  it('удаляет поиск и возвращает его на прежнее место', async () => {
    const { saveSearch, deleteSearch, restoreSearch, getSavedSearches } = await loadModule();

    saveSearch({ filters: { make: 'BMW' }, sort: 'newest' });
    saveSearch({ filters: { make: 'Audi' }, sort: 'newest' });
    saveSearch({ filters: { make: 'Kia' }, sort: 'newest' });

    const deleted = deleteSearch(getSavedSearches()[1]?.id ?? '');
    expect(deleted).not.toBeNull();
    expect(getSavedSearches().map((item) => item.name)).toEqual(['Kia', 'BMW']);

    if (deleted) restoreSearch(deleted.search, deleted.index);
    expect(getSavedSearches().map((item) => item.name)).toEqual(['Kia', 'Audi', 'BMW']);
  });

  it('помечает поиск просмотренным', async () => {
    const { saveSearch, markSearchSeen, getSavedSearches } = await loadModule();
    const createdAt = new Date('2026-11-01T00:00:00.000Z');
    const seenAt = new Date('2026-11-18T20:00:00.000Z');

    const saved = saveSearch(criteria, createdAt);
    markSearchSeen(saved.search.id, seenAt);

    expect(getSavedSearches()[0]?.lastSeenAt).toBe(seenAt.toISOString());
    expect(getSavedSearches()[0]?.createdAt).toBe(createdAt.toISOString());
  });

  it('переживает битые данные в хранилище', async () => {
    window.localStorage.setItem('autosearch.v1.searches', '[{"id":42},{"nonsense":true}]');
    const { getSavedSearches } = await loadModule();

    expect(getSavedSearches()).toEqual([]);
  });

  it('читает сохранённые данные обратно', async () => {
    const { saveSearch } = await loadModule();
    saveSearch({ filters: { make: 'BMW', maxPrice: 20_000 }, sort: 'cheapest' });

    const reloaded = await loadModule();
    const stored: SavedSearch[] = reloaded.getSavedSearches();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.criteria.filters).toEqual({ make: 'BMW', maxPrice: 20_000 });
    expect(stored[0]?.criteria.sort).toBe('cheapest');
  });
});
