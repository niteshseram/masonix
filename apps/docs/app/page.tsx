import { clsx } from 'clsx';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import Link from 'next/link';

import { Logo } from '@/components/brand/brand-logo';
import { HomeHeroScene } from '@/components/home/home-hero-scene';

const componentModes = [
  {
    name: 'Masonry',
    href: '/docs/components/masonry',
    detail:
      'Responsive CSS layout for product grids, image walls, and simple feeds.',
  },
  {
    name: 'MasonryBalanced',
    href: '/docs/components/masonry-balanced',
    detail:
      'Measured shortest-column placement for cards with unpredictable height.',
  },
  {
    name: 'MasonryVirtual',
    href: '/docs/components/masonry-virtual',
    detail:
      'Windowed rendering, scroll seek, and end-reached events for long feeds.',
  },
];

const quickExample = `import { Masonry } from 'masonix';

export function Gallery({ photos }) {
  return (
    <Masonry
      items={photos}
      columns={{ 0: 1, 720: 2, 1080: 3 }}
      gap={16}
      itemKey={(photo) => photo.id}
      render={({ data }) => <img src={data.src} alt={data.alt} />}
    />
  );
}`;

const proofPoints = [
  ['3', 'layout modes'],
  ['10k', 'item playground preset'],
  ['5.37 kB', 'virtual bundle'],
] as const;

export default async function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden">
      <header
        className={clsx(
          'sticky top-0 z-20',
          'border-b backdrop-blur',
          'border-fd-border bg-fd-background/85',
        )}
      >
        <nav
          className={clsx(
            'flex h-14 max-w-7xl items-center gap-4',
            'mx-auto px-4',
          )}
        >
          <Link
            href="/"
            className={clsx('flex items-center gap-2', 'font-semibold')}
          >
            <Logo size={26} />
          </Link>
          <div
            className={clsx(
              'flex items-center gap-4',
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
              className={clsx('transition-colors', 'hover:text-fd-foreground')}
            >
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section
        className={clsx('relative isolate', 'border-b', 'border-fd-border')}
      >
        <HomeHeroScene />
        <div
          className={clsx(
            'masonix-hero-content relative z-10 flex max-w-7xl items-center',
            'mx-auto px-4 py-16',
          )}
        >
          <div className="max-w-3xl">
            <p
              className={clsx(
                'mb-4',
                'font-mono text-xs font-medium uppercase',
                'text-fd-muted-foreground',
              )}
            >
              React masonry components
            </p>
            <h1
              className={clsx(
                'text-4xl font-semibold tracking-normal sm:text-6xl',
                'text-fd-foreground',
              )}
            >
              Layouts that feel simple until your feed gets serious.
            </h1>
            <p
              className={clsx(
                'max-w-2xl',
                'mt-6',
                'text-base leading-7 sm:text-lg',
                'text-fd-muted-foreground',
              )}
            >
              Masonix gives you responsive masonry, measured balanced columns,
              and virtualized feeds behind one small React API.
            </p>
            <div className={clsx('flex flex-wrap items-center gap-3', 'mt-8')}>
              <Link
                href="/docs/guide/getting-started"
                className={clsx(
                  'px-4 py-2',
                  'rounded-md',
                  'text-sm font-medium',
                  'bg-fd-primary text-fd-primary-foreground',
                  'transition-opacity',
                  'hover:opacity-90',
                )}
              >
                Start building
              </Link>
              <Link
                href="/playground"
                className={clsx(
                  'px-4 py-2',
                  'rounded-md border backdrop-blur',
                  'text-sm font-medium',
                  'border-fd-border bg-fd-background/60 text-fd-foreground',
                  'transition-colors',
                  'hover:bg-fd-accent/50',
                )}
              >
                Open playground
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={clsx('border-b', 'border-fd-border bg-fd-muted/15')}>
        <div
          className={clsx(
            'grid max-w-7xl gap-8 md:grid-cols-3',
            'mx-auto px-4 py-8',
          )}
        >
          {proofPoints.map(([value, label]) => (
            <div key={label}>
              <div
                className={clsx(
                  'font-mono text-2xl font-semibold',
                  'text-fd-foreground',
                )}
              >
                {value}
              </div>
              <div
                className={clsx('mt-1', 'text-sm', 'text-fd-muted-foreground')}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className={clsx(
          'grid max-w-7xl gap-10 lg:grid-cols-2',
          'mx-auto px-4 py-14 lg:py-20',
        )}
      >
        <div>
          <p
            className={clsx(
              'font-mono text-xs font-medium uppercase',
              'text-fd-muted-foreground',
            )}
          >
            Choose by workload
          </p>
          <h2
            className={clsx(
              'mt-3',
              'text-3xl font-semibold tracking-normal',
              'text-fd-foreground',
            )}
          >
            One library, three layout strategies.
          </h2>
          <p
            className={clsx(
              'mt-4',
              'text-base leading-7',
              'text-fd-muted-foreground',
            )}
          >
            Start with the simple component, move to measured placement when
            visual balance matters, and switch to virtualization when rendering
            everything starts costing scroll performance.
          </p>
        </div>

        <div className="grid gap-3">
          {componentModes.map((mode) => (
            <Link
              key={mode.name}
              href={mode.href}
              className={clsx(
                'p-5',
                'rounded-lg border',
                'border-fd-border bg-fd-background',
                'group',
                'transition-colors',
                'hover:bg-fd-accent/40',
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className={clsx('font-semibold', 'text-fd-foreground')}>
                  {mode.name}
                </h3>
                <span
                  className={clsx(
                    'font-mono text-xs',
                    'text-fd-muted-foreground',
                    'transition-transform',
                    'group-hover:translate-x-1',
                  )}
                >
                  Read docs
                </span>
              </div>
              <p
                className={clsx(
                  'max-w-2xl',
                  'mt-2',
                  'text-sm leading-6',
                  'text-fd-muted-foreground',
                )}
              >
                {mode.detail}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className={clsx('border-t', 'border-fd-border bg-fd-muted/15')}>
        <div
          className={clsx(
            'grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-start',
            'mx-auto px-4 py-14',
          )}
        >
          <div>
            <p
              className={clsx(
                'font-mono text-xs font-medium uppercase',
                'text-fd-muted-foreground',
              )}
            >
              First working example
            </p>
            <h2
              className={clsx('mt-3', 'text-3xl font-semibold tracking-normal')}
            >
              Bring your own cards. Masonix handles the placement.
            </h2>
            <p
              className={clsx(
                'mt-4',
                'text-base leading-7',
                'text-fd-muted-foreground',
              )}
            >
              The docs include live examples, accessibility guidance, virtual
              feed recipes, and a full playground for tuning layout behavior.
            </p>
            <div className={clsx('flex flex-wrap gap-3', 'mt-7')}>
              <Link
                href="/docs/guide/getting-started"
                className={clsx(
                  'px-4 py-2',
                  'rounded-md border',
                  'text-sm font-medium',
                  'border-fd-border',
                  'transition-colors',
                  'hover:bg-fd-accent/50',
                )}
              >
                Read getting started
              </Link>
              <Link
                href="/docs/components/masonry-virtual"
                className={clsx(
                  'px-4 py-2',
                  'rounded-md border',
                  'text-sm font-medium',
                  'border-fd-border',
                  'transition-colors',
                  'hover:bg-fd-accent/50',
                )}
              >
                Explore virtual feeds
              </Link>
            </div>
          </div>

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
        </div>
      </section>
    </main>
  );
}
