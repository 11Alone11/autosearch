import { mkdir, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { parseAbwDate } from './lib/abwDate.ts';
import { parseMileage, splitMakeAndModel, type AbwItem } from './lib/abwLot.ts';
import type { Lot } from '../src/types.ts';

const API = 'https://b.abw.by/api/v2/cars/list';
const PAGES = 20;
const LIMIT = 300;
const PHOTO_WIDTH = 640;
const PHOTO_HEIGHT = 480;
const PHOTO_QUALITY = 70;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const root = path.resolve(import.meta.dirname, '..');
const photosDir = path.join(root, 'public', 'photos');
const dataFile = path.join(root, 'src', 'data', 'lots.json');

interface Candidate {
  lot: Lot;
  source: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url: string): Promise<AbwItem[]> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data?: unknown };
      if (!Array.isArray(body.data)) {
        throw new Error('API вернул неожиданный формат');
      }
      return body.data as AbwItem[];
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(500 * attempt);
    }
  }
  throw new Error('Не удалось получить данные API');
}

function toLot(item: AbwItem, now: Date, fallbackIndex: number): Lot | null {
  const yearMatch = /,\s*(\d{4})\s*$/.exec(item.title);
  const price = item.price?.usd;
  const mileage = parseMileage(item.params ?? []);
  if (!yearMatch || !price || mileage === null) return null;

  const { make, model } = splitMakeAndModel(item.link, item.title);
  if (!make || !model) return null;

  const appearedAt =
    (item.updated_at ? parseAbwDate(item.updated_at, now) : null) ??
    new Date(now.getTime() - fallbackIndex * 3 * 60 * 60 * 1000);

  return {
    id: String(item.id),
    make,
    model,
    year: Number(yearMatch[1]),
    priceUsd: price,
    mileageKm: mileage,
    bodyType: item.params?.[3] ?? '—',
    city: item.city ?? '—',
    photo: `photos/${item.id}.webp`,
    appearedAt: appearedAt.toISOString(),
  };
}

async function fileExists(file: string): Promise<boolean> {
  try {
    return (await stat(file)).size > 0;
  } catch {
    return false;
  }
}

async function downloadPhoto(source: string, destination: string): Promise<void> {
  const response = await fetch(source, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`photo HTTP ${response.status}`);

  await sharp(Buffer.from(await response.arrayBuffer()))
    .resize({ width: PHOTO_WIDTH, height: PHOTO_HEIGHT, fit: 'cover', position: 'centre' })
    .webp({ quality: PHOTO_QUALITY })
    .toFile(destination);
}

async function mapWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: limit }, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
        await worker(item);
      }
    }),
  );
}

async function ensurePhotos(candidates: Candidate[]): Promise<Set<string>> {
  const ready = new Set<string>();
  const missing: Candidate[] = [];

  for (const candidate of candidates) {
    const file = path.join(root, 'public', candidate.lot.photo);
    if (await fileExists(file)) ready.add(candidate.lot.id);
    else missing.push(candidate);
  }

  let downloaded = 0;
  let failed = 0;
  await mapWithConcurrency(missing, 5, async (candidate) => {
    try {
      await downloadPhoto(candidate.source, path.join(root, 'public', candidate.lot.photo));
      ready.add(candidate.lot.id);
      downloaded += 1;
    } catch (error) {
      failed += 1;
      console.warn(`фото ${candidate.lot.id}: ${(error as Error).message}`);
    }
  });

  console.log(`фото: докачано ${downloaded}, ошибок ${failed}, уже было ${ready.size - downloaded}`);
  return ready;
}

async function removeOrphanPhotos(keepIds: Set<string>): Promise<void> {
  const files = await readdir(photosDir);
  let removed = 0;
  for (const file of files) {
    if (!file.endsWith('.webp')) continue;
    if (keepIds.has(file.replace(/\.webp$/, ''))) continue;
    await unlink(path.join(photosDir, file));
    removed += 1;
  }
  if (removed > 0) console.log(`удалено лишних фото: ${removed}`);
}

async function main() {
  const now = new Date();
  await mkdir(photosDir, { recursive: true });
  await mkdir(path.dirname(dataFile), { recursive: true });

  const seen = new Set<number>();
  const candidates: Candidate[] = [];

  for (let page = 1; page <= PAGES; page += 1) {
    const items = await fetchJson(`${API}?page=${page}`);
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const source = item.images?.list?.[0]?.xl;
      if (!source) continue;
      const lot = toLot(item, now, candidates.length);
      if (lot) candidates.push({ lot, source });
    }
    console.log(`страница ${page}/${PAGES}: кандидатов ${candidates.length}`);
    await sleep(150);
  }

  const selected: Lot[] = [];
  let cursor = 0;
  while (selected.length < LIMIT && cursor < candidates.length) {
    const batch = candidates.slice(cursor, cursor + (LIMIT - selected.length) + 5);
    cursor += batch.length;
    const ready = await ensurePhotos(batch);
    for (const candidate of batch) {
      if (selected.length >= LIMIT) break;
      if (ready.has(candidate.lot.id)) selected.push(candidate.lot);
    }
  }

  if (selected.length < LIMIT) {
    throw new Error(
      `собрано ${selected.length} из ${LIMIT} лотов — ${path.relative(root, dataFile)} не изменён`,
    );
  }

  const sorted = [...selected].sort((a, b) => b.appearedAt.localeCompare(a.appearedAt));
  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  await rename(tempFile, dataFile);
  await removeOrphanPhotos(new Set(sorted.map((lot) => lot.id)));

  const dates = sorted.map((lot) => lot.appearedAt).sort();
  const makes = new Map<string, number>();
  for (const lot of sorted) makes.set(lot.make, (makes.get(lot.make) ?? 0) + 1);
  const topMakes = [...makes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([make, count]) => `${make} (${count})`)
    .join(', ');

  console.log(
    [
      `готово: ${sorted.length} лотов, ${makes.size} марок`,
      `даты: ${dates[0]} .. ${dates[dates.length - 1]}`,
      `популярные марки: ${topMakes}`,
      `файл: ${path.relative(root, dataFile)}`,
    ].join('\n'),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
