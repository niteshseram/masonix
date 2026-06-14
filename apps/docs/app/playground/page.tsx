import type { Metadata } from 'next';

import PlaygroundApp from '@/components/playground/playground-app';

export const metadata: Metadata = {
  title: 'Playground',
  description:
    'Tune Masonix layouts, virtual scrolling, measured heights, and responsive masonry options.',
};

export default function PlaygroundPage() {
  return (
    <main className="masonix-tool-surface h-dvh overflow-hidden">
      <PlaygroundApp />
    </main>
  );
}
