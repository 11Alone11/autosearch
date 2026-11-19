import {
  AppShell,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconBell, IconCar, IconList } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useNewLotsTotal } from '../../state/useNewLotsTotal';
import { AddLotsButton } from '../lots/AddLotsButton';

const NAV_ITEMS = [
  { to: '/', label: 'Лоты' },
  { to: '/searches', label: 'Мои поиски' },
];

const CONTAINER_PX = { base: 'md', sm: 'lg' };

function NavIcon({ to, size }: { to: string; size: number }) {
  return to === '/' ? <IconList size={size} /> : <IconBell size={size} />;
}

export function AppLayout() {
  const newLotsTotal = useNewLotsTotal();
  const { pathname } = useLocation();
  usePageMeta(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const badge = (to: string) =>
    to === '/searches' && newLotsTotal > 0 ? newLotsTotal : undefined;

  return (
    <AppShell
      header={{ height: 'calc(64px + env(safe-area-inset-top, 0px))' }}
      padding={0}
    >
      <AppShell.Header style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <Container size="lg" h="100%" px={CONTAINER_PX}>
          <Group h="100%" justify="space-between" wrap="nowrap" gap="sm">
            <UnstyledButton
              component={Link}
              to="/"
              className="app-brand"
              aria-label="Автопоиск — на главную"
            >
              <Group gap={8} wrap="nowrap">
                <ThemeIcon size={40} radius="md">
                  <IconCar size={24} />
                </ThemeIcon>
                <Text fw={700} fz="lg" visibleFrom="xs">
                  Автопоиск
                </Text>
              </Group>
            </UnstyledButton>

            <Box component="nav" aria-label="Основная навигация" visibleFrom="md">
              <Group gap={8}>
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    variant={pathname === item.to ? 'light' : 'subtle'}
                    leftSection={<NavIcon to={item.to} size={20} />}
                    rightSection={
                      badge(item.to) ? (
                        <Badge size="sm" variant="filled" radius="xl" px={4} miw={20} aria-live="polite">
                          {badge(item.to)}
                        </Badge>
                      ) : undefined
                    }
                  >
                    {item.label}
                  </Button>
                ))}
              </Group>
            </Box>

            <AddLotsButton />
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" px={CONTAINER_PX} className="app-main">
          <Outlet />
        </Container>
      </AppShell.Main>

      <Box
        component="nav"
        hiddenFrom="md"
        aria-label="Основная навигация"
        style={{
          position: 'fixed',
          insetInline: 0,
          bottom: 0,
          zIndex: 200,
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          backgroundColor: 'var(--mantine-color-body)',
          boxShadow: 'inset 0 1px 0 var(--mantine-color-default-border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Container px={CONTAINER_PX} h="100%">
          <Group grow gap={8} h="100%" align="stretch">
            {NAV_ITEMS.map((item) => (
              <BottomTab
                key={item.to}
                {...item}
                badge={badge(item.to)}
                active={pathname === item.to}
              />
            ))}
          </Group>
        </Container>
      </Box>
    </AppShell>
  );
}

function BottomTab({
  to,
  label,
  badge,
  active,
}: { to: string; label: string; badge?: number; active: boolean }) {
  return (
    <UnstyledButton
      component={Link}
      to={to}
      className="app-bottom-tab"
      data-active={active}
      aria-current={active ? 'page' : undefined}
      h="100%"
      style={{
        color: active ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-7)',
        backgroundColor: active ? 'var(--mantine-primary-color-light)' : undefined,
      }}
    >
      <Stack gap={4} align="center" justify="center" h="100%">
        <ThemeIcon variant="transparent" color={active ? 'blue' : 'gray'} size={28}>
          <NavIcon to={to} size={24} />
        </ThemeIcon>
        <Group gap={4} wrap="nowrap">
          <Text size="sm" fw={active ? 700 : 600} c="inherit" lh="16px">
            {label}
          </Text>
          {badge !== undefined && (
            <Badge size="sm" variant="filled" radius="xl" px={4} miw={20} aria-live="polite">
              {badge}
            </Badge>
          )}
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
