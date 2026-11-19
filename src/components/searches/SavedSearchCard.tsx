import { ActionIcon, Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconArrowRight, IconTrash } from '@tabler/icons-react';
import { formatDate } from '../../lib/format';
import type { SavedSearch } from '../../types';

interface SavedSearchCardProps {
  search: SavedSearch;
  newCount: number;
  onOpen: () => void;
  onDelete: () => void;
}

export function SavedSearchCard({ search, newCount, onOpen, onDelete }: SavedSearchCardProps) {
  return (
    <Card padding="md" h="100%" className="app-card saved-search-card">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap={8}>
        <Stack gap={4}>
          <Text fw={600} lineClamp={2}>
            {search.name}
          </Text>
          <Text size="xs" c="dimmed">
            Сохранён {formatDate(search.createdAt)}
          </Text>
        </Stack>
        <ActionIcon
          variant="subtle"
          color="red"
          size={36}
          aria-label={`Удалить поиск «${search.name}»`}
          onClick={onDelete}
        >
          <IconTrash size={20} />
        </ActionIcon>
      </Group>

      <Group gap={8} mt="md" aria-live="polite">
        <Badge variant="light" color={newCount > 0 ? 'teal' : 'gray'} size="lg">
          {newCount > 0 ? `+${newCount} новых` : 'Нет новых'}
        </Badge>
        <Badge variant="light" color="gray" size="lg">
          {search.criteria.sort === 'cheapest'
            ? 'Сначала дешёвые'
            : 'Сначала новые'}
        </Badge>
      </Group>

      <Button
        mt="md"
        fullWidth
        variant="light"
        rightSection={<IconArrowRight size={20} />}
        onClick={onOpen}
      >
        Открыть поиск
      </Button>
    </Card>
  );
}
