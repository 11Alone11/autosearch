import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

const problems = [];

function record(name, height, expected) {
  const ok = Math.abs(height - expected) < 0.01 && Math.round(height) % 4 === 0;
  if (!ok) problems.push(`${name}: ${height} px (ожидалось ${expected})`);
  return `${height} px`;
}

async function readBlocks(page, prefix) {
  return page.evaluate((p) => {
    const h = (selector) => {
      const el = document.querySelector(selector);
      return el ? +el.getBoundingClientRect().height.toFixed(2) : null;
    };
    return {
      card: h(p === 'skeleton' ? '.lot-card:not(.app-card)' : '.app-card'),
      panel: h('.app-panel'),
      toolbar: h('.results-toolbar'),
    };
  }, prefix);
}

async function main() {
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  );

  const real = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await real.goto(BASE, { waitUntil: 'networkidle' });
  await real.waitForTimeout(700);

  const blocks = await readBlocks(real, 'real');
  const controls = await real.evaluate(() => {
    const h = (selector) => {
      const el = document.querySelector(selector);
      return el ? +el.getBoundingClientRect().height.toFixed(2) : null;
    };
    return {
      header: h('header'),
      select: h('.mantine-Select-input'),
      price: h('[data-testid="price-filter"]'),
      save: h('[data-testid="save-search"]'),
      reset: h('.app-panel button'),
      add: h('[data-testid="add-lots"]'),
      segmented: h('.mantine-SegmentedControl-root'),
      label: h('label.mantine-InputWrapper-label'),
      title: h('.app-card .t-title'),
      meta: h('.app-card .t-meta'),
      priceText: h('.app-card .t-price'),
      image: h('.app-card img'),
    };
  });

  const expected = {
    card: 296,
    panel: 368,
    toolbar: 52,
  };

  const table = {
    'карточка': record('карточка', blocks.card, expected.card),
    'панель фильтров': record('панель фильтров', blocks.panel, expected.panel),
    'тулбар': record('тулбар', blocks.toolbar, expected.toolbar),
    'шапка': record('шапка', controls.header, 64),
    'селект': record('селект', controls.select, 36),
    'цена': record('цена', controls.price, 36),
    'кнопка «следить»': record('кнопка «следить»', controls.save, 36),
    'кнопка «сбросить»': record('кнопка «сбросить»', controls.reset, 36),
    'кнопка «добавить»': record('кнопка «добавить»', controls.add, 36),
    'сегменты': record('сегменты', controls.segmented, 36),
    'подпись поля': record('подпись поля', controls.label, 20),
    'заголовок карточки': record('заголовок карточки', controls.title, 20),
    'мета карточки': record('мета карточки', controls.meta, 16),
    'цена в карточке': record('цена в карточке', controls.priceText, 24),
    'фото': record('фото', controls.image, 180),
  };

  const skeleton = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await skeleton.route('**/src/data/lots.json**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await route.continue();
  });
  await skeleton.goto(BASE, { waitUntil: 'domcontentloaded' });
  await skeleton.waitForTimeout(700);
  const skeletonBlocks = await readBlocks(skeleton, 'skeleton');

  const hasSkeleton = skeletonBlocks.card !== null;
  if (hasSkeleton) {
    record('скелетон карточки', skeletonBlocks.card, expected.card);
    record('скелетон панели', skeletonBlocks.panel, expected.panel);
    record('скелетон тулбара', skeletonBlocks.toolbar, expected.toolbar);
  }

  await browser.close();

  console.log('Высоты в живом интерфейсе:');
  for (const [name, value] of Object.entries(table)) console.log(`  ${name.padEnd(22)} ${value}`);
  console.log('Скелетоны:');
  if (hasSkeleton) {
    console.log(`  карточка ${skeletonBlocks.card} px, панель ${skeletonBlocks.panel} px, тулбар ${skeletonBlocks.toolbar} px`);
  } else {
    console.log('  не пойманы — паритет проверяется только на dev-сервере');
  }

  if (problems.length > 0) {
    console.error(`\nПроблемы (${problems.length}):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log('\nВсё кратно 4 px, скелетоны совпадают.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
