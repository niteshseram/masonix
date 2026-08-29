import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';
import type { ReactNode } from 'react';

const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiScriptUrl =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ??
  'https://cloud.umami.is/script.js';
const isProduction = process.env.VERCEL_ENV === 'production';

export const metadata: Metadata = {
  metadataBase: new URL('https://masonix.vercel.app'),
  title: {
    default: 'masonix',
    template: '%s | masonix',
  },
  description:
    'React masonry components for responsive grids, measured layouts, and virtualized feeds.',
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
