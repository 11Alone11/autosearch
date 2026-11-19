import { Button } from '@mantine/core';
import { IconRestore } from '@tabler/icons-react';

interface ResetFiltersButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'transparent' | 'light';
  color?: string;
  label?: string;
}

export function ResetFiltersButton({
  onClick,
  disabled,
  variant = 'light',
  color = 'gray',
  label = 'Сбросить',
}: ResetFiltersButtonProps) {
  return (
    <Button
      variant={disabled ? 'transparent' : variant}
      color={color}
      size="sm"
      leftSection={<IconRestore size={16} />}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
