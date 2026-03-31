import { useState, useCallback } from "react";
import { ConfigPanel } from "./config-panel";
import type { Config } from "./config-panel";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 288;

interface SidebarProps {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  onReset: () => void;
  onShuffle: () => void;
}

export function Sidebar({ config, setConfig, onReset, onShuffle }: SidebarProps) {
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
      className={`relative flex h-full shrink-0 flex-col border-r border-zinc-800 bg-[#111111] ${
        isResizing ? "" : "transition-[width] duration-200 ease-in-out"
      }`}
      style={{ width: isOpen ? width : 44 }}
    >
      {/* Fixed header */}
      <div className="flex h-11 shrink-0 items-center border-b border-zinc-800 px-2">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
        </button>

        {isOpen && (
          <>
            <span className="ml-2 flex-1 truncate text-sm font-semibold text-zinc-100">Config</span>
            <button
              type="button"
              onClick={onReset}
              className="shrink-0 rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-300"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Scrollable config content */}
      <div
        className={`min-h-0 flex-1 transition-opacity duration-150 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ConfigPanel config={config} setConfig={setConfig} onShuffle={onShuffle} />
      </div>

      {/* Settings icon when collapsed */}
      {!isOpen && (
        <div className="mt-2 flex justify-center text-zinc-700">
          <IconSettings />
        </div>
      )}

      {/* Resize handle */}
      {isOpen && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-blue-500/40"
        />
      )}
    </div>
  );
}
