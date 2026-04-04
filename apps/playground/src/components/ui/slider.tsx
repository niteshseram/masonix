/** Full-width slider — always use inside Row. */
export function Slider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className="flex-1 cursor-pointer accent-blue-500"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-7 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-300">
        {value}
      </span>
    </div>
  );
}
