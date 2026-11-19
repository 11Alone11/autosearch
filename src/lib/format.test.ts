import { describe, expect, it } from 'vitest';
import { formatDate, formatMileage, formatNumber, formatPrice, formatRelative, formatTime } from './format';

const now = new Date(2026, 10, 18, 20, 0);

describe('formatRelative', () => {
  it('сегодня показывает время', () => {
    const iso = new Date(2026, 10, 18, 17, 30).toISOString();
    expect(formatRelative(iso, now)).toBe('сегодня в 17:30');
  });

  it('вчера показывает время', () => {
    const iso = new Date(2026, 10, 17, 21, 45).toISOString();
    expect(formatRelative(iso, now)).toBe('вчера в 21:45');
  });

  it('раньше вчера показывает конкретную дату, а не «2 недели назад»', () => {
    const iso = new Date(2026, 10, 1, 10, 0).toISOString();
    expect(formatRelative(iso, now)).toBe('1 ноя 2026');
  });

  it('переход через полночь считается по календарным дням', () => {
    const lateNight = new Date(2026, 10, 18, 0, 30);
    const yesterdayEvening = new Date(2026, 10, 17, 23, 50).toISOString();
    expect(formatRelative(yesterdayEvening, lateNight)).toBe('вчера в 23:50');
  });
});

describe('formatDate и formatTime', () => {
  it('дата без «г.» и лишних точек', () => {
    expect(formatDate(new Date(2026, 10, 5).toISOString())).toBe('5 ноя 2026');
  });

  it('время с ведущим нулём', () => {
    expect(formatTime(new Date(2026, 10, 5, 9, 5).toISOString())).toBe('09:05');
  });
});


describe('числа', () => {
  const normalize = (value: string) => value.replace(/\u00a0/g, ' ');

  it('форматирует число с разделителями разрядов', () => {
    expect(normalize(formatNumber(15_000))).toBe('15 000');
  });

  it('добавляет к цене знак доллара', () => {
    expect(normalize(formatPrice(15_000))).toBe('$15 000');
  });

  it('сокращает пробег до тысяч километров', () => {
    expect(normalize(formatMileage(215_000))).toBe('215 тыс. км');
    expect(normalize(formatMileage(500))).toBe('500 км');
  });
});
