import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

import './globals.css';
import {
  seoDefaultDescription,
  seoHomeTitle,
  seoSiteName,
  seoSiteUrl,
} from '@/lib/seo/seo-config';

const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiScriptUrl =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ??
  'https://cloud.umami.is/script.js';
const isProduction = process.env.VERCEL_ENV === 'production';

export const metadata: Metadata = {
  metadataBase: seoSiteUrl,
  title: {
    default: seoHomeTitle,
    template: `%s — ${seoSiteName}`,
  },
  description: seoDefaultDescription,
  applicationName: seoSiteName,
  authors: [{ name: 'Nitesh Seram' }],
  creator: 'Nitesh Seram',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
      {umamiWebsiteId && isProduction && (
        <Script
          data-website-id={umamiWebsiteId}
          src={umamiScriptUrl}
          strategy="afterInteractive"
        />
      )}
    </html>
  );
}
