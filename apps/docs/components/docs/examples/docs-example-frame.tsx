import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface DemoFrameProps {
  children: ReactNode;
  className?: string;
}

export function DemoFrame({ children, className }: DemoFrameProps) {
  return (
    <div
      className={clsx(
        'not-prose min-w-0 max-w-full overflow-hidden',
        'p-4',
        'rounded-xl border shadow-sm',
        'border-fd-border bg-fd-muted/20 shadow-fd-foreground/5',
        className,
      )}
    >
      {children}
    </div>
  );
}
