import { useState, useCallback } from "react";
import { Masonry, MasonryBalanced } from "masonix";
import type { MasonryRenderProps } from "masonix";
import { ConfigPanel, DEFAULT_CONFIG } from "./config-panel";
import type { BpEntry, Config } from "./config-panel";

// ─── Demo data ────────────────────────────────────────────────────────────────

interface Photo {
  id: number;
  alt: string;
  height: number;
  color: string;
}

const COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#4ade80",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#94a3b8",
];

function makePhotos(count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    alt: `Photo ${i + 1}`,
    height: 120 + (i % 7) * 40,
    color: COLORS[i % COLORS.length],
  }));
}

function PhotoCard({ data }: MasonryRenderProps<Photo>) {
  return (
    <div
      className="flex items-center justify-center rounded-lg font-semibold text-white text-[13px]"
      style={{ background: data.color, height: data.height }}
    >
      {data.alt}
    </div>
  );
}

// ─── Prop derivation ──────────────────────────────────────────────────────────

function bpsToRecord(bps: BpEntry[]): Record<number, number> {
  const out: Record<number, number> = {};
  for (const { minWidth, value } of bps) out[minWidth] = value;
  return out;
}

function deriveProps(config: Config) {
  let columns: number | Record<number, number> | undefined;
  let columnWidth: number | undefined;

  if (config.columnMode === "fixed") {
    columns = config.fixedColumns;
  } else if (config.columnMode === "custom") {
    columns = bpsToRecord(config.customColBps);
  } else {
    columnWidth = config.autoColumnWidth;
  }

  const maxColumns = config.useMaxColumns ? config.maxColumns : undefined;
  const gap: number | Record<number, number> =
    config.gapMode === "fixed" ? config.fixedGap : bpsToRecord(config.customGapBps);

  return { columns, columnWidth, maxColumns, gap };
}

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

// ─── App ──────────────────────────────────────────────────────────────────────

const SIDEBAR_MIN = 220;
const SIDEBAR_MAX = 520;
const SIDEBAR_DEFAULT = 288;

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [isOpen, setIsOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = sidebarWidth;
      setIsResizing(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      function onMove(e: MouseEvent) {
        setSidebarWidth(
          Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth + e.clientX - startX)),
        );
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
    [sidebarWidth],
  );

  const items = config.showEmpty ? [] : makePhotos(config.itemCount);
  const { columns, columnWidth, maxColumns, gap } = deriveProps(config);

  return (
    <div className="flex h-full overflow-hidden bg-[#0d0d0d] text-sm">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div
        className={`relative flex h-full shrink-0 flex-col border-r border-zinc-800 bg-[#111111] ${
          isResizing ? "" : "transition-[width] duration-200 ease-in-out"
        }`}
        style={{ width: isOpen ? sidebarWidth : 44 }}
      >
        {/* Fixed header — outside the scroll area */}
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
              <span className="ml-2 flex-1 truncate text-sm font-semibold text-zinc-100">
                Config
              </span>
              <button
                type="button"
                onClick={() => setConfig(DEFAULT_CONFIG)}
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
          <ConfigPanel config={config} setConfig={setConfig} />
        </div>

        {/* Settings icon when collapsed */}
        {!isOpen && (
          <div className="mt-2 flex justify-center text-zinc-700">
            <IconSettings />
          </div>
        )}

        {/* Resize handle — only when open */}
        {isOpen && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-blue-500/40"
          />
        )}
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 overflow-auto p-6">
        <h1 className="mb-1 text-xl font-bold text-white">masonix playground</h1>
        <p className="mb-6 text-xs text-zinc-600">
          {config.component === "masonry" ? (
            <>
              <span className="text-zinc-400">{"<Masonry>"}</span> — CSS flexbox masonry,
              round-robin column distribution
            </>
          ) : (
            <>
              <span className="text-zinc-400">{"<MasonryBalanced>"}</span> — JS-measured masonry,
              shortest-column-first placement
            </>
          )}
        </p>

        {config.component === "masonry" ? (
          <Masonry
            items={items}
            render={PhotoCard}
            columns={columns}
            columnWidth={columnWidth}
            maxColumns={maxColumns}
            gap={gap}
            dir={config.dir}
            role={config.role as "list" | "grid" | "none"}
            enableNative={config.enableNative}
            as={config.as}
            itemAs={config.itemAs}
            aria-label={config.ariaLabel || undefined}
            itemKey={(p) => (p as Photo).id}
            empty={
              <p className="w-full py-20 text-center text-sm text-zinc-600">No items to display.</p>
            }
          />
        ) : (
          <MasonryBalanced
            items={items}
            render={PhotoCard}
            columns={columns}
            columnWidth={columnWidth}
            maxColumns={maxColumns}
            gap={gap}
            dir={config.dir}
            role={config.role as "list" | "grid" | "none"}
            as={config.as}
            itemAs={config.itemAs}
            aria-label={config.ariaLabel || undefined}
            itemKey={(p) => (p as Photo).id}
            getItemHeight={config.useKnownHeights ? (p) => (p as Photo).height : undefined}
            estimatedItemHeight={config.estimatedItemHeight}
            empty={
              <p className="w-full py-20 text-center text-sm text-zinc-600">No items to display.</p>
            }
          />
        )}
      </div>
    </div>
  );
}
