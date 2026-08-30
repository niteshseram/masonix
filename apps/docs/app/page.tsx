import { clsx } from 'clsx';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/brand/brand-logo';
import { HomeInstallCommand } from '@/components/home/home-install-command';
import { HomeMasonryStage } from '@/components/home/home-masonry-stage';
import { HomeReveal } from '@/components/home/home-motion';
import { HomePerformanceLab } from '@/components/home/home-performance-lab';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import {
  seoDefaultDescription,
  seoHomeTitle,
  seoSiteName,
  seoSiteUrl,
  seoSocialImage,
} from '@/lib/seo/seo-config';

type Strategy = {
  id: 'masonry' | 'balanced' | 'virtual';
  name: string;
  label: string;
  detail: string;
  href: string;
};

const strategies: Strategy[] = [
  {
    id: 'masonry',
    name: 'Masonry',
    label: 'CSS-first',
    detail:
      'Responsive CSS placement for galleries, product grids, and smaller feeds.',
    href: '/docs/components/masonry',
  },
  {
    id: 'balanced',
    name: 'MasonryBalanced',
    label: 'Measured',
    detail:
      'Measured shortest-column placement when rendered card heights vary.',
    href: '/docs/components/masonry-balanced',
  },
  {
    id: 'virtual',
    name: 'MasonryVirtual',
    label: 'Windowed',
    detail:
      'Windowed rendering and scroll controls for large or long-running feeds.',
    href: '/docs/components/masonry-virtual',
  },
];

const guideLinks = [
  {
    title: 'Server rendering',
    detail: 'Stable defaults and known dimensions for predictable hydration.',
    href: '/docs/guide/ssr-and-nextjs',
  },
  {
    title: 'Accessibility',
    detail: 'List semantics, source order, and optional count announcements.',
    href: '/docs/guide/accessibility',
  },
  {
    title: 'Responsive layouts',
    detail: 'Use breakpoint maps or let the container determine column count.',
    href: '/docs/guide/responsive-layouts',
  },
  {
    title: 'Performance',
    detail:
      'Choose measurement and virtualization only when the workload needs it.',
    href: '/docs/guide/performance',
  },
] as const;

const quickExample = `import { MasonryBalanced } from 'masonix';

export function Gallery({ photos }) {
  return (
    <MasonryBalanced
      items={photos}
      columnWidth={260}
      maxColumns={4}
      gap={16}
      getItemHeight={(photo, _index, width) =>
        width * (photo.height / photo.width)
      }
      itemKey={(photo) => photo.id}
      render={PhotoCard}
    />
  );
}`;

export const metadata: Metadata = {
  title: {
    absolute: seoHomeTitle,
  },
  description: seoDefaultDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: seoHomeTitle,
    description: seoDefaultDescription,
    url: '/',
    siteName: seoSiteName,
    type: 'website',
    images: [seoSocialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoHomeTitle,
    description: seoDefaultDescription,
    images: [seoSocialImage.url],
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${seoSiteUrl.origin}/#website`,
      url: seoSiteUrl.origin,
      name: seoSiteName,
      description: seoDefaultDescription,
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${seoSiteUrl.origin}/#software`,
      name: seoSiteName,
      description: seoDefaultDescription,
      url: seoSiteUrl.origin,
      codeRepository: 'https://github.com/niteshseram/masonix',
      programmingLanguage: ['TypeScript', 'JavaScript'],
      runtimePlatform: 'React',
      license: 'https://opensource.org/license/mit',
      isAccessibleForFree: true,
      keywords: [
        'React masonry grid',
        'virtualized masonry',
        'responsive masonry layout',
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <main className={clsx('min-h-dvh', 'bg-fd-background')}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData).replace(/</g, '\\u003c'),
        }}
      />
      <header
        className={clsx(
          'sticky top-0 z-30',
          'border-b backdrop-blur-lg',
          'border-fd-border bg-fd-background/88',
        )}
      >
        <nav
          className={clsx(
            'flex h-14 max-w-7xl items-center gap-4',
            'mx-auto px-4 sm:px-6',
          )}
        >
          <Link href="/" className={clsx('flex items-center', 'font-semibold')}>
            <Logo size={25} />
          </Link>
          <div
            className={clsx(
              'flex items-center gap-3 sm:gap-5',
              'ml-auto',
              'text-sm',
              'text-fd-muted-foreground',
            )}
          >
            <Link
              href="/docs/guide/getting-started"
              className={clsx('transition-colors', 'hover:text-fd-foreground')}
            >
              Docs
            </Link>
            <Link
              href="/playground"
              className={clsx('transition-colors', 'hover:text-fd-foreground')}
            >
              Playground
            </Link>
            <a
              href="https://github.com/niteshseram/masonix"
              className={clsx(
                'hidden sm:inline',
                'transition-colors',
                'hover:text-fd-foreground',
              )}
            >
              GitHub
            </a>
            <ThemeSwitcher />
          </div>
        </nav>
      </header>

      <section
        className={clsx('overflow-hidden', 'border-b', 'border-fd-border')}
      >
        <div
          className={clsx(
            'grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start',
            'mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:py-24',
          )}
        >
          <HomeReveal className="max-w-2xl lg:pt-8">
            <p
              className={clsx(
                'text-sm font-medium',
                'text-blue-600 dark:text-blue-400',
              )}
            >
              Masonix
            </p>
            <h1
              className={clsx(
                'mt-5',
                'text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl',
                'text-fd-foreground',
              )}
            >
              Responsive masonry layouts for React.
            </h1>
            <p
              className={clsx(
                'max-w-xl',
                'mt-6',
                'text-base leading-7 sm:text-lg sm:leading-8',
                'text-fd-muted-foreground',
              )}
            >
              A small set of components for CSS masonry, measured
              shortest-column placement, and virtualized feeds. Supports
              responsive columns, server rendering, and custom card markup.
            </p>
            <div className={clsx('flex flex-wrap items-center gap-3', 'mt-8')}>
              <Link
                href="/docs/guide/getting-started"
                className={clsx(
                  'inline-flex items-center gap-2',
                  'px-4 py-2.5',
                  'rounded-md',
                  'text-sm font-medium',
                  'bg-fd-primary text-fd-primary-foreground',
                  'transition-[transform,opacity] duration-200',
                  'hover:-translate-y-0.5 hover:opacity-90',
                )}
              >
                Get started
                <span aria-hidden="true">→</span>
              </Link>
              <HomeInstallCommand compact />
            </div>
          </HomeReveal>

          <HomeReveal delay={0.1}>
            <HomeMasonryStage />
          </HomeReveal>
        </div>
      </section>

      <section className={clsx('border-b', 'border-fd-border')}>
        <div
          className={clsx('max-w-7xl', 'mx-auto px-4 py-16 sm:px-6 sm:py-20')}
        >
          <HomeReveal>
            <SectionHeading
              title="One API, three layout strategies."
              detail="Choose a component based on how items should be placed and how much content needs to be rendered."
            />
          </HomeReveal>
          <HomeReveal
            className={clsx('mt-10', 'border-y', 'border-fd-border')}
            delay={0.06}
          >
            {strategies.map((strategy, strategyIndex) => (
              <StrategyRow
                key={strategy.id}
                strategy={strategy}
                strategyIndex={strategyIndex}
              />
            ))}
          </HomeReveal>
        </div>
      </section>

      <section className={clsx('border-b', 'border-fd-border bg-fd-muted/15')}>
        <div
          className={clsx('max-w-7xl', 'mx-auto px-4 py-20 sm:px-6 lg:py-24')}
        >
          <HomeReveal>
            <SectionHeading
              title="Virtualize large masonry feeds."
              detail="This example contains 10,000 items. Jump through the dataset while Masonix limits rendering to the visible window and its overscan."
            />
          </HomeReveal>
          <HomeReveal className="mt-10" delay={0.08}>
            <HomePerformanceLab />
          </HomeReveal>
        </div>
      </section>

      <section className={clsx('border-b', 'border-fd-border')}>
        <div
          className={clsx(
            'grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center',
            'mx-auto px-4 py-20 sm:px-6 lg:py-24',
          )}
        >
          <HomeReveal>
            <h2
              className={clsx(
                'max-w-xl',
                'text-3xl font-semibold tracking-[-0.035em] sm:text-4xl',
                'text-fd-foreground',
              )}
            >
              Layout behavior without a design system.
            </h2>
            <p
              className={clsx(
                'max-w-xl',
                'mt-5',
                'text-base leading-7',
                'text-fd-muted-foreground',
              )}
            >
              Masonix handles placement, measurement, and windowing. It does not
              prescribe card markup, styling, imagery, or interaction.
            </p>
            <Link
              href="/docs/examples/basic-layout"
              className={clsx(
                'group inline-flex items-center gap-2',
                'mt-7',
                'text-sm font-medium',
                'text-fd-foreground',
                'transition-colors',
                'hover:text-blue-600 dark:hover:text-blue-400',
              )}
            >
              View the examples
              <ArrowRightIcon />
            </Link>
          </HomeReveal>
          <HomeReveal className="min-w-0" delay={0.08}>
            <ServerCodeBlock
              code={quickExample}
              lang="tsx"
              codeblock={{
                title: 'Gallery.tsx',
                className: 'my-0',
                viewportProps: {
                  className: 'max-h-none',
                },
              }}
            />
          </HomeReveal>
        </div>
      </section>

      <section className={clsx('border-b', 'border-fd-border')}>
        <div
          className={clsx('max-w-7xl', 'mx-auto px-4 py-20 sm:px-6 lg:py-24')}
        >
          <HomeReveal>
            <SectionHeading
              title="Guides for production use."
              detail="Read about server rendering, responsive behavior, accessibility, and performance before choosing implementation defaults."
            />
          </HomeReveal>
          <HomeReveal
            className={clsx(
              'grid md:grid-cols-2',
              'mt-10',
              'border-t',
              'border-fd-border',
            )}
            delay={0.06}
          >
            {guideLinks.map((guide, guideIndex) => (
              <GuideLink
                key={guide.href}
                guide={guide}
                showLeftDivider={guideIndex % 2 === 1}
              />
            ))}
          </HomeReveal>
        </div>
      </section>

      <section>
        <HomeReveal
          className={clsx(
            'flex max-w-3xl flex-col items-center',
            'mx-auto px-4 py-20 sm:px-6 lg:py-24',
            'text-center',
          )}
        >
          <h2
            className={clsx(
              'text-4xl font-semibold tracking-[-0.045em] sm:text-5xl',
              'text-fd-foreground',
            )}
          >
            Build your first masonry grid.
          </h2>
          <p
            className={clsx(
              'max-w-xl',
              'mt-5',
              'text-base leading-7',
              'text-fd-muted-foreground',
            )}
          >
            Install Masonix and start with the CSS-first component. Measurement
            and virtualization are available when the workload requires them.
          </p>
          <div
            className={clsx(
              'flex flex-wrap items-center justify-center gap-3',
              'mt-7',
            )}
          >
            <Link
              href="/docs/guide/getting-started"
              className={clsx(
                'inline-flex items-center gap-2',
                'px-4 py-2.5',
                'rounded-md',
                'text-sm font-medium',
                'bg-fd-primary text-fd-primary-foreground',
                'transition-opacity',
                'hover:opacity-90',
              )}
            >
              Read getting started
              <span aria-hidden="true">→</span>
            </Link>
            <HomeInstallCommand compact />
          </div>
        </HomeReveal>
      </section>

      <footer className={clsx('border-t', 'border-fd-border bg-fd-muted/15')}>
        <div
          className={clsx(
            'flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between',
            'mx-auto px-4 py-8 sm:px-6',
          )}
        >
          <Logo size={22} />
          <div
            className={clsx(
              'flex flex-wrap items-center gap-x-5 gap-y-2',
              'text-xs',
              'text-fd-muted-foreground',
            )}
          >
            <Link
              href="/docs/guide/getting-started"
              className="hover:text-fd-foreground"
            >
              Documentation
            </Link>
            <Link
              href="/docs/examples/basic-layout"
              className="hover:text-fd-foreground"
            >
              Examples
            </Link>
            <Link href="/playground" className="hover:text-fd-foreground">
              Playground
            </Link>
            <a
              href="https://github.com/niteshseram/masonix"
              className="hover:text-fd-foreground"
            >
              GitHub
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
      <h2
        className={clsx(
          'max-w-2xl',
          'text-3xl font-semibold tracking-[-0.035em] sm:text-4xl',
          'text-fd-foreground',
        )}
      >
        {title}
      </h2>
      <p
        className={clsx(
          'max-w-xl lg:justify-self-end',
          'text-base leading-7',
          'text-fd-muted-foreground',
        )}
      >
        {detail}
      </p>
    </div>
  );
}

function StrategyRow({
  strategy,
  strategyIndex,
}: {
  strategy: Strategy;
  strategyIndex: number;
}) {
  return (
    <Link
      href={strategy.href}
      aria-label={`Read ${strategy.name} documentation`}
      className={clsx(
        'group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 md:grid-cols-[3rem_minmax(0,0.8fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-6',
        'py-6',
        strategyIndex > 0 && 'border-t',
        'border-fd-border',
        'transition-colors',
        'hover:bg-fd-muted/20',
      )}
    >
      <span className={clsx('font-mono text-xs', 'text-fd-muted-foreground')}>
        {String(strategyIndex + 1).padStart(2, '0')}
      </span>
      <div>
        <h3 className={clsx('text-base font-semibold', 'text-fd-foreground')}>
          {strategy.name}
        </h3>
        <span
          className={clsx(
            'mt-1 block',
            'font-mono text-[11px]',
            'text-fd-muted-foreground',
          )}
        >
          {strategy.label}
        </span>
      </div>
      <p
        className={clsx(
          'col-span-2 col-start-2 md:col-auto',
          'text-sm leading-6',
          'text-fd-muted-foreground',
        )}
      >
        {strategy.detail}
      </p>
      <span
        className={clsx(
          'col-start-3 row-start-1 justify-self-end md:col-auto md:row-auto',
          'text-fd-muted-foreground',
          'transition-colors',
          'group-hover:text-fd-foreground',
        )}
      >
        <ArrowRightIcon />
      </span>
    </Link>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={clsx(
        'size-4 shrink-0',
        'transition-transform duration-200',
        'group-hover:translate-x-0.5',
      )}
    >
      <path
        d="M3.5 8h8.25m-3-3.25L12 8l-3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GuideLink({
  guide,
  showLeftDivider,
}: {
  guide: (typeof guideLinks)[number];
  showLeftDivider: boolean;
}) {
  return (
    <Link
      href={guide.href}
      className={clsx(
        'group flex items-start justify-between gap-6',
        'py-6 md:px-6',
        'border-b',
        'border-fd-border',
        'transition-colors',
        'hover:bg-fd-muted/25',
        showLeftDivider && 'md:border-l',
      )}
    >
      <div>
        <h3 className={clsx('text-base font-medium', 'text-fd-foreground')}>
          {guide.title}
        </h3>
        <p
          className={clsx(
            'mt-2',
            'text-sm leading-6',
            'text-fd-muted-foreground',
          )}
        >
          {guide.detail}
        </p>
      </div>
      <ArrowRightIcon />
    </Link>
  );
}
