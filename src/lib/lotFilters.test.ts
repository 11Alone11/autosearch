import { describe, expect, it } from 'vitest';
import type { Lot, SavedSearch } from '../types';
import {
  applyCriteria,
  countActiveFilters,
  countNewLots,
  criteriaFromSearchParams,
  criteriaToSearchParams,
  describeCriteria,
  filterLots,
  hasActiveFilters,
  isSameCriteria,
  isSortKey,
  normalizeFilters,
  orderedYears,
  sortLots,
} from './lotFilters';

function lot(overrides: Partial<Lot> = {}): Lot {
  return {
    id: 'id-1',
    make: 'BMW',
    model: 'X5',
    year: 2020,
    priceUsd: 30_000,
    mileageKm: 100_000,
    bodyType: 'внедорожник 5 дв.',
    city: 'Минск',
    photo: 'photos/id-1.webp',
    appearedAt: '2026-11-10T10:00:00.000Z',
    ...overrides,
  };
}

describe('filterLots', () => {
  const lots = [
    lot({ id: 'a', make: 'BMW', year: 2018, priceUsd: 20_000 }),
    lot({ id: 'b', make: 'Audi', year: 2021, priceUsd: 35_000 }),
    lot({ id: 'c', make: 'BMW', year: 2022, priceUsd: 50_000 }),
  ];

  it('без фильтров возвращает всё', () => {
    expect(filterLots(lots, {})).toHaveLength(3);
  });

  it('фильтрует по марке', () => {
    expect(filterLots(lots, { make: 'BMW' }).map((item) => item.id)).toEqual(['a', 'c']);
  });

  it('включает границы диапазона годов', () => {
    expect(filterLots(lots, { yearFrom: 2018, yearTo: 2021 }).map((item) => item.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('включает цену, равную максимальной', () => {
    expect(filterLots(lots, { maxPrice: 35_000 }).map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('меняет местами перепутанные границы годов', () => {
    expect(orderedYears({ yearFrom: 2022, yearTo: 2018 })).toEqual({
      yearFrom: 2018,
      yearTo: 2022,
    });
  });
});

describe('sortLots', () => {
  const old = lot({ id: 'old', priceUsd: 20_000, appearedAt: '2026-11-01T00:00:00.000Z' });
  const fresh = lot({ id: 'fresh', priceUsd: 20_000, appearedAt: '2026-11-15T00:00:00.000Z' });
  const cheap = lot({ id: 'cheap', priceUsd: 10_000, appearedAt: '2026-11-10T00:00:00.000Z' });

  it('«сначала новые» сортирует по дате, тай-брейк — по цене', () => {
    expect(sortLots([old, fresh, cheap], 'newest').map((item) => item.id)).toEqual([
      'fresh',
      'cheap',
      'old',
    ]);
  });

  it('«сначала дешёвые» сортирует по цене, тай-брейк — по дате', () => {
    expect(sortLots([old, fresh, cheap], 'cheapest').map((item) => item.id)).toEqual([
      'cheap',
      'fresh',
      'old',
    ]);
  });

  it('не мутирует исходный массив', () => {
    const source = [old, cheap];
    sortLots(source, 'cheapest');
    expect(source.map((item) => item.id)).toEqual(['old', 'cheap']);
  });
});

describe('countNewLots', () => {
  const search: SavedSearch = {
    id: 'search-1',
    name: 'BMW',
    criteria: { filters: { make: 'BMW' }, sort: 'newest' },
    createdAt: '2026-11-01T00:00:00.000Z',
    lastSeenAt: '2026-11-10T00:00:00.000Z',
  };

  const lots = [
    lot({ id: 'new-bmw', appearedAt: '2026-11-11T00:00:00.000Z' }),
    lot({ id: 'old-bmw', appearedAt: '2026-11-05T00:00:00.000Z' }),
    lot({ id: 'new-audi', make: 'Audi', appearedAt: '2026-11-12T00:00:00.000Z' }),
  ];

  it('считает только подходящие под фильтры лоты, появившиеся после сохранения', () => {
    expect(countNewLots(lots, search)).toBe(1);
  });

  it('после обновления lastSeenAt счётчик обнуляется', () => {
    const seen: SavedSearch = { ...search, lastSeenAt: '2026-11-18T00:00:00.000Z' };
    expect(countNewLots(lots, seen)).toBe(0);
  });
});

describe('normalizeFilters', () => {
  const bounds = { min: 2000, max: 2026 };

  it('выкидывает полный диапазон годов', () => {
    expect(normalizeFilters({ yearFrom: 2000, yearTo: 2026 }, bounds)).toEqual({});
  });

  it('оставляет только реально ограничивающую границу', () => {
    expect(normalizeFilters({ yearFrom: 2010, yearTo: 2026 }, bounds)).toEqual({ yearFrom: 2010 });
    expect(normalizeFilters({ yearFrom: 2000, yearTo: 2015 }, bounds)).toEqual({ yearTo: 2015 });
  });

  it('не сохраняет нулевую цену как фильтр', () => {
    expect(normalizeFilters({ maxPrice: 0 }, bounds)).toEqual({});
  });

  it('приводит годы к границам данных и целым числам', () => {
    expect(normalizeFilters({ yearFrom: 2100 }, bounds)).toEqual({ yearFrom: 2026 });
    expect(normalizeFilters({ yearTo: 1900 }, bounds)).toEqual({ yearTo: 2000 });
    expect(normalizeFilters({ yearFrom: 2020.5 }, bounds)).toEqual({ yearFrom: 2020 });
  });
});

describe('countActiveFilters', () => {
  it('считает заданные фильтры', () => {
    expect(countActiveFilters({})).toBe(0);
    expect(countActiveFilters({ make: 'BMW', maxPrice: 1000 })).toBe(2);
    expect(countActiveFilters({ yearFrom: 2010, yearTo: 2020, make: 'Kia' })).toBe(3);
  });
});

describe('hasActiveFilters', () => {
  it('понимает, когда фильтров нет', () => {
    expect(hasActiveFilters({})).toBe(false);
  });

  it('видит любой заданный фильтр', () => {
    expect(hasActiveFilters({ make: 'BMW' })).toBe(true);
    expect(hasActiveFilters({ maxPrice: 1000 })).toBe(true);
    expect(hasActiveFilters({ yearFrom: 2010 })).toBe(true);
    expect(hasActiveFilters({ yearTo: 2020 })).toBe(true);
  });
});

describe('описание и сериализация поиска', () => {
  const criteria = { filters: { make: 'BMW', yearFrom: 2018, maxPrice: 25_000 }, sort: 'cheapest' } as const;

  it('собирает человекочитаемое имя', () => {
    const normalize = (value: string) => value.replace(/\u00a0/g, ' ');
    expect(normalize(describeCriteria(criteria))).toBe(
      'BMW · от 2018 · до $25 000 · сначала дешёвые',
    );
  });

  it('переживает круговой путь через query-параметры', () => {
    const restored = criteriaFromSearchParams(criteriaToSearchParams(criteria));
    expect(restored.sort).toBe('cheapest');
    expect(restored.filters).toEqual({ make: 'BMW', yearFrom: 2018, maxPrice: 25_000 });
  });

  it('не пишет сортировку по умолчанию в URL', () => {
    const params = criteriaToSearchParams({ filters: { make: 'Audi' }, sort: 'newest' });
    expect(params.toString()).toBe('make=Audi');
  });

  it('сравнивает критерии без учёта порядка ключей', () => {
    expect(
      isSameCriteria(
        { filters: { make: 'BMW', maxPrice: 10 }, sort: 'newest' },
        { filters: { maxPrice: 10, make: 'BMW' }, sort: 'newest' },
      ),
    ).toBe(true);
    expect(
      isSameCriteria(
        { filters: { make: 'BMW' }, sort: 'newest' },
        { filters: { make: 'BMW' }, sort: 'cheapest' },
      ),
    ).toBe(false);
  });

  it('применяет критерии целиком', () => {
    const lots = [
      lot({ id: 'a', make: 'BMW', priceUsd: 10_000, appearedAt: '2026-11-01T00:00:00.000Z' }),
      lot({ id: 'b', make: 'BMW', priceUsd: 20_000, appearedAt: '2026-11-02T00:00:00.000Z' }),
      lot({ id: 'c', make: 'Audi', priceUsd: 5_000, appearedAt: '2026-11-03T00:00:00.000Z' }),
    ];
    expect(
      applyCriteria(lots, { filters: { make: 'BMW' }, sort: 'newest' }).map((item) => item.id),
    ).toEqual(['b', 'a']);
  });
});


describe('isSortKey', () => {
  it('принимает только известные сортировки', () => {
    expect(isSortKey('newest')).toBe(true);
    expect(isSortKey('cheapest')).toBe(true);
    expect(isSortKey('oldest')).toBe(false);
    expect(isSortKey(null)).toBe(false);
  });
});
