import type { Lot } from '../types';

export interface GenerateOptions {
  now?: Date;
  random?: () => number;
}

const MIN_PRICE = 3_000;
const MAX_PRICE = 55_000;
const MIN_MILEAGE = 10_000;
const MAX_MILEAGE = 380_000;
const MIN_YEAR_OFFSET = -4;
const MAX_YEAR_OFFSET = 2;

export function generateLots(base: Lot[], count: number, options: GenerateOptions = {}): Lot[] {
  if (base.length === 0) return [];
  const now = options.now ?? new Date();
  const random = options.random ?? Math.random;

  return Array.from({ length: count }, (_, index) => {
    const donor = base[Math.min(base.length - 1, Math.floor(random() * base.length))];
    const year = clamp(
      donor.year + randomInt(random, MIN_YEAR_OFFSET, MAX_YEAR_OFFSET),
      1990,
      now.getFullYear(),
    );

    return {
      id: `generated-${now.getTime()}-${index}-${randomInt(random, 1000, 9999)}`,
      make: donor.make,
      model: donor.model,
      year,
      priceUsd: roundTo(randomInt(random, MIN_PRICE, MAX_PRICE), 100),
      mileageKm: randomInt(random, MIN_MILEAGE / 1000, MAX_MILEAGE / 1000) * 1000,
      bodyType: donor.bodyType,
      city: donor.city,
      photo: donor.photo,
      appearedAt: new Date(now.getTime() - index).toISOString(),
    };
  });
}

function randomInt(random: () => number, min: number, max: number): number {
  return Math.min(max, Math.floor(random() * (max - min + 1)) + min);
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
