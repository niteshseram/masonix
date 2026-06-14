import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://masonix.vercel.app'),
  title: {
    default: 'masonix',
    template: '%s | masonix',
  },
  description:
    'React masonry components for responsive grids, measured layouts, and virtualized feeds.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
