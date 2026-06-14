import { clsx } from 'clsx';

export function Toggle({
  ariaLabel,
  value,
  disabled,
  onChange,
}: {
  ariaLabel: string;
  value: boolean;
  disabled?: boolean;
  onChange: (nextValue: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={value}
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }
        onChange(!value);
      }}
      className={clsx(
        'relative h-5 w-8',
        'rounded-full',
        value && !disabled ? 'bg-blue-500' : 'bg-zinc-700',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        'transition-colors duration-150',
        disabled ? 'opacity-40' : null,
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 left-0.5 h-4 w-4',
          'rounded-full shadow',
          'bg-white',
          'transition-transform duration-150',
          value ? 'translate-x-3' : 'translate-x-0',
        )}
      />
    </button>
  );
}
