import { Stack } from '@mantine/core';
import type { YearBounds } from '../../lib/lotFilters';
import type { Filters } from '../../types';
import { PriceFilter } from './PriceFilter';
import { BrandSelect } from './BrandSelect';
import { YearRangeFilter } from './YearRangeFilter';

interface FiltersPanelProps {
  filters: Filters;
  makes: string[];
  bounds: YearBounds;
  onChange: (patch: Partial<Filters>) => void;
}

export function FiltersPanel({ filters, makes, bounds, onChange }: FiltersPanelProps) {
  return (
    <Stack gap="md">
      <BrandSelect
        value={filters.make}
        makes={makes}
        onChange={(make) => onChange({ make })}
      />
      <YearRangeFilter filters={filters} bounds={bounds} onChange={onChange} />
      <PriceFilter value={filters.maxPrice} onChange={(maxPrice) => onChange({ maxPrice })} />
    </Stack>
  );
}
