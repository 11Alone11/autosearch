import {
  ActionIcon,
  Button,
  Drawer,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconBellPlus, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FiltersPanel } from '../components/filters/FiltersPanel';
import { ResetFiltersButton } from '../components/filters/ResetFiltersButton';
import { LotCard } from '../components/lots/LotCard';
import { ResultsToolbar } from '../components/lots/ResultsToolbar';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadError } from '../components/ui/LoadError';
import { LotsPageSkeleton } from '../components/ui/Skeletons';
import {
  applyCriteria,
  countActiveFilters,
  criteriaFromSearchParams,
  criteriaToSearchParams,
  filterLots,
  hasActiveFilters,
  makeOptions,
  normalizeFilters,
  yearBounds,
} from '../lib/lotFilters';
import { retryLots, useAllLots, useLotsLoadError, useLotsLoaded } from '../state/lots';
import { saveSearch } from '../state/savedSearches';
import type { Filters, SearchCriteria, SortKey } from '../types';

const PAGE_SIZE = 60;

export function LotsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const loaded = useLotsLoaded();
  const loadError = useLotsLoadError();
  const allLots = useAllLots();
  const makes = useMemo(() => makeOptions(allLots), [allLots]);
  const bounds = useMemo(() => yearBounds(allLots), [allLots]);
  const criteria = useMemo(() => {
    const parsed = criteriaFromSearchParams(searchParams);
    return { filters: normalizeFilters(parsed.filters, bounds), sort: parsed.sort };
  }, [searchParams, bounds]);
  const matched = useMemo(() => applyCriteria(allLots, criteria), [allLots, criteria]);

  useEffect(() => {
    if (!loaded) return;
    const next = criteriaToSearchParams(criteria).toString();
    if (next !== searchParams.toString()) {
      setSearchParams(new URLSearchParams(next), { replace: true });
    }
  }, [criteria, loaded, searchParams, setSearchParams]);

  const [drawerOpened, drawer] = useDisclosure(false);
  const [drawerFilters, setDrawerFilters] = useState<Filters>({});

  const criteriaKey = searchParams.toString();
  const scrollOnChange = useRef(false);
  const [pagination, setPagination] = useState({ key: criteriaKey, limit: PAGE_SIZE });
  const limit = pagination.key === criteriaKey ? pagination.limit : PAGE_SIZE;
  const showMore = () => setPagination({ key: criteriaKey, limit: limit + PAGE_SIZE });

  useEffect(() => {
    if (!scrollOnChange.current || drawerOpened) return;
    scrollOnChange.current = false;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [criteriaKey, drawerOpened]);

  const updateCriteria = (next: SearchCriteria) => {
    const params = criteriaToSearchParams(next);
    const nextKey = params.toString();
    if (nextKey === criteriaToSearchParams(criteria).toString()) return;
    scrollOnChange.current = true;
    setSearchParams(params, { replace: true });
    setPagination({ key: nextKey, limit: PAGE_SIZE });
  };

  const changeFilters = (patch: Partial<Filters>) => {
    const filters = normalizeFilters({ ...criteria.filters, ...patch }, bounds);
    updateCriteria({ filters, sort: criteria.sort });
  };

  const resetFilters = () => updateCriteria({ filters: {}, sort: criteria.sort });

  const handleSave = (target: SearchCriteria = criteria) => {
    const result = saveSearch(target);
    if (result.status === 'duplicate') {
      notifications.show({
        color: 'yellow',
        title: 'Такой поиск уже сохранён',
        message: 'Он ждёт вас в разделе «Мои поиски».',
        autoClose: 4000,
      });
      return;
    }
    notifications.show({
      color: 'teal',
      title: 'Поиск сохранён',
      message: `${result.search.name} — новые лоты появятся на странице «Мои поиски».`,
      autoClose: 4000,
    });
  };

  const drawerApplied = useMemo(
    () => normalizeFilters(drawerFilters, bounds),
    [drawerFilters, bounds],
  );
  const drawerCount = useMemo(
    () => filterLots(allLots, drawerApplied).length,
    [allLots, drawerApplied],
  );

  const openDrawer = () => {
    setDrawerFilters(criteria.filters);
    drawer.open();
  };

  const applyDrawer = () => {
    updateCriteria({ filters: drawerApplied, sort: criteria.sort });
    drawer.close();
  };

  const saveFromDrawer = () => {
    const next: SearchCriteria = { filters: drawerApplied, sort: criteria.sort };
    updateCriteria(next);
    handleSave(next);
    drawer.close();
  };

  if (loadError) return <LoadError onRetry={retryLots} />;
  if (!loaded) return <LotsPageSkeleton />;

  const activeFilterCount = countActiveFilters(criteria.filters);

  return (
    <>
      <Grid gap={24}>
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }} visibleFrom="md">
          <Paper p="md" pos="sticky" top={80} className="app-panel">
            <Group justify="space-between" align="center" mb={16} wrap="nowrap">
              <Text className="t-label">Фильтры</Text>
              <ResetFiltersButton
                onClick={resetFilters}
                disabled={!hasActiveFilters(criteria.filters)}
              />
            </Group>

            <FiltersPanel
              filters={criteria.filters}
              makes={makes}
              bounds={bounds}
              onChange={changeFilters}
            />

            <Button
              fullWidth
              mt={16}
              onClick={() => handleSave()}
              leftSection={<IconBellPlus size={20} />}
              data-testid="save-search"
            >
              Следить за поиском
            </Button>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          <ResultsToolbar
            count={matched.length}
            sort={criteria.sort}
            activeFilterCount={activeFilterCount}
            onSortChange={(sort: SortKey) =>
              updateCriteria({ filters: criteria.filters, sort })
            }
            onOpenFilters={openDrawer}
          />

          {matched.length === 0 ? (
            <EmptyState
              title="Ничего не нашлось"
              description="Попробуйте расширить диапазон годов или поднять максимальную цену."
              action={
                <ResetFiltersButton
                  onClick={resetFilters}
                  variant="light"
                  color="blue"
                  label="Сбросить фильтры"
                />
              }
            />
          ) : (
            <>
              <div className="app-fade-in">
                <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="md">
                  {matched.slice(0, limit).map((lot) => (
                    <LotCard key={lot.id} lot={lot} />
                  ))}
                </SimpleGrid>
              </div>

              {matched.length > limit && (
                <Group justify="center" mt={24}>
                  <Button variant="default" onClick={showMore} data-testid="show-more">
                    Показать ещё {Math.min(PAGE_SIZE, matched.length - limit)}
                  </Button>
                </Group>
              )}
            </>
          )}
        </Grid.Col>
      </Grid>

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        position="bottom"
        size="auto"
        keepMounted={false}
        withCloseButton={false}
        padding="md"
        hiddenFrom="md"
        aria-label="Фильтры"
        styles={{
          content: {
            maxHeight: '88dvh',
            height: 'auto',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
          body: {
            padding: 16,
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          },
        }}
      >
        <Group justify="space-between" align="center" mb={16} wrap="nowrap">
          <Text fw={700} fz={18} lh="24px">
            Фильтры
          </Text>
          <Group gap={4} wrap="nowrap">
            <ResetFiltersButton
              onClick={() => setDrawerFilters({})}
              disabled={!hasActiveFilters(drawerApplied)}
            />
            <ActionIcon
              variant="subtle"
              color="gray"
              size={36}
              onClick={drawer.close}
              aria-label="Закрыть фильтры"
            >
              <IconX size={20} />
            </ActionIcon>
          </Group>
        </Group>

        <FiltersPanel
          filters={drawerFilters}
          makes={makes}
          bounds={bounds}
          onChange={(patch) =>
            setDrawerFilters((current) => normalizeFilters({ ...current, ...patch }, bounds))
          }
        />

        <Group grow mt={16} gap="sm">
          <Button variant="light" onClick={saveFromDrawer} leftSection={<IconBellPlus size={20} />}>
            Следить
          </Button>
          <Button onClick={applyDrawer}>Показать {drawerCount}</Button>
        </Group>
      </Drawer>
    </>
  );
}
