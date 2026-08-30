import type { MetadataRoute } from 'next';

import { seoSiteUrl, toAbsoluteUrl } from '@/lib/seo/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: toAbsoluteUrl('/sitemap.xml'),
    host: seoSiteUrl.origin,
  };
}
