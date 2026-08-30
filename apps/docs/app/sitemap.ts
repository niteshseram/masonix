import type { MetadataRoute } from 'next';

import { source } from '@/lib/docs-source';
import { toAbsoluteUrl } from '@/lib/seo/seo-config';

const fallbackLastModified = new Date('2026-08-30');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl('/'),
      lastModified: fallbackLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: toAbsoluteUrl('/playground'),
      lastModified: fallbackLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const docsRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: toAbsoluteUrl(page.url),
    lastModified: page.data.lastModified ?? fallbackLastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...docsRoutes];
}
