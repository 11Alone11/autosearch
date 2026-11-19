import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { countNewLots } from '../lib/lotFilters';
import { routes } from '../routes';
import { ensureLotsLoaded, getBaseLots } from '../state/lots';
import { getSavedSearches, saveSearch } from '../state/savedSearches';

beforeAll(() => ensureLotsLoaded());

beforeEach(() => {
  window.localStorage.clear();
});

function renderSearches() {
  const router = createMemoryRouter(routes, { initialEntries: ['/searches'] });
  render(
    <MantineProvider>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>,
  );
  return router;
}

describe('страница сохранённых поисков', () => {
  it('показывает счётчик новых лотов для сохранённого поиска', async () => {
    const saved = saveSearch(
      { filters: { make: 'BMW' }, sort: 'newest' },
      new Date('2026-11-01T00:00:00.000Z'),
    );
    const expected = countNewLots(getBaseLots(), getSavedSearches()[0] ?? saved.search);

    renderSearches();

    expect(await screen.findByText('BMW')).toBeInTheDocument();
    expect(screen.getByText(`+${expected} новых`)).toBeInTheDocument();
  });

  it('удаляет поиск и возвращает его по кнопке «Вернуть»', async () => {
    const user = userEvent.setup();
    saveSearch({ filters: { make: 'BMW' }, sort: 'newest' });
    renderSearches();

    expect(await screen.findByText('BMW')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Удалить поиск/ }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Удалить поиск/ })).not.toBeInTheDocument();
    });

    const undo = await screen.findByRole('button', { name: 'Вернуть' });
    await user.click(undo);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Удалить поиск/ })).toBeInTheDocument();
    });
  });
});
