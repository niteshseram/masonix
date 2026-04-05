import { clsx } from 'clsx';
import { useState, useCallback, useEffect } from 'react';

import { ConfigPanel } from './config-panel';
import type { Config } from './config-panel';

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

interface SidebarProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

export function Sidebar({ config, setConfig }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 768);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    function handler(event: MediaQueryListEvent) {
      setIsMobile(event.matches);
      if (event.matches) setIsOpen(false);
    }
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;
      setIsResizing(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(e: MouseEvent) {
        setWidth(
          Math.min(
            MAX_WIDTH,
            Math.max(MIN_WIDTH, startWidth + e.clientX - startX),
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

  return (
    <>
      {/* Floating open button — shown when collapsed on both mobile and desktop */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Open config"
          className={clsx(
            'absolute left-2 top-1.5 z-[1]',
            'size-7',
            'flex items-center justify-center rounded-lg',
            'border border-zinc-700 bg-zinc-900 text-zinc-400 shadow-md',
            'transition-colors hover:border-zinc-600 hover:text-zinc-200',
          )}
        >
          <IconChevronRight />
        </button>
      )}

      {/* Backdrop — mobile only, when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="absolute inset-0 z-[1] bg-black/60"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel — only rendered when open */}
      {isOpen && (
        <div
          className={clsx(
            'relative flex shrink-0 flex-col',
            'border-r border-zinc-800 bg-[#111111]',
            isMobile ? 'absolute inset-y-0 left-0 z-[1]' : 'h-full',
            !isResizing &&
              !isMobile &&
              'transition-[width] duration-150 ease-out',
          )}
          style={{
            width: isMobile ? Math.min(300, window.innerWidth - 40) : width,
          }}
        >
          {/* Toggle button */}
          <div className="flex h-10 shrink-0 items-center border-b border-zinc-800 px-2">
            <button
              type="button"
              onClick={() => setIsOpen((prevOpen) => !prevOpen)}
              title={isOpen ? 'Collapse' : 'Expand config'}
              className={clsx(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded',
                'text-zinc-400 transition-colors',
                'hover:bg-zinc-800 hover:text-zinc-200',
              )}
            >
              {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
            </button>
          </div>

          {/* Config content */}
          <div
            className={clsx(
              'min-h-0 flex-1 transition-opacity duration-100',
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {isOpen && <ConfigPanel config={config} setConfig={setConfig} />}
          </div>

          {/* Resize handle — desktop only */}
          {isOpen && !isMobile && (
            <div
              onMouseDown={handleResizeStart}
              className={clsx(
                'absolute right-0 top-0 h-full w-1 cursor-col-resize',
                'transition-colors hover:bg-blue-500/30 active:bg-blue-500/50',
              )}
            />
          )}
        </div>
      )}
    </>
  );
}
