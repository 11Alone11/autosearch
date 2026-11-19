import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const BLUE = '#1c7ed6';
const BLUE_DARK = '#1864ab';
const BLUE_LIGHT = '#e7f5ff';
const DARK = '#1a1b1e';
const GRAY = '#495057';
const BORDER = '#dee2e6';
const SURFACE = '#f8f9fa';

const CAR = `<g transform="translate(1.6 1.2) scale(1.2)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
  </g>`;

const icon = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="${radius}" fill="${BLUE}" />
  ${CAR}
</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${SURFACE}" />
  <rect width="1200" height="8" fill="${BLUE}" />
  <g transform="translate(72 80) scale(3.75)">
    <rect width="32" height="32" rx="7.5" fill="${BLUE}" />
    ${CAR}
  </g>
  <text x="212" y="116" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="44" font-weight="700" fill="${DARK}">Автопоиск</text>
  <text x="212" y="154" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="24" fill="${GRAY}">Сохранённые поиски автомобилей</text>
  <line x1="72" y1="226" x2="1128" y2="226" stroke="${BORDER}" stroke-width="2" />
  <text x="72" y="326" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="54" font-weight="700" fill="${DARK}">Находите машину и следите</text>
  <text x="72" y="392" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="54" font-weight="700" fill="${DARK}">за новыми лотами</text>
  <text x="72" y="446" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="28" fill="${GRAY}">Фильтры по марке, году и цене. Один клик — поиск сохранён.</text>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="22" fill="${BLUE_DARK}">
    <rect x="72" y="508" width="250" height="52" rx="26" fill="${BLUE_LIGHT}" />
    <text x="197" y="542" text-anchor="middle">Сохранённые поиски</text>
    <rect x="338" y="508" width="200" height="52" rx="26" fill="${BLUE_LIGHT}" />
    <text x="438" y="542" text-anchor="middle">Счётчик новых</text>
    <rect x="554" y="508" width="164" height="52" rx="26" fill="${BLUE_LIGHT}" />
    <text x="636" y="542" text-anchor="middle">Сортировки</text>
  </g>
</svg>`;

await writeFile('public/favicon.svg', `${icon(7.5)}\n`);
await sharp(Buffer.from(icon(0))).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(Buffer.from(icon(0))).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(og)).png().toFile('public/og.png');
console.log('icons: favicon.svg, favicon-32.png, apple-touch-icon.png, og.png');
