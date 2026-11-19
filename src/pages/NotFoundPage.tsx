import { Button } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={<IconSearch size={24} />}
      title="Страница не найдена"
      description="Возможно, ссылка устарела. Вернитесь к списку лотов — там всё на месте."
      action={
        <Button component={Link} to="/" variant="light">
          К лотам
        </Button>
      }
    />
  );
}
