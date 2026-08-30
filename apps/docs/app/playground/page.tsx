import type { Metadata } from 'next';

import PlaygroundApp from '@/components/playground/playground-app';
import { createSeoMetadata } from '@/lib/seo/seo-config';

const playgroundDescription =
  'Tune Masonix layouts, virtual scrolling, measured heights, and responsive masonry options.';

export const metadata: Metadata = createSeoMetadata({
  title: 'Playground',
  description: playgroundDescription,
  pathname: '/playground',
});

export default function PlaygroundPage() {
  return (
    <main className="masonix-tool-surface h-dvh overflow-hidden">
      <PlaygroundApp />
    </main>
  );
}
