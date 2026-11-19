import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJSON, setStorageErrorHandler, writeJSON } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
  setStorageErrorHandler(null);
});

describe('readJSON / writeJSON', () => {
  it('сохраняет и читает значение', () => {
    writeJSON('test.key', { items: [1, 2, 3] });
    const value = readJSON('test.key', (raw) => raw as { items: number[] }, { items: [] });
    expect(value.items).toEqual([1, 2, 3]);
  });

  it('возвращает fallback, если ключа нет', () => {
    expect(readJSON('missing', (raw) => raw as number, 0)).toBe(0);
  });

  it('возвращает fallback на битом JSON', () => {
    window.localStorage.setItem('broken', '{not json');
    expect(readJSON('broken', (raw) => raw as unknown[], [])).toEqual([]);
  });

  it('возвращает fallback, если валидатор не принял данные', () => {
    window.localStorage.setItem('wrong-shape', '{"a":1}');
    const value = readJSON('wrong-shape', (raw) => (Array.isArray(raw) ? raw : null), []);
    expect(value).toEqual([]);
  });

  it('не роняет приложение при переполнении хранилища и сообщает об ошибке', () => {
    const handler = vi.fn();
    setStorageErrorHandler(handler);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(writeJSON('test.key', {})).toBe(false);
    expect(handler).toHaveBeenCalledOnce();
  });
});
