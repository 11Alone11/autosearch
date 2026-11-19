import { useMemo } from 'react';
import { countNewLots } from '../lib/lotFilters';
import { useAllLots } from './lots';
import { useSavedSearches } from './savedSearches';

export function useNewLotsTotal(): number {
  const lots = useAllLots();
  const searches = useSavedSearches();

  return useMemo(
    () => searches.reduce((total, search) => total + countNewLots(lots, search), 0),
    [lots, searches],
  );
}
