import { clsx } from 'clsx';

export function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (nextValue: T) => void;
}) {
  return (
    <div className={clsx('flex w-full', 'p-0.5', 'rounded-md', 'bg-zinc-950')}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            'flex-1',
            'px-2 py-1.5',
            'rounded',
            value === option.value ? 'shadow-sm' : null,
            'text-xs font-medium',
            value === option.value
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-400',
            'transition-colors',
            value === option.value ? null : 'hover:text-zinc-200',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
