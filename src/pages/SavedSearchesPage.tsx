import { Box, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBell, IconSearch } from '@tabler/icons-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { SavedSearchCard } from '../components/searches/SavedSearchCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadError } from '../components/ui/LoadError';
import { SearchesPageSkeleton } from '../components/ui/Skeletons';
import { countNewLots, criteriaToSearchParams } from '../lib/lotFilters';
import {
  retryLots,
  useAllLots,
  useLotsLoadError,
  useLotsLoaded,
} from '../state/lots';
import {
  deleteSearch,
  markSearchSeen,
  restoreSearch,
  useSavedSearches,
} from '../state/savedSearches';
import type { SavedSearch } from '../types';

export function SavedSearchesPage() {
  const searches = useSavedSearches();
  const lots = useAllLots();
  const loaded = useLotsLoaded();
  const loadError = useLotsLoadError();
  const navigate = useNavigate();

  const newCounts = useMemo(
    () => new Map(searches.map((search) => [search.id, countNewLots(lots, search)])),
    [searches, lots],
  );
  const totalNew = [...newCounts.values()].reduce((sum, value) => sum + value, 0);

  const handleOpen = (search: SavedSearch) => {
    markSearchSeen(search.id);
    navigate(`/?${criteriaToSearchParams(search.criteria).toString()}`);
  };

  const handleDelete = (search: SavedSearch) => {
    const deleted = deleteSearch(search.id);
    if (!deleted) return;

    const notificationId = notifications.show({
      color: 'gray',
      title: 'Поиск удалён',
      autoClose: 6000,
      withBorder: true,
      message: (
        <Group justify="space-between" align="center" gap="md" wrap="nowrap" mt={4}>
          <Text className="t-body" lineClamp={2} style={{ flex: 1 }}>
            {search.name}
          </Text>
          <Button
            size="sm"
            variant="light"
            color="gray"
            onClick={() => {
              restoreSearch(deleted.search, deleted.index);
              notifications.hide(notificationId);
            }}
          >
            Вернуть
          </Button>
        </Group>
      ),
    });
  };

  if (loadError) return <LoadError onRetry={retryLots} />;
  if (!loaded) return <SearchesPageSkeleton />;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <Box>
          <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>
            Мои поиски
          </Title>
          <Text className="t-body" c="dimmed" mt={4} aria-live="polite">
            {searches.length === 0
              ? 'Сохранённых поисков пока нет'
              : `Поисков: ${searches.length} · новых лотов: ${totalNew}`}
          </Text>
        </Box>
        <Button component={Link} to="/" variant="light" leftSection={<IconSearch size={20} />}>
          К лотам
        </Button>
      </Group>

      {searches.length === 0 ? (
        <EmptyState
          icon={<IconBell size={24} />}
          title="Здесь появятся ваши поиски"
          description="Настройте фильтры на странице лотов и нажмите «Следить за поиском» — мы будем считать новые машины, подходящие под условия."
          action={
            <Button component={Link} to="/" variant="light">
              Настроить первый поиск
            </Button>
          }
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {searches.map((search) => (
            <SavedSearchCard
              key={search.id}
              search={search}
              newCount={newCounts.get(search.id) ?? 0}
              onOpen={() => handleOpen(search)}
              onDelete={() => handleDelete(search)}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
