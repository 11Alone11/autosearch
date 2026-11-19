import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { matchesFilters } from '../../lib/lotFilters';
import { ADDED_LOTS_LIMIT, addRandomLots, useLotsLoaded } from '../../state/lots';
import { getSavedSearches } from '../../state/savedSearches';

const LOTS_PER_CLICK = 5;

function resultMessage(searches: number, matched: number, added: number): string {
  if (searches === 0) {
    return 'Они уже в списке сверху. Сохраните поиск, чтобы следить за новинками.';
  }
  if (matched === 0) {
    return 'Ни один не подошёл под сохранённые поиски — они остались в общем списке.';
  }
  return `Под ваши сохранённые поиски подошли ${matched} из ${added}. Счётчики обновились.`;
}

export function AddLotsButton() {
  const loaded = useLotsLoaded();

  const handleClick = () => {
    const { added, trimmed } = addRandomLots(LOTS_PER_CLICK);
    const searches = getSavedSearches();
    const matched = added.filter((lot) =>
      searches.some((search) => matchesFilters(lot, search.criteria.filters)),
    ).length;

    notifications.show({
      color: 'teal',
      title: `Добавлено ${added.length} новых лотов`,
      message: resultMessage(searches.length, matched, added.length),
      autoClose: 5000,
    });

    if (trimmed > 0) {
      notifications.show({
        color: 'yellow',
        title: 'Старые лоты удалены',
        message:
          `В браузере хранятся последние ${ADDED_LOTS_LIMIT} добавленных лотов — ` +
          'самые старые пришлось убрать, чтобы не переполнить хранилище.',
        autoClose: 8000,
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      leftSection={<IconPlus size={20} />}
      disabled={!loaded}
      loading={!loaded}
      loaderProps={{ size: 'xs' }}
      aria-label={`Добавить ${LOTS_PER_CLICK} новых лотов`}
      data-testid="add-lots"
    >
      Добавить {LOTS_PER_CLICK} новых
    </Button>
  );
}
