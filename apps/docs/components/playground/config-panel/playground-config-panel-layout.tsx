import { clsx } from 'clsx';
import type React from 'react';
import { useState } from 'react';

function SectionHeader({
  title,
  chevron,
}: {
  title: string;
  chevron?: boolean;
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between',
        'mb-3 pb-1.5',
        'border-b',
        'border-zinc-800/70',
      )}
    >
      <span
        className={clsx(
          'text-xs font-bold uppercase tracking-widest',
          'text-zinc-500',
        )}
      >
        {title}
      </span>
      {chevron !== undefined && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={clsx(
            'text-zinc-500',
            'transition-transform duration-150',
            chevron && 'rotate-180',
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

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <SectionHeader title={title} />
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        className="w-full"
      >
        <SectionHeader title={title} chevron={open} />
      </button>
      {open && <div className="flex flex-col gap-2.5">{children}</div>}
    </div>
  );
}

export function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-24 shrink-0', 'text-xs', 'text-zinc-400')}>
        {label}
      </span>
      <div className="flex flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={clsx('text-xs', 'text-zinc-400')}>{label}</span>
      {children}
    </div>
  );
}
