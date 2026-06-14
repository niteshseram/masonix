import { clsx } from 'clsx';
import type React from 'react';
import { useState, useEffect } from 'react';

export const inputCls = clsx(
  'px-1.5 py-1',
  'rounded border',
  'text-xs',
  'border-zinc-800 bg-zinc-900 text-zinc-100',
  'outline-none',
  'focus:ring-1 focus:ring-blue-500/60',
);

export function NumInput({
  value,
  min = 0,
  max = 9999,
  style,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  style?: React.CSSProperties;
  onChange: (nextValue: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit(raw: string) {
    const parsedValue = parseInt(raw, 10);
    const clamped = isNaN(parsedValue)
      ? value
      : Math.min(max, Math.max(min, parsedValue));
    onChange(clamped);
    setDraft(String(clamped));
  }

  return (
    <input
      type="number"
      className={clsx(
        'masonix-number-input',
        inputCls,
        'w-16',
      )}
      style={style}
      value={draft}
      min={min}
      max={max}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          commit((event.target as HTMLInputElement).value);
        }
      }}
    />
  );
}
