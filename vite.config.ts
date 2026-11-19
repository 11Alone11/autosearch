import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const [repoOwner, repoName] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const isUserSite = repoName === `${repoOwner}.github.io`;
const inferredSiteUrl =
  repoOwner && repoName
    ? isUserSite
      ? `https://${repoOwner}.github.io`
      : `https://${repoOwner}.github.io/${repoName}`
    : '';
const envSiteUrl = (process.env.SITE_URL?.trim() ?? '').replace(/\/+$/, '');
const siteUrl = envSiteUrl || inferredSiteUrl;
const base = envSiteUrl
  ? new URL(envSiteUrl).pathname.replace(/\/?$/, '/')
  : repoName
    ? isUserSite
      ? '/'
      : `/${repoName}/`
    : '/';
const pageUrl = siteUrl ? `${siteUrl}/` : base;
const ogImage = siteUrl ? `${siteUrl}/og.png` : `${base}og.png`;

function seoUrls(): Plugin {
  return {
    name: 'seo-urls',
    transformIndexHtml(html) {
      return html
        .replaceAll('%OG_URL%', pageUrl)
        .replaceAll('%OG_IMAGE%', ogImage);
    },
  };
}

export default defineConfig({
  base,
  plugins: [react({ compiler: true }), seoUrls()],
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
