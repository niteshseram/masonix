import { useEffect, useState } from "react";
import { clsx } from "clsx";
import type { MasonryVirtualHandle } from "masonix/virtual";

interface ScrollToIndexBarProps {
  maxIndex: number;
  scrollHandleRef: React.RefObject<MasonryVirtualHandle | null>;
}

const ALIGN_OPTIONS = ["start", "center", "end"] as const;

const inputCls = clsx(
  "bg-zinc-900 border border-zinc-800 rounded",
  "text-xs text-zinc-100",
  "px-1.5 py-1",
  "outline-none focus:ring-1 focus:ring-blue-500/60",
);

export function ScrollToIndexBar({ maxIndex, scrollHandleRef }: ScrollToIndexBarProps) {
  const [index, setIndex] = useState(() => Math.floor(maxIndex / 2));
  const [align, setAlign] = useState<"start" | "center" | "end">("start");
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, Math.max(0, maxIndex)));
  }, [maxIndex]);

  function go() {
    scrollHandleRef.current?.scrollToIndex(index, { align, smooth });
  }

  return (
    <div className={clsx("mb-5 flex items-center gap-2", "rounded-lg bg-zinc-900/50 px-3 py-2")}>
      <span className="shrink-0 text-[11px] font-medium text-zinc-400">Jump to</span>

      <input
        type="number"
        className={clsx(
          inputCls,
          "w-14",
          "[appearance:textfield]",
          "[&::-webkit-inner-spin-button]:appearance-none",
          "[&::-webkit-outer-spin-button]:appearance-none",
        )}
        value={index}
        min={0}
        max={maxIndex}
        onChange={(event) => {
          const parsedIndex = parseInt(event.target.value, 10);
          if (!isNaN(parsedIndex)) setIndex(Math.min(maxIndex, Math.max(0, parsedIndex)));
        }}
        onKeyDown={(event) => event.key === "Enter" && go()}
      />

      <div className="flex rounded bg-zinc-950 p-0.5">
        {ALIGN_OPTIONS.map((alignOption) => (
          <button
            key={alignOption}
            type="button"
            onClick={() => setAlign(alignOption)}
            className={clsx(
              "rounded px-2 py-1",
              "text-xs font-medium",
              "transition-colors",
              align === alignOption
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            {alignOption}
          </button>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-400">
        <input
          type="checkbox"
          className="accent-blue-500"
          checked={smooth}
          onChange={(e) => setSmooth(e.target.checked)}
        />
        smooth
      </label>

      <button
        type="button"
        onClick={go}
        className={clsx(
          "ml-auto rounded bg-blue-600 px-3 py-1",
          "text-xs font-medium text-white",
          "transition-colors hover:bg-blue-500 active:bg-blue-700",
        )}
      >
        Go
      </button>
    </div>
  );
}
