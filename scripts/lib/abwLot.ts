export interface AbwItem {
  id: number;
  link: string;
  title: string;
  params?: string[];
  price?: { usd?: number };
  city?: string;
  updated_at?: string;
  images?: { list?: { xl?: string }[] };
}

function titleWithoutYear(title: string): string {
  return title.replace(/,\s*\d{4}\s*$/, '').trim();
}

function makeWordCount(title: string, slug: string): number {
  const firstWord = titleWithoutYear(title).split(/\s+/)[0]?.toLowerCase() ?? '';
  const makeParts = firstWord.split('-');
  const slugParts = slug.split('-');

  if (makeParts.length > 1) {
    const slugPrefix = slugParts.slice(0, makeParts.length).join('-');
    if (slugPrefix === firstWord) return 1;
  }

  return Math.max(1, slugParts.length);
}

export function splitMakeAndModel(link: string, title: string): { make: string; model: string } {
  const slug = link.split('/')[3] ?? '';
  const makeTokens = makeWordCount(title, slug);
  const words = titleWithoutYear(title).split(/\s+/);
  const make = words.slice(0, makeTokens).join(' ');
  const model = words
    .slice(makeTokens)
    .join(' ')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*рестайлинг(\s*\d+)?\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { make, model };
}

export function parseMileage(params: string[]): number | null {
  const digits = (params[0] ?? '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}
