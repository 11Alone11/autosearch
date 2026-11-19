import { Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { EmptyState } from './EmptyState';

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<IconRefresh size={24} />}
      title="Не удалось загрузить лоты"
      description="Файл с данными не загрузился. Проверьте соединение и попробуйте ещё раз."
      action={
        <Button onClick={onRetry} leftSection={<IconRefresh size={20} />}>
          Повторить
        </Button>
      }
    />
  );
}
