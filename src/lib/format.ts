const numberFormat = new Intl.NumberFormat('ru-RU');

const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

const pad = (value: number) => String(value).padStart(2, '0');

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPrice(usd: number): string {
  return `$${formatNumber(usd)}`;
}

export function formatMileage(km: number): string {
  if (km >= 1000) return `${formatNumber(Math.round(km / 1000))} тыс. км`;
  return `${formatNumber(km)} км`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((today - day) / 86_400_000);

  if (days === 0) return `сегодня в ${formatTime(iso)}`;
  if (days === 1) return `вчера в ${formatTime(iso)}`;
  return formatDate(iso);
}

export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
