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
        'p-3 sm:p-4',
        'rounded-lg border',
        'border-fd-border bg-fd-muted/25',
        className,
      )}
    >
      {children}
    </div>
  );
}
