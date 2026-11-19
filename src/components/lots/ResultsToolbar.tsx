import { ActionIcon, Box, Group, SegmentedControl, Text } from '@mantine/core';
import { IconAdjustments } from '@tabler/icons-react';
import { useRef } from 'react';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { isSortKey } from '../../lib/lotFilters';
import type { SortKey } from '../../types';

interface ResultsToolbarProps {
  count: number;
  sort: SortKey;
  activeFilterCount: number;
  onSortChange: (sort: SortKey) => void;
  onOpenFilters: () => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Новые' },
  { value: 'cheapest', label: 'Дешевле' },
];

export function ResultsToolbar({
  count,
  sort,
  activeFilterCount,
  onSortChange,
  onOpenFilters,
}: ResultsToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  useHideOnScroll(toolbarRef);

  return (
    <Box ref={toolbarRef} className="results-toolbar" bg="var(--mantine-color-body)" py={8}>
      <Group justify="space-between" gap="sm" wrap="nowrap" h={36}>
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <ActionIcon
            hiddenFrom="md"
            variant={activeFilterCount > 0 ? 'light' : 'default'}
            size={36}
            onClick={onOpenFilters}
            aria-label={
              activeFilterCount > 0
                ? `Фильтры, активно: ${activeFilterCount}`
                : 'Открыть фильтры'
            }
          >
            <IconAdjustments size={20} />
          </ActionIcon>

          <Text
            className="t-body"
            c="dimmed"
            truncate
            data-testid="results-count"
            aria-live="polite"
          >
            Найдено:{' '}
            <Text span fw={700} c="var(--mantine-color-text)">
              {count}
            </Text>
          </Text>
        </Group>

        <SegmentedControl
          className="results-sort"
          size="sm"
          aria-label="Сортировка"
          value={sort}
          onChange={(value) => {
            if (isSortKey(value)) onSortChange(value);
          }}
          data={SORT_OPTIONS}
          styles={{
            label: {
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        />
      </Group>
    </Box>
  );
}
