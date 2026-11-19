import { MantineProvider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Notifications, notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { RouterProvider, createHashRouter } from 'react-router';
import { setStorageErrorHandler } from './state/storage';
import { routes } from './routes';
import { theme } from './theme';

const router = createHashRouter(routes);

export function App() {
  const isMobile = useMediaQuery('(max-width: 991px)');

  useEffect(() => {
    setStorageErrorHandler((message) => {
      notifications.show({
        color: 'red',
        title: 'Хранилище',
        message,
        autoClose: 8000,
      });
    });
    return () => setStorageErrorHandler(null);
  }, []);

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications
        position={isMobile ? 'top-center' : 'bottom-right'}
        containerWidth={isMobile ? 'calc(100% - 32px)' : 360}
        zIndex={400}
      />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
