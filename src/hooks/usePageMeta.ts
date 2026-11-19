import { useEffect } from 'react';
import { pageMeta } from '../lib/pageMeta';

function setMetaContent(selector: string, content: string): void {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

export function usePageMeta(pathname: string): void {
  useEffect(() => {
    const meta = pageMeta(pathname);
    document.title = meta.title;
    setMetaContent('meta[name="description"]', meta.description);
    setMetaContent('meta[property="og:title"]', meta.title);
    setMetaContent('meta[property="og:description"]', meta.description);
    setMetaContent('meta[name="twitter:title"]', meta.title);
    setMetaContent('meta[name="twitter:description"]', meta.description);
  }, [pathname]);
}
