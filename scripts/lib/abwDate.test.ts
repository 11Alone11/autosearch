import { describe, expect, it } from 'vitest';
import { parseAbwDate } from './abwDate';

const NOW = new Date(2026, 10, 18, 20, 0, 0);

describe('parseAbwDate', () => {
  it('разбирает «N минут назад»', () => {
    const date = parseAbwDate('27 минут назад', NOW);
    expect(date?.getTime()).toBe(NOW.getTime() - 27 * 60_000);
  });

  it('разбирает «N часов назад»', () => {
    const date = parseAbwDate('3 часа назад', NOW);
    expect(date?.getTime()).toBe(NOW.getTime() - 3 * 60 * 60_000);
  });

  it('разбирает «сегодня в 17:12»', () => {
    const date = parseAbwDate('сегодня в 17:12', NOW);
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(10);
    expect(date?.getDate()).toBe(18);
    expect(date?.getHours()).toBe(17);
    expect(date?.getMinutes()).toBe(12);
  });

  it('разбирает «вчера в 0:55»', () => {
    const date = parseAbwDate('вчера в 0:55', NOW);
    expect(date?.getDate()).toBe(17);
    expect(date?.getHours()).toBe(0);
    expect(date?.getMinutes()).toBe(55);
  });

  it('разбирает абсолютную дату с годом', () => {
    const date = parseAbwDate('5 Ноября 2026', NOW);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(10);
    expect(date?.getDate()).toBe(5);
  });

  it('без года берёт текущий год', () => {
    const date = parseAbwDate('28 марта', NOW);
    expect(date?.getFullYear()).toBe(NOW.getFullYear());
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(28);
  });

  it('возвращает null на незнакомом формате', () => {
    expect(parseAbwDate('позавчера', NOW)).toBeNull();
    expect(parseAbwDate('', NOW)).toBeNull();
  });
});
