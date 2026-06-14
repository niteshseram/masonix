import { clsx } from 'clsx';
import type { MasonryRenderProps } from 'masonix';

import type { Photo } from '@/lib/playground/playground-demo-data';

const TEXT_BODIES = [
  'A quick note.',
  'Revised the color palette to better align with brand guidelines. Changes applied across primary views.',
  'Discussed Q3 goals. Key actions: finalize roadmap by Friday, schedule user research, review metrics.',
  'Fixed.',
  'What if we added a dark mode toggle? Users have been requesting it and it would improve accessibility across the board.',
  'Completed the first pass. Still need to write tests and update docs before merging.',
  'Add nested grid support.',
  'Performance is noticeably better after the optimization pass. Load times down ~40ms on average across devices.',
  'The button padding is inconsistent on mobile. Font size could also be larger for readability on smaller screens.',
];

export function ColorBlock({ data, index, width }: MasonryRenderProps<Photo>) {
  return (
    <div
      className={clsx('group relative overflow-hidden', 'rounded-2xl')}
      style={{ background: data.color, height: data.height }}
    >
      <div
        className={clsx(
          'pointer-events-none absolute inset-0',
          'bg-gradient-to-br from-white/10 via-transparent to-black/20',
        )}
      />

      <div
        className={clsx(
          'pointer-events-none absolute inset-x-0 top-0 h-px',
          'bg-white/25',
        )}
      />

      <span
        className={clsx(
          'absolute bottom-2.5 left-3',
          'font-mono text-xs font-semibold tabular-nums',
          'text-white/80',
          'transition-colors',
          'group-hover:text-white',
        )}
      >
        {index + 1}
      </span>

      <div
        className={clsx(
          'absolute top-2.5 right-2.5 flex items-center gap-1',
          'px-1.5 py-0.5',
          'rounded-md backdrop-blur-sm opacity-0',
          'font-mono text-xs',
          'bg-black/40 text-white/90',
          'transition-opacity duration-200',
          'group-hover:opacity-100',
        )}
      >
        {data.height}
        <span className="text-white/60">×</span>
        {width}
      </div>
    </div>
  );
}

export function TextCard({ data, index }: MasonryRenderProps<Photo>) {
  return (
    <div
      className={clsx(
        'group overflow-hidden',
        'rounded-2xl border',
        'border-zinc-800 bg-zinc-900',
        'transition-colors duration-150',
        'hover:border-zinc-700',
      )}
    >
      <div
        className={clsx('relative flex items-center gap-2', 'px-3 py-2.5')}
        style={{ background: data.color }}
      >
        <div
          className={clsx(
            'pointer-events-none absolute inset-0',
            'bg-gradient-to-r from-black/15 to-transparent',
          )}
        />
        <span
          className={clsx(
            'relative flex-1 truncate',
            'text-xs font-semibold',
            'text-white/90',
          )}
        >
          {data.alt}
        </span>
        <span
          className={clsx(
            'relative shrink-0',
            'font-mono text-xs',
            'text-white/50',
          )}
        >
          #{index + 1}
        </span>
      </div>

      <div className="px-3 py-3">
        <p
          className={clsx(
            'text-xs leading-relaxed',
            'text-zinc-400',
            'transition-colors',
            'group-hover:text-zinc-300',
          )}
        >
          {TEXT_BODIES[index % TEXT_BODIES.length]}
        </p>
      </div>
    </div>
  );
}
