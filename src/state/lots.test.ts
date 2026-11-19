import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadLots() {
  vi.resetModules();
  const module = await import('./lots');
  await module.ensureLotsLoaded();
  return module;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('добавленные лоты', () => {
  it('добавляет ровно пять лотов и сохраняет их', async () => {
    const { addRandomLots, getAddedLots } = await loadLots();

    const result = addRandomLots(5);

    expect(result.added).toHaveLength(5);
    expect(result.trimmed).toBe(0);
    expect(getAddedLots()).toHaveLength(5);
  });

  it('держит не больше 1000 лотов и сообщает, сколько старых удалил', async () => {
    const { addRandomLots, getAddedLots, ADDED_LOTS_LIMIT } = await loadLots();

    addRandomLots(ADDED_LOTS_LIMIT);
    const result = addRandomLots(5);

    expect(result.trimmed).toBe(5);
    expect(getAddedLots()).toHaveLength(ADDED_LOTS_LIMIT);
  });

  it('поднимает сохранённые лоты из localStorage', async () => {
    const first = await loadLots();
    first.addRandomLots(5);

    const second = await loadLots();
    expect(second.getAddedLots()).toHaveLength(5);
  });

  it('возвращает случайное фото из базовых лотов и умеет исключать текущее', async () => {
    const { randomLotPhoto, getBaseLots } = await loadLots();
    const photos = new Set(getBaseLots().map((lot) => lot.photo));

    const photo = randomLotPhoto();
    expect(photo).toBeDefined();
    expect(photos.has(photo ?? '')).toBe(true);

    const other = randomLotPhoto(photo);
    expect(other).not.toBe(photo);
  });

  it('игнорирует мусор в хранилище', async () => {
    window.localStorage.setItem('autosearch.v1.lots', '[{"id":1},{"photo":"x.webp"}]');
    const { getAddedLots } = await loadLots();

    expect(getAddedLots()).toEqual([]);
  });
});
