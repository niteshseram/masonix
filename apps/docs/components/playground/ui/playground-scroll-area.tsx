import { ScrollArea as BaseScrollArea } from '@base-ui-components/react/scroll-area';
import { clsx } from 'clsx';
import type { ReactNode, Ref } from 'react';

interface ScrollAreaProps {
  className?: string;
  viewportRef?: Ref<HTMLDivElement>;
  viewportClassName?: string;
  scrollbarClassName?: string;
  thumbClassName?: string;
  autoHide?: boolean;
  children: ReactNode;
}

export function ScrollArea({
  className,
  viewportRef,
  viewportClassName = 'h-full',
  scrollbarClassName = clsx(
    'flex w-1.5',
    'p-px',
    'touch-none select-none',
    'transition-opacity duration-150',
    'data-[hovering]:opacity-100',
  ),
  thumbClassName = clsx(
    'bg-zinc-700',
    'transition-colors',
    'hover:bg-zinc-500',
  ),
  autoHide = false,
  children,
}: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root className={clsx(className, autoHide && 'group')}>
      <BaseScrollArea.Viewport ref={viewportRef} className={viewportClassName}>
        {children}
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar
        orientation="vertical"
        className={clsx(
          scrollbarClassName,
          autoHide && 'opacity-0 group-hover:opacity-100',
        )}
      >
        <BaseScrollArea.Thumb
          className={clsx('flex-1', 'rounded-full', thumbClassName)}
        />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
