export interface PageMeta {
  title: string;
  description: string;
}

const NOT_FOUND_META: PageMeta = {
  title: 'Страница не найдена — Автопоиск',
  description:
    'Такой страницы нет. Вернитесь к каталогу автомобилей или к сохранённым поискам.',
};

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'Автопоиск — сохранённые поиски автомобилей',
    description:
      'Каталог автомобилей с фильтрами по марке, году и цене. Сохраняйте поиски и следите за новыми лотами — счётчик покажет, сколько машин добавилось.',
  },
  '/searches': {
    title: 'Мои поиски — Автопоиск',
    description:
      'Сохранённые поиски авто: фильтры, сортировка и счётчик новых лотов. Откройте поиск, чтобы обнулить счётчик и вернуться к каталогу.',
  },
};

export function pageMeta(pathname: string): PageMeta {
  const path = pathname === '' ? '/' : pathname;
  const key = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return PAGE_META[key] ?? NOT_FOUND_META;
}
