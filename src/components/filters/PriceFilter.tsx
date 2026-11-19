import { CloseButton, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useAdaptiveCallback } from '../../hooks/useAdaptiveCallback';
import { useSyncedDraft } from '../../hooks/useSyncedDraft';
import { formatNumber } from '../../lib/format';

const formatDraft = (value: number | undefined): string =>
  value === undefined ? '' : formatNumber(value);

const parsePrice = (text: string): number | undefined => {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : undefined;
};

interface PriceFilterProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function PriceFilter({ value, onChange }: PriceFilterProps) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useSyncedDraft(formatDraft(value), focused);
  const [commitAdaptive, resetAdaptive] = useAdaptiveCallback((next: number | undefined) => {
    onChange(next);
  });

  const commitNow = () => {
    const next = parsePrice(text);
    onChange(next);
    setText(formatDraft(next));
  };

  return (
    <TextInput
      label="Цена до"
      placeholder="Без ограничения"
      leftSection="$"
      size="sm"
      inputMode="numeric"
      value={text}
      onChange={(event) => {
        const digits = event.currentTarget.value.replace(/\D/g, '');
        setText(digits);
        commitAdaptive(parsePrice(digits));
      }}
      onFocus={() => {
        setFocused(true);
        resetAdaptive();
        setText(value === undefined ? '' : String(value));
      }}
      onBlur={() => {
        setFocused(false);
        resetAdaptive();
        commitNow();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      rightSection={
        text ? (
          <CloseButton
            aria-label="Очистить цену"
            onClick={() => {
              resetAdaptive();
              setText('');
              onChange(undefined);
            }}
          />
        ) : null
      }
      data-testid="price-filter"
    />
  );
}
