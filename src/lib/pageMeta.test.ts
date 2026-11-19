import { describe, expect, it } from 'vitest';
import { pageMeta } from './pageMeta';

describe('pageMeta', () => {
  it('даёт заголовок и описание для каталога', () => {
    const meta = pageMeta('/');
    expect(meta.title).toBe('Автопоиск — сохранённые поиски автомобилей');
    expect(meta.description.length).toBeGreaterThan(60);
  });

  it('даёт отдельные метаданные для «Моих поисков»', () => {
    expect(pageMeta('/searches').title).toBe('Мои поиски — Автопоиск');
    expect(pageMeta('/searches').description).not.toBe(pageMeta('/').description);
  });

  it('не зависит от завершающего слэша', () => {
    expect(pageMeta('/searches/')).toEqual(pageMeta('/searches'));
    expect(pageMeta('/')).toEqual(pageMeta(''));
  });

  it('возвращает метаданные 404 для неизвестного адреса', () => {
    expect(pageMeta('/unknown').title).toBe('Страница не найдена — Автопоиск');
  });

  it('держит заголовки короткими, а описания — в пределах сниппета', () => {
    const pages = ['/', '/searches', '/unknown'].map(pageMeta);
    for (const meta of pages) {
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeLessThanOrEqual(160);
    }
    expect(new Set(pages.map((meta) => meta.title)).size).toBe(pages.length);
  });
});
