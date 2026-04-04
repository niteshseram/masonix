import { clsx } from "clsx";
import type { MasonryRenderProps } from "masonix";
import type { Photo } from "../demo-data";

const TEXT_BODIES = [
  "A quick note.",
  "Revised the color palette to better align with brand guidelines. Changes applied across primary views.",
  "Discussed Q3 goals. Key actions: finalize roadmap by Friday, schedule user research, review metrics.",
  "Fixed.",
  "What if we added a dark mode toggle? Users have been requesting it and it would improve accessibility across the board.",
  "Completed the first pass. Still need to write tests and update docs before merging.",
  "Add nested grid support.",
  "Performance is noticeably better after the optimization pass. Load times down ~40ms on average across devices.",
  "The button padding is inconsistent on mobile. Font size could also be larger for readability on smaller screens.",
];

export function ColorBlock({ data, index, width }: MasonryRenderProps<Photo>) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl"
      style={{ background: data.color, height: data.height }}
    >
      {/* Light sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-black/[0.18]" />

      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25" />

      {/* Index — bottom left */}
      <span
        className={clsx(
          "absolute bottom-2.5 left-3",
          "font-mono text-[11px] font-semibold tabular-nums",
          "text-white/80 transition-colors group-hover:text-white",
        )}
      >
        {index + 1}
      </span>

      {/* Dimension badge — on hover */}
      <div
        className={clsx(
          "absolute right-2.5 top-2.5",
          "flex items-center gap-1 rounded-md px-1.5 py-0.5",
          "font-mono text-[10px] text-white/90",
          "bg-black/40 backdrop-blur-sm",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        )}
      >
        {data.height}
        <span className="text-white/60">×</span>
        {width}
      </div>
    </div>
  );
}

export function TextCard({ data, index }: MasonryRenderProps<Photo>) {
  return (
    <div
      className={clsx(
        "group overflow-hidden rounded-2xl",
        "border border-zinc-800 bg-zinc-900",
        "transition-colors duration-150 hover:border-zinc-700",
      )}
    >
      {/* Color header */}
      <div
        className="relative flex items-center gap-2 px-3 py-2.5"
        style={{ background: data.color }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />
        <span className="relative flex-1 truncate text-[11px] font-semibold text-white/90">
          {data.alt}
        </span>
        <span className="relative shrink-0 font-mono text-[10px] text-white/50">#{index + 1}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p
          className={clsx(
            "text-[12px] leading-relaxed",
            "text-zinc-400 transition-colors group-hover:text-zinc-300",
          )}
        >
          {TEXT_BODIES[index % TEXT_BODIES.length]}
        </p>
      </div>
    </div>
  );
}
