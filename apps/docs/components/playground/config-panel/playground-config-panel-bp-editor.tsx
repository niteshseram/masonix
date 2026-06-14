import { clsx } from 'clsx';

import type { BpEntry } from '@/components/playground/config-panel/playground-config-panel-types';
import { NumInput } from '@/components/playground/ui/playground-num-input';

export function BpEditor({
  entries,
  valueLabel,
  valueMin,
  valueMax,
  onChange,
}: {
  entries: BpEntry[];
  valueLabel: string;
  valueMin: number;
  valueMax: number;
  onChange: (entries: BpEntry[]) => void;
}) {
  function update(entryIndex: number, field: keyof BpEntry, newValue: number) {
    onChange(
      entries.map((entry, index) =>
        index === entryIndex ? { ...entry, [field]: newValue } : entry,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="masonix-bp-editor-grid grid gap-x-1.5">
        <span className={clsx('text-center text-xs', 'text-zinc-500')}>
          min-width
        </span>
        <span className={clsx('text-center text-xs', 'text-zinc-500')}>
          {valueLabel}
        </span>
      </div>

      {entries.map((entry, entryIndex) => (
        <div
          key={entryIndex}
          className="masonix-bp-editor-grid grid items-center gap-x-1.5"
        >
          <NumInput
            ariaLabel={`Breakpoint ${entryIndex + 1} min-width`}
            value={entry.minWidth}
            min={0}
            max={9999}
            style={{ width: '100%' }}
            onChange={(newValue) => update(entryIndex, 'minWidth', newValue)}
          />
          <NumInput
            ariaLabel={`Breakpoint ${entryIndex + 1} ${valueLabel}`}
            value={entry.value}
            min={valueMin}
            max={valueMax}
            style={{ width: '100%' }}
            onChange={(newValue) => update(entryIndex, 'value', newValue)}
          />
          <button
            type="button"
            aria-label={`Remove breakpoint ${entryIndex + 1}`}
            onClick={() =>
              onChange(entries.filter((_entry, index) => index !== entryIndex))
            }
            title="Remove"
            className={clsx(
              'flex h-5 w-5 items-center justify-center',
              'rounded',
              'text-zinc-500',
              'transition-colors',
              'hover:bg-zinc-800 hover:text-zinc-200',
            )}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path
                d="M1 1l6 6M7 1L1 7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const last = entries[entries.length - 1];
          onChange([
            ...entries,
            {
              minWidth: (last?.minWidth ?? 0) + 300,
              value: last?.value ?? valueMin,
            },
          ]);
        }}
        className={clsx(
          'w-full',
          'py-1',
          'rounded border border-dashed',
          'text-xs',
          'border-zinc-700 text-zinc-500',
          'transition-colors',
          'hover:border-zinc-500 hover:text-zinc-300',
        )}
      >
        + add breakpoint
      </button>
    </div>
  );
}
