import { useMemo, useSyncExternalStore } from 'react';
import { generateLots, type GenerateOptions } from '../lib/generateLots';
import { STORAGE_KEYS } from './storage';
import type { Lot } from '../types';
import { createPersistentList, usePersistentList } from './store';

export const ADDED_LOTS_LIMIT = 1000;

let baseLots: Lot[] | null = null;
let loadError: Error | null = null;
let loadPromise: Promise<void> | null = null;
const loadListeners = new Set<() => void>();

function emitLoad(): void {
  for (const listener of loadListeners) listener();
}

export function ensureLotsLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = import('../data/lots.json')
    .then((module) => {
      const parsed = parseLots(module.default);
      if (!parsed || parsed.length === 0) {
        throw new Error('Файл с лотами пуст или повреждён');
      }
      baseLots = parsed;
      loadError = null;
    })
    .catch((error: unknown) => {
      loadError = error instanceof Error ? error : new Error('Не удалось загрузить лоты');
      loadPromise = null;
    })
    .finally(emitLoad);

  return loadPromise;
}

export function retryLots(): void {
  if (loadPromise) return;
  loadError = null;
  emitLoad();
  void ensureLotsLoaded();
}

export function getBaseLots(): Lot[] {
  return baseLots ?? [];
}

export function randomLotPhoto(exclude?: string): string | undefined {
  const lots = getBaseLots();
  if (lots.length === 0) return undefined;
  const pool = exclude ? lots.filter((lot) => lot.photo !== exclude) : lots;
  const source = pool.length > 0 ? pool : lots;
  return source[Math.floor(Math.random() * source.length)]?.photo;
}

function areLotsLoaded(): boolean {
  return baseLots !== null;
}

function subscribeLots(listener: () => void): () => void {
  loadListeners.add(listener);
  return () => {
    loadListeners.delete(listener);
  };
}

export function useLotsLoaded(): boolean {
  return useSyncExternalStore(subscribeLots, areLotsLoaded, () => true);
}

export function useLotsLoadError(): Error | null {
  return useSyncExternalStore(subscribeLots, () => loadError, () => null);
}

const addedLotsStore = createPersistentList<Lot>(STORAGE_KEYS.addedLots, parseLots);

function useAddedLots(): Lot[] {
  return usePersistentList(addedLotsStore);
}

export function useAllLots(): Lot[] {
  const addedLots = useAddedLots();
  const loaded = useLotsLoaded();

  return useMemo(() => (loaded ? [...addedLots, ...getBaseLots()] : []), [addedLots, loaded]);
}

export interface AddLotsResult {
  added: Lot[];
  trimmed: number;
}

export function addRandomLots(count = 5, options: GenerateOptions = {}): AddLotsResult {
  const generated = generateLots(getBaseLots(), count, options);
  const next = [...generated, ...addedLotsStore.get()];
  const trimmed = Math.max(0, next.length - ADDED_LOTS_LIMIT);
  addedLotsStore.set(trimmed > 0 ? next.slice(0, ADDED_LOTS_LIMIT) : next);
  return { added: generated, trimmed };
}

export function getAddedLots(): Lot[] {
  return addedLotsStore.get();
}

function isLot(value: unknown): value is Lot {
  if (typeof value !== 'object' || value === null) return false;
  const lot = value as Record<string, unknown>;
  return (
    typeof lot.id === 'string' &&
    typeof lot.make === 'string' &&
    typeof lot.model === 'string' &&
    typeof lot.year === 'number' &&
    typeof lot.priceUsd === 'number' &&
    typeof lot.mileageKm === 'number' &&
    typeof lot.bodyType === 'string' &&
    typeof lot.city === 'string' &&
    typeof lot.photo === 'string' &&
    typeof lot.appearedAt === 'string'
  );
}

function parseLots(raw: unknown): Lot[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.filter(isLot);
}
