import { clsx } from 'clsx';
import type React from 'react';
import { useState, useEffect } from 'react';

export const inputCls = clsx(
  'bg-zinc-900 border border-zinc-800 rounded',
  'text-xs text-zinc-100',
  'px-1.5 py-1',
  'outline-none focus:ring-1 focus:ring-blue-500/60',
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
  onChange: (v: number) => void;
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
        inputCls,
        'w-16',
        '[appearance:textfield]',
        '[&::-webkit-inner-spin-button]:appearance-none',
        '[&::-webkit-outer-spin-button]:appearance-none',
      )}
      style={style}
      value={draft}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(event) => commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter')
          commit((event.target as HTMLInputElement).value);
      }}
    />
  );
}
