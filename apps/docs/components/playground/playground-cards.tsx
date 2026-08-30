import { clsx } from 'clsx';
import type { MasonryRenderProps } from 'masonix';

import type { PlaygroundItem } from '@/lib/playground/playground-demo-data';

function Artwork({ index }: { index: number }) {
  const variant = index % 4;

  if (variant === 0) {
    return (
      <svg viewBox="0 0 240 160" aria-hidden className="size-full">
        <circle cx="120" cy="80" r="60" fill="currentColor" opacity="0.1" />
        <circle
          cx="120"
          cy="80"
          r="38"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.55"
        />
        <path
          d="M24 80h192M120 16v128"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg viewBox="0 0 240 160" aria-hidden className="size-full">
        <path
          d="M36 132V76h44v56h44V44h44v88h36"
          fill="currentColor"
          opacity="0.12"
        />
        <path
          d="M36 132V76h44v56h44V44h44v88h36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.65"
        />
      </svg>
    );
  }

  if (variant === 2) {
    return (
      <svg viewBox="0 0 240 160" aria-hidden className="size-full">
        <rect
          x="42"
          y="28"
          width="76"
          height="104"
          fill="currentColor"
          opacity="0.12"
        />
        <rect
          x="118"
          y="28"
          width="80"
          height="104"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.6"
        />
        <path
          d="M42 80h156"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.35"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 160" aria-hidden className="size-full">
      <path
        d="M40 128c0-48 36-88 80-88s80 40 80 88"
        fill="none"
        stroke="currentColor"
        strokeWidth="18"
        opacity="0.12"
      />
      <path
        d="M62 128c0-36 26-64 58-64s58 28 58 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.65"
      />
    </svg>
  );
}

export function EditorialCard({
  data,
  index,
  width,
}: MasonryRenderProps<PlaygroundItem>) {
  const isMicro = data.height < 80;
  const showArtwork = data.height >= 180;
  const showSummary = data.height >= 320;
  const showHeader = data.height >= 96;
  const showFooter = data.height >= 128;

  return (
    <article
      className={clsx(
        'group relative flex flex-col overflow-hidden',
        isMicro ? 'p-2' : 'p-4',
        'rounded-xl border shadow-[0_12px_35px_rgba(0,0,0,0.16)]',
        'transition-transform duration-200',
        'hover:-translate-y-0.5',
      )}
      style={{
        backgroundColor: data.surface,
        borderColor: `${data.ink}24`,
        color: data.ink,
        height: data.height,
      }}
    >
      {showHeader && (
        <div
          className={clsx(
            'relative z-10 flex items-center justify-between gap-3',
            'font-mono text-[10px] font-medium tracking-[0.14em] uppercase',
          )}
        >
          <span>{data.category}</span>
          <span className="tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}

      {showArtwork && (
        <div
          className={clsx(
            'absolute inset-x-2 top-[20%] h-[48%]',
            'pointer-events-none',
            'transition-transform duration-300',
            'group-hover:scale-[1.03]',
          )}
        >
          <Artwork index={index} />
        </div>
      )}

      {isMicro ? (
        <span
          className={clsx(
            'm-auto',
            'font-mono text-[10px] font-semibold tabular-nums',
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      ) : (
        <div className={clsx('relative z-10', 'mt-auto')}>
          <p
            className={clsx(
              'max-w-[16rem]',
              data.height < 180 ? 'text-base' : 'text-xl',
              'font-semibold leading-[1.05] tracking-[-0.025em]',
            )}
          >
            {data.title}
          </p>
          {showSummary && (
            <p
              className={clsx(
                'max-w-[18rem]',
                'mt-3',
                'text-xs leading-5 opacity-70',
              )}
            >
              {data.summary}
            </p>
          )}
          {showFooter && (
            <div
              className={clsx(
                'flex items-center justify-between gap-3',
                'mt-3 pt-2.5',
                'border-t',
                'font-mono text-[10px] opacity-65',
              )}
              style={{ borderColor: `${data.ink}28` }}
            >
              <span className="truncate">{data.project}</span>
              <span className={clsx('shrink-0', 'tabular-nums')}>
                {Math.round(width)} × {data.height}
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function ProjectNoteCard({
  data,
  index,
}: MasonryRenderProps<PlaygroundItem>) {
  return (
    <article
      className={clsx(
        'group overflow-hidden',
        'rounded-xl border shadow-[0_10px_30px_rgba(0,0,0,0.2)]',
        'border-zinc-800 bg-zinc-950',
        'transition-colors duration-200',
        'hover:border-zinc-700',
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span
            className={clsx('size-1.5 shrink-0', 'rounded-full')}
            style={{ backgroundColor: data.accent }}
          />
          <span
            className={clsx(
              'truncate',
              'text-[10px] font-medium tracking-[0.12em] uppercase',
              'text-zinc-400',
            )}
          >
            {data.status}
          </span>
          <span
            className={clsx(
              'ml-auto shrink-0',
              'font-mono text-[10px] tabular-nums',
              'text-zinc-600',
            )}
          >
            MX-{String(index + 1).padStart(3, '0')}
          </span>
        </div>

        <h2
          className={clsx(
            'mt-4',
            'text-[15px] font-semibold leading-tight tracking-[-0.015em]',
            'text-zinc-100',
          )}
        >
          {data.title}
        </h2>
        <p className={clsx('mt-2', 'text-xs leading-5', 'text-zinc-400')}>
          {data.summary}
        </p>
        <div className={clsx('flex flex-wrap gap-1.5', 'mt-4')}>
          {data.tags.map((tag) => (
            <span
              key={tag}
              className={clsx(
                'px-1.5 py-1',
                'rounded border',
                'font-mono text-[9px]',
                'border-zinc-800 bg-zinc-900 text-zinc-500',
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        className={clsx(
          'flex items-center gap-2',
          'px-4 py-3',
          'border-t',
          'border-zinc-800 bg-zinc-900/55',
        )}
      >
        <span
          className={clsx(
            'flex size-6 shrink-0 items-center justify-center',
            'rounded-full',
            'text-[9px] font-semibold',
          )}
          style={{ backgroundColor: data.surface, color: data.ink }}
        >
          {data.initials}
        </span>
        <div className="min-w-0">
          <p
            className={clsx(
              'truncate',
              'text-[11px] font-medium',
              'text-zinc-300',
            )}
          >
            {data.owner}
          </p>
          <p className={clsx('truncate', 'text-[10px]', 'text-zinc-600')}>
            {data.project}
          </p>
        </div>
        <span
          className={clsx(
            'ml-auto shrink-0',
            'font-mono text-[10px]',
            'text-zinc-600',
          )}
        >
          {data.updated}
        </span>
      </div>
    </article>
  );
}
