import { clsx } from 'clsx';

export function Toggle({
  value,
  disabled,
  onChange,
}: {
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={clsx(
        'relative h-5 w-8 rounded-full',
        'transition-colors duration-150',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        value && !disabled ? 'bg-blue-500' : 'bg-zinc-700',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow',
          'transition-[left] duration-150',
          value ? 'left-3.5' : 'left-0.5',
        )}
      />
    </button>
  );
}
