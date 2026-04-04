import { clsx } from "clsx";

/** Segmented control — always full-width; use inside Field, never inside Row. */
export function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex w-full rounded-md bg-zinc-950 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "flex-1 rounded px-2 py-1.5",
            "text-xs font-medium",
            "transition-colors",
            value === option.value
              ? "bg-zinc-700 text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
