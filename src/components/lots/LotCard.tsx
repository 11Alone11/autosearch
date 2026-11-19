import { Box, Card, Group, Stack, Text } from '@mantine/core';
import { formatMileage, formatPrice, formatRelative } from '../../lib/format';
import type { Lot } from '../../types';
import { LotCardPhoto } from './LotCardPhoto';

export function LotCard({ lot }: { lot: Lot }) {
  const title = `${lot.make} ${lot.model}`;

  return (
    <Card
      component="article"
      aria-labelledby={`lot-${lot.id}-title`}
      className="app-card lot-card"
      padding={12}
      h="100%"
      data-testid="lot-card"
    >
      <Card.Section pos="relative">
        <LotCardPhoto lot={lot} title={title} />
      </Card.Section>

      <Stack gap={4} mt={12} style={{ flex: 1 }}>
        <Text
          component="h2"
          id={`lot-${lot.id}-title`}
          className="t-title"
          lineClamp={1}
          title={title}
        >
          {title}
        </Text>
        <Text className="t-meta" c="dimmed" lineClamp={1}>
          {lot.year} · {formatMileage(lot.mileageKm)} · {lot.bodyType}
        </Text>

        <Box mt={4}>
          <Text className="t-price">{formatPrice(lot.priceUsd)}</Text>
        </Box>

        <Group justify="space-between" align="center" mt="auto" wrap="nowrap" gap={8}>
          <Text
            component="time"
            dateTime={lot.appearedAt}
            className="t-meta"
            c="dimmed"
            lineClamp={1}
          >
            {formatRelative(lot.appearedAt)}
          </Text>
          <Text className="t-meta" c="dimmed" lineClamp={1}>
            {lot.city}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
