import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  base: process.env.BASE_PATH ?? (repoName ? `/${repoName}/` : '/'),
  plugins: [react({ compiler: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/@mantine') || id.includes('node_modules/@tabler')) {
            return 'mantine';
          }
          if (id.includes('node_modules/react')) return 'react';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
