import type React from "react";
import { useState } from "react";
import { clsx } from "clsx";

function SectionHeader({ title, chevron }: { title: string; chevron?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-zinc-800/70 pb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{title}</span>
      {chevron !== undefined && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={clsx(
            "text-zinc-500 transition-transform duration-150",
            chevron && "rotate-180",
          )}
        >
          <path
            d="M1.5 3.5L5 7L8.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <SectionHeader title={title} />
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full">
        <SectionHeader title={title} chevron={open} />
      </button>
      {open && <div className="flex flex-col gap-2.5">{children}</div>}
    </div>
  );
}

/**
 * Row — label left, single-value control right.
 * Use for: Toggle, NumInput, Slider, composites.
 * Never put a Seg in Row — use Field instead.
 */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-zinc-400">{label}</span>
      <div className="flex flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

/**
 * Field — label above, full-width control below.
 * Always use for Seg so it fills available width.
 */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
    </div>
  );
}
