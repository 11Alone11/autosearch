import { MantineProvider } from '@mantine/core';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { filterLots, yearBounds } from '../lib/lotFilters';
import { routes } from '../routes';
import { ensureLotsLoaded, getBaseLots } from '../state/lots';
import type { Lot } from '../types';

function renderApp(initialEntries: string[] = ['/']) {
  const router = createMemoryRouter(routes, { initialEntries });
  render(
    <MantineProvider>
      <RouterProvider router={router} />
    </MantineProvider>,
  );
  return router;
}

let baseLots: Lot[] = [];

beforeAll(async () => {
  await ensureLotsLoaded();
  baseLots = getBaseLots();
});

beforeEach(() => {
  window.localStorage.clear();
});

describe('страница лотов', () => {
  it('показывает все лоты и фильтры', () => {
    renderApp();
    expect(screen.getByTestId('results-count')).toHaveTextContent(`Найдено: ${baseLots.length}`);
    expect(screen.getByPlaceholderText('Любая')).toBeInTheDocument();
    expect(screen.getByLabelText('Цена до')).toBeInTheDocument();
  });

  it('фильтрует по максимальной цене', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText('Цена до'), '10000');
    await user.tab();

    const expected = filterLots(baseLots, { maxPrice: 10_000 }).length;
    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent(`Найдено: ${expected}`);
    });
    expect(expected).toBeLessThan(baseLots.length);
  });

  it('добавляет 5 новых лотов по кнопке', async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByTestId('results-count')).toHaveTextContent(`Найдено: ${baseLots.length}`);

    await user.click(screen.getByTestId('add-lots'));

    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent(
        `Найдено: ${baseLots.length + 5}`,
      );
    });
  });

  it('применяет фильтры из мобильной шторки только по кнопке «Показать»', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /фильтр/i }));
    const drawer = await screen.findByRole('dialog');
    await user.type(within(drawer).getByLabelText('Цена до'), '10000');
    await user.tab();

    expect(screen.getByTestId('results-count')).toHaveTextContent(`Найдено: ${baseLots.length}`);

    const expected = filterLots(baseLots, { maxPrice: 10_000 }).length;
    const applyButton = await within(drawer).findByRole('button', { name: `Показать ${expected}` });
    await user.click(applyButton);

    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent(`Найдено: ${expected}`);
    });
  });

  it('переключает сортировку сегментами без Select', async () => {
    const user = userEvent.setup();
    const router = renderApp();

    expect(screen.queryByRole('combobox', { name: 'Сортировка' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Дешевле' }));

    await waitFor(() => {
      expect(router.state.location.search).toBe('?sort=cheapest');
    });
  });

  it('не сохраняет полный диапазон годов как фильтр', async () => {
    const user = userEvent.setup();
    const bounds = yearBounds(baseLots);
    renderApp([`/?yearFrom=${bounds.min}&yearTo=${bounds.max}`]);

    await user.click(screen.getByTestId('save-search'));

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem('autosearch.v1.searches') ?? '[]',
      ) as Array<{ criteria: { filters: Record<string, unknown> } }>;
      expect(stored[0]?.criteria.filters).toEqual({});
    });
  });

  it('плавно прокручивает к началу списка при смене фильтра', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.spyOn(window, 'scrollTo');
    renderApp();
    scrollSpy.mockClear();

    await user.type(screen.getByLabelText('Цена до'), '10000');
    await user.tab();

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  it('нормализует годы из URL к данным', async () => {
    const router = renderApp(['/?yearFrom=2020.5&yearTo=2026']);

    await waitFor(() => {
      expect(router.state.location.search).toBe('?yearFrom=2020');
    });
  });

  it('сохраняет поиск и показывает его на странице «Мои поиски»', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('save-search'));

    await waitFor(() => {
      expect(window.localStorage.getItem('autosearch.v1.searches')).toContain('"name":"Все лоты"');
    });

    await user.click(screen.getAllByRole('link', { name: /Мои поиски/ })[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Все лоты')).toBeInTheDocument();
      expect(screen.getByText('Нет новых')).toBeInTheDocument();
    });
  });

  it('сохраняет поиск, добавляет 5 лотов, считает новые и обнуляет счётчик', async () => {
    const user = userEvent.setup();
    const router = renderApp();

    await user.click(screen.getByTestId('save-search'));
    await waitFor(() => {
      expect(window.localStorage.getItem('autosearch.v1.searches')).toContain('"name":"Все лоты"');
    });

    await user.click(screen.getByTestId('add-lots'));
    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent(
        `Найдено: ${baseLots.length + 5}`,
      );
    });

    await user.click(screen.getAllByRole('link', { name: /Мои поиски/ })[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.getByText('+5 новых')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Открыть поиск' }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });

    await user.click(screen.getAllByRole('link', { name: /Мои поиски/ })[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.getByText('Нет новых')).toBeInTheDocument();
    });
  });
});
