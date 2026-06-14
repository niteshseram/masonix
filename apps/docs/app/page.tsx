import { clsx } from 'clsx';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Logo } from '@/components/brand/brand-logo';

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

const solverRails = ['47%', '64%', '83%'] as const;

const solverCards = [
  {
    id: 1,
    color: '#22d3ee',
    left: '47%',
    top: '9%',
    width: '15rem',
    height: 132,
    fromX: '18rem',
    fromY: '-6rem',
    delay: '0ms',
  },
  {
    id: 2,
    color: '#a78bfa',
    left: '64%',
    top: '8%',
    width: '17.25rem',
    height: 236,
    fromX: '20rem',
    fromY: '-4rem',
    delay: '180ms',
  },
  {
    id: 3,
    color: '#fbbf24',
    left: '47%',
    top: '30%',
    width: '15rem',
    height: 188,
    fromX: '16rem',
    fromY: '-2rem',
    delay: '360ms',
  },
  {
    id: 4,
    color: '#4ade80',
    left: '83%',
    top: '13%',
    width: '12rem',
    height: 154,
    fromX: '12rem',
    fromY: '-4rem',
    delay: '540ms',
  },
  {
    id: 5,
    color: '#f472b6',
    left: '64%',
    top: '48%',
    width: '17.25rem',
    height: 150,
    fromX: '15rem',
    fromY: '4rem',
    delay: '720ms',
  },
  {
    id: 6,
    color: '#60a5fa',
    left: '83%',
    top: '37%',
    width: '12rem',
    height: 226,
    fromX: '11rem',
    fromY: '3rem',
    delay: '900ms',
  },
  {
    id: 7,
    color: '#f87171',
    left: '47%',
    top: '60%',
    width: '15rem',
    height: 170,
    fromX: '14rem',
    fromY: '7rem',
    delay: '1080ms',
  },
  {
    id: 8,
    color: '#34d399',
    left: '64%',
    top: '71%',
    width: '17.25rem',
    height: 116,
    fromX: '13rem',
    fromY: '7rem',
    delay: '1260ms',
  },
] as const;

const mobileSolverCards = [
  ['#22d3ee', 120],
  ['#a78bfa', 172],
  ['#fbbf24', 138],
  ['#4ade80', 112],
  ['#f472b6', 152],
  ['#60a5fa', 124],
] as const;

const proofPoints = [
  ['3', 'layout modes'],
  ['10k', 'item playground preset'],
  ['5.37 kB', 'virtual bundle'],
] as const;

function HeroScene() {
  return (
    <div aria-hidden={true} className="absolute inset-0 overflow-hidden">
      <div className="masonix-hero-grid absolute inset-0" />
      <div className={clsx('absolute inset-0', 'bg-fd-background/65')} />
      <div className="masonix-solver-stage absolute inset-y-0 hidden md:block">
        <div className="masonix-solver-board absolute inset-y-10 right-20">
          {solverRails.map((left) => (
            <div
              key={left}
              className="masonix-solver-rail absolute inset-y-6 w-px"
              style={{ left }}
            />
          ))}
          <div className="masonix-solver-scan absolute inset-y-8 w-px" />
          {solverCards.map((card) => (
            <div
              key={card.id}
              className={clsx(
                'masonix-solver-card absolute overflow-hidden',
                'rounded-lg border',
                'border-white/15',
              )}
              style={
                {
                  left: card.left,
                  top: card.top,
                  width: card.width,
                  height: card.height,
                  background: card.color,
                  animationDelay: card.delay,
                  '--solver-from-x': card.fromX,
                  '--solver-from-y': card.fromY,
                } as CSSProperties
              }
            >
              <div
                className={clsx(
                  'absolute inset-0',
                  'bg-gradient-to-br from-white/20 via-transparent to-black/30',
                )}
              />
              <div className="masonix-solver-measure absolute inset-y-4 w-px" />
              <span
                className={clsx(
                  'absolute bottom-3 left-3',
                  'font-mono text-xs font-semibold',
                  'text-white/70',
                )}
              >
                {card.id}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className={clsx(
          'masonix-solver-mobile-cluster absolute top-24 -right-8 grid w-60 grid-cols-2 gap-3 md:hidden',
          'opacity-45',
        )}
      >
        {mobileSolverCards.map(([color, height], index) => (
          <div
            key={`${color}-${height}`}
            className={clsx(
              'rounded-lg border shadow-xl',
              'border-white/15 shadow-fd-foreground/10',
            )}
            style={
              {
                background: color,
                height,
                marginTop: index % 2 === 0 ? 0 : 28,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div
        className={clsx(
          'absolute inset-0',
          'bg-gradient-to-r from-fd-background via-fd-background/90 to-fd-background/25',
        )}
      />
      <div
        className={clsx(
          'absolute inset-x-0 bottom-0 h-32',
          'bg-gradient-to-t from-fd-background to-transparent',
        )}
      />
    </div>
  );
}

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
        <HeroScene />
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
