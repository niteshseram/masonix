'use client';

// docs:start article-cards
import { clsx } from 'clsx';
import { MasonryBalanced } from 'masonix';
// docs:end article-cards

import { DemoFrame } from '@/components/docs/examples/docs-example-frame';

// docs:start article-cards
type Article = {
  id: string;
  title: string;
  section: string;
  excerpt: string;
  readTime: string;
  accent: string;
};

function ArticleCard({ article }: { article: Article }) {
  return (
    <article
      className={clsx(
        'overflow-hidden',
        'p-5',
        'rounded-xl border',
        'border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ background: article.accent }}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {article.section}
        </p>
      </div>
      <h3 className="mt-4 text-base font-semibold leading-6">
        {article.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {article.excerpt}
      </p>
      <p className="mt-5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {article.readTime} read
      </p>
    </article>
  );
}

export function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <MasonryBalanced
      items={articles}
      columns={{ 0: 1, 640: 2 }}
      gap={16}
      estimatedItemHeight={220}
      itemKey={(article) => article.id}
      render={({ data }) => <ArticleCard article={data} />}
    />
  );
}
// docs:end article-cards

const articleItems: Article[] = [
  {
    id: 'feed-performance',
    title: 'Designing feeds that still feel fast at 10,000 items',
    section: 'Performance',
    excerpt:
      'A practical guide to windowing, measurement, and when placeholders improve the scroll experience.',
    readTime: '7 min',
    accent: '#60a5fa',
  },
  {
    id: 'image-geometry',
    title: 'Treat image dimensions as layout data',
    section: 'Images',
    excerpt:
      'Known width and height values let the layout settle before media finishes loading.',
    readTime: '4 min',
    accent: '#34d399',
  },
  {
    id: 'semantic-grids',
    title: 'Masonry grids can still be semantic',
    section: 'Accessibility',
    excerpt:
      'Source order, list roles, and item metadata matter more than the visual column a card lands in.',
    readTime: '5 min',
    accent: '#f472b6',
  },
  {
    id: 'responsive-breakpoints',
    title: 'Container breakpoints beat viewport assumptions',
    section: 'Responsive',
    excerpt:
      'Use breakpoint maps when the component lives inside panels, sidebars, or resizable workspaces.',
    readTime: '6 min',
    accent: '#fbbf24',
  },
  {
    id: 'card-composition',
    title: 'Composing card systems around unknown height',
    section: 'Design',
    excerpt:
      'Small differences in copy, badges, and media ratios add up. Balanced placement keeps the page calm.',
    readTime: '8 min',
    accent: '#a78bfa',
  },
];

export function ArticleCardsDemo() {
  return (
    <DemoFrame>
      <ArticleGrid articles={articleItems} />
    </DemoFrame>
  );
}

export function BalancedMasonryDemo() {
  return <ArticleCardsDemo />;
}
