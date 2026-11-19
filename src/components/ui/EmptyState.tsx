import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  headingLevel?: 1 | 2;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  headingLevel = 2,
}: EmptyStateProps) {
  return (
    <Paper p="xl" className="app-panel app-empty">
      <ThemeIcon size={52} radius="xl" variant="light" color="gray" mx="auto" display="flex">
        {icon ?? <IconSearch size={24} />}
      </ThemeIcon>
      <Text component={headingLevel === 1 ? 'h1' : 'h2'} fw={600} ta="center" mt="md">
        {title}
      </Text>
      <Text className="t-body" c="dimmed" ta="center" mt={8} maw={440} mx="auto">
        {description}
      </Text>
      {action && (
        <Group justify="center" mt={24}>
          {action}
        </Group>
      )}
    </Paper>
  );
}
