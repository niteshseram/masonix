import { useState, useCallback } from "react";
import { clsx } from "clsx";
import { ConfigPanel } from "./config-panel";
import type { Config } from "./config-panel";

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden={true}>
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
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden={true}>
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
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;
      setIsResizing(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      function onMove(e: MouseEvent) {
        setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + e.clientX - startX)));
      }

      function onUp() {
        setIsResizing(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [width],
  );

  return (
    <div
      className={clsx(
        "relative flex h-full shrink-0 flex-col",
        "border-r border-zinc-800 bg-[#111111]",
        !isResizing && "transition-[width] duration-150 ease-out",
      )}
      style={{ width: isOpen ? width : 40 }}
    >
      {/* Toggle button */}
      <div className="flex h-10 shrink-0 items-center border-b border-zinc-800 px-2">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          title={isOpen ? "Collapse" : "Expand config"}
          className={clsx(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded",
            "text-zinc-400 transition-colors",
            "hover:bg-zinc-800 hover:text-zinc-200",
          )}
        >
          {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
        </button>
      </div>

      {/* Config content */}
      <div
        className={clsx(
          "min-h-0 flex-1 transition-opacity duration-100",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {isOpen && <ConfigPanel config={config} setConfig={setConfig} />}
      </div>

      {/* Resize handle */}
      {isOpen && (
        <div
          onMouseDown={handleResizeStart}
          className={clsx(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize",
            "transition-colors hover:bg-blue-500/30 active:bg-blue-500/50",
          )}
        />
      )}
    </div>
  );
}
