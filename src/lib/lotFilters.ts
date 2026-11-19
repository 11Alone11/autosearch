import type { Filters, Lot, SavedSearch, SearchCriteria, SortKey } from '../types';
import { formatPrice } from './format';

const DEFAULT_SORT: SortKey = 'newest';

export function isSortKey(value: unknown): value is SortKey {
  return value === 'newest' || value === 'cheapest';
}

export interface YearBounds {
  min: number;
  max: number;
}

export function matchesFilters(lot: Lot, filters: Filters): boolean {
  const { yearFrom, yearTo } = orderedYears(filters);
  if (filters.make !== undefined && lot.make !== filters.make) return false;
  if (yearFrom !== undefined && lot.year < yearFrom) return false;
  if (yearTo !== undefined && lot.year > yearTo) return false;
  if (filters.maxPrice !== undefined && lot.priceUsd > filters.maxPrice) return false;
  return true;
}

export function filterLots(lots: Lot[], filters: Filters): Lot[] {
  return lots.filter((lot) => matchesFilters(lot, filters));
}

export function sortLots(lots: Lot[], sort: SortKey): Lot[] {
  const sorted = [...lots];
  if (sort === 'cheapest') {
    sorted.sort((a, b) => a.priceUsd - b.priceUsd || b.appearedAt.localeCompare(a.appearedAt));
  } else {
    sorted.sort((a, b) => b.appearedAt.localeCompare(a.appearedAt) || a.priceUsd - b.priceUsd);
  }
  return sorted;
}

export function applyCriteria(lots: Lot[], criteria: SearchCriteria): Lot[] {
  return sortLots(filterLots(lots, criteria.filters), criteria.sort);
}

export function countNewLots(lots: Lot[], search: SavedSearch): number {
  return lots.filter(
    (lot) => lot.appearedAt > search.lastSeenAt && matchesFilters(lot, search.criteria.filters),
  ).length;
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.make !== undefined ||
    filters.yearFrom !== undefined ||
    filters.yearTo !== undefined ||
    filters.maxPrice !== undefined
  );
}

export function countActiveFilters(filters: Filters): number {
  return [filters.make, filters.yearFrom, filters.yearTo, filters.maxPrice].filter(
    (value) => value !== undefined,
  ).length;
}

export function yearBounds(lots: Lot[]): YearBounds {
  if (lots.length === 0) return { min: 1990, max: new Date().getFullYear() };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const lot of lots) {
    if (lot.year < min) min = lot.year;
    if (lot.year > max) max = lot.year;
  }
  return { min, max };
}

export function makeOptions(lots: Lot[]): string[] {
  return [...new Set(lots.map((lot) => lot.make))].sort((a, b) => a.localeCompare(b, 'ru'));
}

export function orderedYears(filters: Filters): { yearFrom?: number; yearTo?: number } {
  const { yearFrom, yearTo } = filters;
  if (yearFrom !== undefined && yearTo !== undefined && yearFrom > yearTo) {
    return { yearFrom: yearTo, yearTo: yearFrom };
  }
  return { yearFrom, yearTo };
}

export function normalizeFilters(filters: Filters, bounds: YearBounds): Filters {
  const normalized: Filters = {};
  if (filters.make) normalized.make = filters.make;
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    normalized.maxPrice = filters.maxPrice;
  }

  const { yearFrom, yearTo } = orderedYears({
    yearFrom: clampYear(filters.yearFrom, bounds),
    yearTo: clampYear(filters.yearTo, bounds),
  });
  if (yearFrom !== undefined && yearFrom > bounds.min) normalized.yearFrom = yearFrom;
  if (yearTo !== undefined && yearTo < bounds.max) normalized.yearTo = yearTo;
  return normalized;
}

function clampYear(value: number | undefined, bounds: YearBounds): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.min(bounds.max, Math.max(bounds.min, Math.floor(value)));
}

export function isSameCriteria(a: SearchCriteria, b: SearchCriteria): boolean {
  return (
    a.sort === b.sort &&
    (a.filters.make ?? '') === (b.filters.make ?? '') &&
    (a.filters.yearFrom ?? 0) === (b.filters.yearFrom ?? 0) &&
    (a.filters.yearTo ?? 0) === (b.filters.yearTo ?? 0) &&
    (a.filters.maxPrice ?? 0) === (b.filters.maxPrice ?? 0)
  );
}

export function describeCriteria(criteria: SearchCriteria): string {
  const parts: string[] = [];
  if (criteria.filters.make) parts.push(criteria.filters.make);

  const { yearFrom, yearTo } = orderedYears(criteria.filters);
  if (yearFrom !== undefined && yearTo !== undefined) parts.push(`${yearFrom}–${yearTo}`);
  else if (yearFrom !== undefined) parts.push(`от ${yearFrom}`);
  else if (yearTo !== undefined) parts.push(`до ${yearTo}`);

  if (criteria.filters.maxPrice !== undefined) {
    parts.push(`до ${formatPrice(criteria.filters.maxPrice)}`);
  }
  if (parts.length === 0) parts.push('Все лоты');
  if (criteria.sort === 'cheapest') parts.push('сначала дешёвые');

  return parts.join(' · ');
}

export function criteriaToSearchParams(criteria: SearchCriteria): URLSearchParams {
  const params = new URLSearchParams();
  if (criteria.filters.make) params.set('make', criteria.filters.make);
  if (criteria.filters.yearFrom !== undefined) {
    params.set('yearFrom', String(criteria.filters.yearFrom));
  }
  if (criteria.filters.yearTo !== undefined) params.set('yearTo', String(criteria.filters.yearTo));
  if (criteria.filters.maxPrice !== undefined) {
    params.set('maxPrice', String(criteria.filters.maxPrice));
  }
  if (criteria.sort !== DEFAULT_SORT) params.set('sort', criteria.sort);
  return params;
}

export function criteriaFromSearchParams(params: URLSearchParams): SearchCriteria {
  const filters: Filters = {};
  const make = params.get('make');
  if (make) filters.make = make;

  const yearFrom = toNumber(params.get('yearFrom'));
  const yearTo = toNumber(params.get('yearTo'));
  const maxPrice = toNumber(params.get('maxPrice'));
  if (yearFrom !== undefined) filters.yearFrom = yearFrom;
  if (yearTo !== undefined) filters.yearTo = yearTo;
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;

  const sort = params.get('sort');
  return { filters, sort: isSortKey(sort) ? sort : DEFAULT_SORT };
}

function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
