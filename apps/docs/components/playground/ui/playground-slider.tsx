import { clsx } from 'clsx';

export function Slider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className={clsx(
          'flex-1',
          'accent-blue-500',
          'cursor-pointer',
        )}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span
        className={clsx(
          'w-12 shrink-0',
          'text-right font-mono text-xs tabular-nums',
          'text-zinc-300',
        )}
      >
        {value}
      </span>
    </div>
  );
}
