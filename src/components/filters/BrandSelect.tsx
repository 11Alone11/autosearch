import { Select } from '@mantine/core';

interface BrandSelectProps {
  value: string | undefined;
  makes: string[];
  onChange: (make: string | undefined) => void;
}

export function BrandSelect({ value, makes, onChange }: BrandSelectProps) {
  return (
    <Select
      label="Марка"
      placeholder="Любая"
      data={makes}
      value={value ?? null}
      onChange={(next) => onChange(next ?? undefined)}
      searchable
      clearable
      size="sm"
      maxDropdownHeight={200}
      nothingFoundMessage="Такой марки нет"
      comboboxProps={{
        shadow: 'md',
        zIndex: 400,
        width: 'target',
        position: 'bottom-start',
        floatingStrategy: 'fixed',
      }}
    />
  );
}
