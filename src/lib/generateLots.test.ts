import { describe, expect, it } from 'vitest';
import type { Lot } from '../types';
import { generateLots } from './generateLots';
import { countNewLots } from './lotFilters';

const base: Lot[] = [
  {
    id: 'base-1',
    make: 'BMW',
    model: 'X5',
    year: 2020,
    priceUsd: 30_000,
    mileageKm: 100_000,
    bodyType: 'внедорожник 5 дв.',
    city: 'Минск',
    photo: 'photos/base-1.webp',
    appearedAt: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 'base-2',
    make: 'Audi',
    model: 'A4',
    year: 2015,
    priceUsd: 15_000,
    mileageKm: 200_000,
    bodyType: 'седан',
    city: 'Гродно',
    photo: 'photos/base-2.webp',
    appearedAt: '2026-11-09T10:00:00.000Z',
  },
];

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

describe('generateLots', () => {
  const now = new Date('2026-11-18T20:00:00.000Z');

  it('возвращает запрошенное количество лотов с уникальными id', () => {
    const lots = generateLots(base, 5, { now, random: seededRandom(42) });
    expect(lots).toHaveLength(5);
    expect(new Set(lots.map((item) => item.id)).size).toBe(5);
  });

  it('берёт фото, марку и модель у одного и того же донора', () => {
    const lots = generateLots(base, 20, { now, random: seededRandom(7) });
    for (const lot of lots) {
      const donor = base.find((item) => item.photo === lot.photo);
      expect(donor).toBeDefined();
      expect(lot.make).toBe(donor?.make);
      expect(lot.model).toBe(donor?.model);
    }
  });

  it('держит год, цену и пробег в разумных пределах', () => {
    const lots = generateLots(base, 100, { now, random: seededRandom(3) });
    for (const lot of lots) {
      expect(lot.year).toBeGreaterThanOrEqual(1990);
      expect(lot.year).toBeLessThanOrEqual(now.getFullYear());
      expect(lot.priceUsd).toBeGreaterThanOrEqual(3_000);
      expect(lot.priceUsd).toBeLessThanOrEqual(55_000);
      expect(lot.priceUsd % 100).toBe(0);
      expect(lot.mileageKm % 1000).toBe(0);
      expect(lot.appearedAt <= now.toISOString()).toBe(true);
    }
  });

  it('ставит новые лоты в прошлом относительно «сейчас» и в порядке появления', () => {
    const lots = generateLots(base, 3, { now, random: seededRandom(11) });
    const times = lots.map((item) => item.appearedAt);
    expect([...times].sort().reverse()).toEqual(times);
  });

  it('все сгенерированные лоты новее поиска, сохранённого перед нажатием кнопки', () => {
    const savedAt = '2026-11-18T19:59:59.000Z';
    const lots = generateLots(base, 5, {
      now: new Date('2026-11-18T20:00:00.000Z'),
      random: seededRandom(5),
    });
    const search = {
      id: 'search-1',
      name: 'Все лоты',
      criteria: { filters: {}, sort: 'newest' as const },
      createdAt: savedAt,
      lastSeenAt: savedAt,
    };

    expect(countNewLots(lots, search)).toBe(5);
  });

  it('возвращает пустой массив, если нет базовых лотов', () => {
    expect(generateLots([], 5, { now })).toEqual([]);
  });
});
