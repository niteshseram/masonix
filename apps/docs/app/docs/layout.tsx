import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

import { source } from '@/lib/docs-source';
import { baseOptions } from '@/lib/layout-shared';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions()}
      tree={source.getPageTree()}
      sidebar={{
        defaultOpenLevel: 1,
        prefetch: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}
