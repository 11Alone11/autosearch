export type SortKey = 'newest' | 'cheapest';

export interface Filters {
  make?: string;
  yearFrom?: number;
  yearTo?: number;
  maxPrice?: number;
}

export interface Lot {
  id: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  mileageKm: number;
  bodyType: string;
  city: string;
  photo: string;
  appearedAt: string;
}

export interface SearchCriteria {
  filters: Filters;
  sort: SortKey;
}

export interface SavedSearch {
  id: string;
  name: string;
  criteria: SearchCriteria;
  createdAt: string;
  lastSeenAt: string;
}
