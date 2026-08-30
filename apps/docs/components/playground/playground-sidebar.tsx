import { clsx } from 'clsx';
import type { MasonryLayoutMode } from 'masonix';
import { useState, useCallback, useEffect } from 'react';

import {
  ConfigPanel,
  type Config,
} from '@/components/playground/config-panel/playground-config-panel';

function IconChevronLeft() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden={true}
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden={true}
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MIN_WIDTH = 220;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 264;
const RESIZE_STEP = 16;

interface SidebarProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  masonryLayoutMode: MasonryLayoutMode;
}

export function Sidebar({
  config,
  setConfig,
  masonryLayoutMode,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');

    setViewportWidth(window.innerWidth);
    setIsMobile(mq.matches);
    setIsOpen(!mq.matches);

    function handler(event: MediaQueryListEvent) {
      setIsMobile(event.matches);
      setIsOpen(!event.matches);
    }

    function handleResize() {
      setViewportWidth(window.innerWidth);
    }

    mq.addEventListener('change', handler);
    window.addEventListener('resize', handleResize);
    return () => {
      mq.removeEventListener('change', handler);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;
      setIsResizing(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(event: MouseEvent) {
        setWidth(
          Math.min(
            MAX_WIDTH,
            Math.max(MIN_WIDTH, startWidth + event.clientX - startX),
          ),
        );
      }

      function onUp() {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [width],
  );

  function handleResizeKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let nextWidth = width;

    if (event.key === 'ArrowLeft') {
      nextWidth = Math.max(MIN_WIDTH, width - RESIZE_STEP);
    } else if (event.key === 'ArrowRight') {
      nextWidth = Math.min(MAX_WIDTH, width + RESIZE_STEP);
    } else if (event.key === 'Home') {
      nextWidth = MIN_WIDTH;
    } else if (event.key === 'End') {
      nextWidth = MAX_WIDTH;
    } else {
      return;
    }

    event.preventDefault();
    setWidth(nextWidth);
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          aria-label="Open config panel"
          aria-controls="playground-config-panel"
          aria-expanded={false}
          onClick={() => setIsOpen(true)}
          title="Open config"
          className={clsx(
            'absolute top-1.5 left-2 z-10 flex size-7 items-center justify-center',
            'rounded-lg border shadow-md',
            'border-zinc-700 bg-zinc-900 text-zinc-400',
            'transition-colors',
            'hover:border-zinc-600 hover:text-zinc-200',
          )}
        >
          <IconChevronRight />
        </button>
      )}

      {isMobile && isOpen && (
        <button
          type="button"
          aria-label="Close config panel"
          aria-controls="playground-config-panel"
          aria-expanded={true}
          className={clsx(
            'absolute inset-0 z-10',
            'p-0',
            'border-0',
            'bg-black/60',
          )}
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div
          id="playground-config-panel"
          className={clsx(
            'relative flex shrink-0 flex-col',
            'border-r',
            'border-zinc-800 bg-zinc-950',
            isMobile ? 'absolute inset-y-0 left-0 z-10' : 'h-full',
            !isResizing && !isMobile && 'transition-all duration-150 ease-out',
          )}
          style={{
            width: isMobile ? Math.min(300, viewportWidth - 40) : width,
          }}
        >
          <div
            className={clsx(
              'flex h-10 shrink-0 items-center',
              'px-2',
              'border-b',
              'border-zinc-800',
            )}
          >
            <button
              type="button"
              aria-label="Collapse config panel"
              aria-controls="playground-config-panel"
              aria-expanded={true}
              onClick={() => setIsOpen((prevOpen) => !prevOpen)}
              title={isOpen ? 'Collapse' : 'Expand config'}
              className={clsx(
                'flex h-7 w-7 shrink-0 items-center justify-center',
                'rounded',
                'text-zinc-400',
                'transition-colors',
                'hover:bg-zinc-800 hover:text-zinc-200',
              )}
            >
              {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
            </button>
          </div>

          <div
            className={clsx(
              'min-h-0 flex-1',
              'transition-opacity duration-100',
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {isOpen && (
              <ConfigPanel
                config={config}
                setConfig={setConfig}
                masonryLayoutMode={masonryLayoutMode}
              />
            )}
          </div>

          {isOpen && !isMobile && (
            <div
              role="separator"
              tabIndex={0}
              aria-label="Resize config panel"
              aria-controls="playground-config-panel"
              aria-orientation="vertical"
              aria-valuemin={MIN_WIDTH}
              aria-valuemax={MAX_WIDTH}
              aria-valuenow={width}
              aria-valuetext={`${width} pixels`}
              onMouseDown={handleResizeStart}
              onKeyDown={handleResizeKeyDown}
              className={clsx(
                'absolute top-0 right-0 h-full w-1',
                'p-0',
                'border-0',
                'bg-transparent',
                'cursor-col-resize outline-none',
                'transition-colors',
                'hover:bg-blue-500/30 focus-visible:bg-blue-500/40 focus-visible:ring-2 focus-visible:ring-blue-400 active:bg-blue-500/50',
              )}
            />
          )}
        </div>
      )}
    </>
  );
}
