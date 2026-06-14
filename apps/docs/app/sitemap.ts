import type { MetadataRoute } from 'next';

import { source } from '@/lib/docs-source';

const SITE_URL = 'https://masonix.vercel.app';

function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: toAbsoluteUrl('/docs'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: toAbsoluteUrl('/playground'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const docsRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: toAbsoluteUrl(page.url),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...docsRoutes];
}
