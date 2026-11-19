import { RangeSlider, Stack, Text } from '@mantine/core';
import { useSyncedDraft } from '../../hooks/useSyncedDraft';
import type { Filters } from '../../types';

interface YearRangeFilterProps {
  filters: Filters;
  bounds: { min: number; max: number };
  onChange: (patch: Partial<Filters>) => void;
}

export function YearRangeFilter({ filters, bounds, onChange }: YearRangeFilterProps) {
  const from = filters.yearFrom ?? bounds.min;
  const to = filters.yearTo ?? bounds.max;
  const [yearKey, setYearKey] = useSyncedDraft(`${from}:${to}`);
  const [valueFrom, valueTo] = yearKey.split(':').map(Number);

  if (bounds.min >= bounds.max) return null;

  return (
    <Stack gap={8}>
      <Text className="t-label">Год выпуска</Text>
      <RangeSlider
        min={bounds.min}
        max={bounds.max}
        step={1}
        minRange={0}
        size="lg"
        thumbSize={24}
        value={[valueFrom, valueTo]}
        onChange={([nextFrom, nextTo]) => setYearKey(`${nextFrom}:${nextTo}`)}
        onChangeEnd={([nextFrom, nextTo]) => onChange({ yearFrom: nextFrom, yearTo: nextTo })}
        label={(value) => value}
        labelTransitionProps={{ transition: 'fade', duration: 150 }}
        classNames={{ label: 'range-label' }}
        styles={{ label: { top: -28 } }}
        aria-label="Диапазон годов выпуска"
      />
      <Text className="t-value">
        {valueFrom} — {valueTo}
      </Text>
    </Stack>
  );
}
