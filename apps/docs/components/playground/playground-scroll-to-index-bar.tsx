import { clsx } from 'clsx';
import type { MasonryVirtualHandle } from 'masonix/virtual';
import { useEffect, useState } from 'react';

interface ScrollToIndexBarProps {
  itemCount: number;
  scrollHandleRef: React.RefObject<MasonryVirtualHandle | null>;
}

const ALIGN_OPTIONS = ['start', 'center', 'end'] as const;

const inputCls = clsx(
  'px-1.5 py-1',
  'rounded border',
  'text-xs',
  'border-zinc-800 bg-zinc-900 text-zinc-100',
  'outline-none',
  'focus:ring-1 focus:ring-blue-500/60',
);

export function ScrollToIndexBar({
  itemCount,
  scrollHandleRef,
}: ScrollToIndexBarProps) {
  const [itemNumber, setItemNumber] = useState(() =>
    Math.max(1, Math.ceil(itemCount / 2)),
  );
  const [align, setAlign] = useState<'start' | 'center' | 'end'>('start');
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    setItemNumber((prev) => Math.min(prev, Math.max(1, itemCount)));
  }, [itemCount]);

  function go() {
    scrollHandleRef.current?.scrollToIndex(itemNumber - 1, { align, smooth });
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-2',
        'mb-5 px-3 py-2',
        'rounded-lg',
        'bg-zinc-900/50',
      )}
    >
      <span
        className={clsx('shrink-0', 'text-xs font-medium', 'text-zinc-400')}
      >
        Jump to item
      </span>

      <input
        type="number"
        aria-label="Item number"
        className={clsx('masonix-number-input', inputCls, 'w-14')}
        value={itemNumber}
        min={1}
        max={itemCount}
        onChange={(event) => {
          const parsedItemNumber = parseInt(event.target.value, 10);
          if (!isNaN(parsedItemNumber)) {
            setItemNumber(Math.min(itemCount, Math.max(1, parsedItemNumber)));
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            go();
          }
        }}
      />

      <div className={clsx('flex', 'p-0.5', 'rounded', 'bg-zinc-950')}>
        {ALIGN_OPTIONS.map((alignOption) => (
          <button
            key={alignOption}
            type="button"
            onClick={() => setAlign(alignOption)}
            className={clsx(
              'px-2 py-1',
              'rounded',
              'text-xs font-medium',
              align === alignOption
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400',
              'transition-colors',
              align === alignOption ? null : 'hover:text-zinc-200',
            )}
          >
            {alignOption}
          </button>
        ))}
      </div>

      <label
        className={clsx(
          'flex items-center gap-1.5',
          'text-xs',
          'text-zinc-400',
          'cursor-pointer',
        )}
      >
        <input
          type="checkbox"
          aria-label="Smooth scroll"
          className="accent-blue-500"
          checked={smooth}
          onChange={(event) => setSmooth(event.target.checked)}
        />
        smooth
      </label>

      <button
        type="button"
        onClick={go}
        className={clsx(
          'ml-auto px-3 py-1',
          'rounded',
          'text-xs font-medium',
          'bg-blue-600 text-white',
          'transition-colors',
          'hover:bg-blue-500 active:bg-blue-700',
        )}
      >
        Go
      </button>
    </div>
  );
}
