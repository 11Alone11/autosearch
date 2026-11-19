import { MantineProvider } from '@mantine/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PriceFilter } from './PriceFilter';

const normalize = (value: string) => value.replace(/\u00a0/g, ' ');

function setup(value: number | undefined = undefined) {
  const onChange = vi.fn();
  render(
    <MantineProvider>
      <PriceFilter value={value} onChange={onChange} />
    </MantineProvider>,
  );
  return { onChange, input: screen.getByLabelText<HTMLInputElement>('Цена до') };
}

function Controlled() {
  const [value, setValue] = useState<number | undefined>(undefined);
  return <PriceFilter value={value} onChange={setValue} />;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('PriceFilter', () => {
  it('не форматирует число, пока пользователь печатает', async () => {
    const user = userEvent.setup();
    const { input } = setup();

    await user.type(input, '15000');

    expect(normalize(input.value)).toBe('15000');
  });

  it('по уходу из поля применяет фильтр и показывает разделители', async () => {
    const user = userEvent.setup();
    const { input, onChange } = setup();

    await user.type(input, '15000');
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith(15000);
    expect(normalize(input.value)).toBe('15 000');
  });

  it('не показывает разделители, пока фокус в поле, даже если фильтр уже применился', async () => {
    const user = userEvent.setup();
    render(
      <MantineProvider>
        <Controlled />
      </MantineProvider>,
    );
    const input = screen.getByLabelText<HTMLInputElement>('Цена до');

    await user.type(input, '15000');
    await sleep(400);

    expect(input.value).toBe('15000');

    await user.tab();
    expect(normalize(input.value)).toBe('15 000');
  });

  it('пустое поле снимает ограничение по цене', async () => {
    const user = userEvent.setup();
    const { input, onChange } = setup(15_000);

    await user.clear(input);
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('применяет цену один раз после паузы 250 мс', () => {
    vi.useFakeTimers();
    try {
      const { input, onChange } = setup();

      fireEvent.change(input, { target: { value: '15000' } });
      expect(onChange).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(249));
      expect(onChange).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(15000);
    } finally {
      vi.useRealTimers();
    }
  });

  it('при фокусе показывает число без разделителей', async () => {
    const user = userEvent.setup();
    const { input } = setup(15_000);

    await user.click(input);

    expect(input.value).toBe('15000');

    await user.tab();
    expect(normalize(input.value)).toBe('15 000');
  });

  it('очистка отменяет отложенное применение цены', async () => {
    const user = userEvent.setup();
    const { input, onChange } = setup();

    await user.type(input, '15000');
    await user.click(screen.getByLabelText('Очистить цену'));
    await sleep(350);

    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(input.value).toBe('');
  });
});
