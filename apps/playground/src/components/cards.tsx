import type { MasonryRenderProps } from "masonix";
import type { Photo } from "../demo-data";

// Text bodies of intentionally varying length so TextCard heights differ
// naturally — ideal for demonstrating MasonryBalanced's measurement path.
const TEXT_BODIES = [
  "A quick note.",
  "Revised the color palette to better align with brand guidelines. Changes applied across primary views.",
  "Discussed Q3 goals. Key actions: finalize roadmap by Friday, schedule user research, review metrics.",
  "Fixed.",
  "What if we added a dark mode toggle? Users have been requesting it and it would improve accessibility across the board.",
  "Completed the first pass. Still need to write tests and update docs before merging.",
  "Remember to handle empty states — the layout breaks when the items array is empty without a fallback.",
  "Add nested grid support.",
  "Performance is noticeably better after the optimization pass. Load times down ~40ms on average across devices.",
  "The button padding is inconsistent on mobile. Font size could also be larger for readability on smaller screens.",
];

export function ColorBlock({ data }: MasonryRenderProps<Photo>) {
  return (
    <div
      className="flex items-center justify-center rounded-lg text-[13px] font-semibold text-white"
      style={{ background: data.color, height: data.height }}
    >
      <span className="opacity-70">{data.alt}</span>
    </div>
  );
}

export function TextCard({ data, index }: MasonryRenderProps<Photo>) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/60">
      <div
        className="flex h-10 items-center px-3 text-xs font-semibold text-white/80"
        style={{ background: data.color }}
      >
        {data.alt}
      </div>
      <div className="p-3">
        <p className="text-xs leading-relaxed text-zinc-300">
          {TEXT_BODIES[index % TEXT_BODIES.length]}
        </p>
      </div>
    </div>
  );
}
