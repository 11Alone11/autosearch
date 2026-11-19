import { Box, Card, Grid, Group, Paper, SimpleGrid, Skeleton, Stack } from '@mantine/core';

function LotCardSkeleton() {
  return (
    <Card className="lot-card" padding={12} h="100%">
      <Card.Section>
        <Skeleton height={180} radius={0} />
      </Card.Section>
      <Stack gap={4} mt={12} style={{ flex: 1 }}>
        <Skeleton height={20} width="70%" radius="sm" />
        <Skeleton height={16} width="58%" radius="sm" />
        <Box mt={4}>
          <Skeleton height={24} width={96} radius="sm" />
        </Box>
        <Group justify="space-between" align="center" mt="auto" wrap="nowrap" gap={8}>
          <Skeleton height={16} width={84} radius="sm" />
          <Skeleton height={16} width={56} radius="sm" />
        </Group>
      </Stack>
    </Card>
  );
}

function LotsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="md" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <LotCardSkeleton key={index} />
      ))}
    </SimpleGrid>
  );
}

function FiltersPanelSkeleton() {
  return (
    <Stack gap="md" aria-hidden>
      <Box>
        <Skeleton height={20} width={44} radius="sm" mb={4} />
        <Skeleton height={36} radius="md" />
      </Box>
      <Box>
        <Skeleton height={20} width={84} radius="sm" mb={4} />
        <Skeleton height={24} radius="xl" />
        <Skeleton height={24} width={112} radius="sm" mt={8} />
      </Box>
      <Box>
        <Skeleton height={20} width={56} radius="sm" mb={4} />
        <Skeleton height={36} radius="md" />
      </Box>
    </Stack>
  );
}

function ResultsToolbarSkeleton() {
  return (
    <Group
      justify="space-between"
      gap="sm"
      wrap="nowrap"
      py={8}
      className="results-toolbar"
      aria-hidden
    >
      <Group gap="sm" wrap="nowrap">
        <Skeleton height={36} width={36} radius="md" hiddenFrom="md" />
        <Skeleton height={20} width={104} radius="sm" />
      </Group>
      <Skeleton height={36} width={128} radius="md" hiddenFrom="sm" />
      <Skeleton height={36} width={284} radius="md" visibleFrom="sm" />
    </Group>
  );
}

export function LotsPageSkeleton() {
  return (
    <Grid gap={24} aria-busy="true" aria-label="Загружаем лоты">
      <Grid.Col span={{ base: 12, md: 4, lg: 3 }} visibleFrom="md">
        <Paper p="md" className="app-panel">
          <Group justify="space-between" align="center" mb={16} wrap="nowrap">
            <Skeleton height={20} width={56} radius="sm" />
            <Skeleton height={36} width={92} radius="sm" />
          </Group>
          <FiltersPanelSkeleton />
          <Skeleton height={36} radius="md" mt={16} />
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
        <ResultsToolbarSkeleton />
        <LotsGridSkeleton />
      </Grid.Col>
    </Grid>
  );
}

export function SearchesPageSkeleton() {
  return (
    <Stack
      gap="md"
      aria-busy="true"
      aria-label="Загружаем сохранённые поиски"
    >
      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Skeleton height={32} width={180} radius="sm" />
          <Skeleton height={20} width={140} radius="sm" />
        </Stack>
        <Skeleton height={36} width={120} radius="md" />
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index} padding="md" className="app-card saved-search-card">
            <Skeleton height={20} width="60%" radius="sm" />
            <Skeleton height={16} width="40%" radius="sm" mt={4} />
            <Group gap={8} mt="md">
              <Skeleton height={24} width={96} radius="xl" />
              <Skeleton height={24} width={120} radius="xl" />
            </Group>
            <Skeleton height={36} radius="md" mt="md" />
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
