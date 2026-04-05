import { clsx } from 'clsx';

import { NumInput } from '../ui/num-input';
import type { BpEntry } from './types';

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
      entries.map((entry, idx) =>
        idx === entryIndex ? { ...entry, [field]: newValue } : entry,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[1fr_1fr_20px] gap-x-1.5">
        <span className="text-center text-[10px] text-zinc-500">min-width</span>
        <span className="text-center text-[10px] text-zinc-500">
          {valueLabel}
        </span>
      </div>

      {entries.map((entry, entryIndex) => (
        <div
          key={entryIndex}
          className="grid grid-cols-[1fr_1fr_20px] items-center gap-x-1.5"
        >
          <NumInput
            value={entry.minWidth}
            min={0}
            max={9999}
            style={{ width: '100%' }}
            onChange={(newValue) => update(entryIndex, 'minWidth', newValue)}
          />
          <NumInput
            value={entry.value}
            min={valueMin}
            max={valueMax}
            style={{ width: '100%' }}
            onChange={(newValue) => update(entryIndex, 'value', newValue)}
          />
          <button
            type="button"
            onClick={() =>
              onChange(entries.filter((_, idx) => idx !== entryIndex))
            }
            title="Remove"
            className={clsx(
              'flex h-5 w-5 items-center justify-center rounded',
              'text-zinc-500 transition-colors',
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
          'w-full rounded border border-dashed border-zinc-700 py-1',
          'text-[11px] text-zinc-500',
          'transition-colors hover:border-zinc-500 hover:text-zinc-300',
        )}
      >
        + add breakpoint
      </button>
    </div>
  );
}
