import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: { defaultProps: { radius: 'md', size: 'sm' } },
    ActionIcon: { defaultProps: { radius: 'md' } },
    Card: { defaultProps: { radius: 'lg' } },
    Paper: { defaultProps: { radius: 'lg' } },
    Drawer: { defaultProps: { radius: 'lg' } },
    Notification: {
      defaultProps: {
        closeButtonProps: {
          size: 40,
          radius: 10,
          iconSize: 18,
          'aria-label': 'Закрыть уведомление',
        },
      },
    },
  },
});
