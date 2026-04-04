import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { ScrollArea } from "@base-ui-components/react/scroll-area";
import { DEFAULT_CONFIG } from "./components/config-panel";
import type { Config, ComponentMode } from "./components/config-panel";
import { makePhotos } from "./demo-data";
import { Sidebar } from "./components/sidebar";
import { MasonryPreview } from "./components/masonry-preview";
import type { MasonryVirtualHandle } from "masonix/virtual";
import { ScrollToIndexBar } from "./components/scroll-to-index-bar";

// ─── Config ───────────────────────────────────────────────────────────────────

const TABS: { value: ComponentMode; label: string; desc: string }[] = [
  { value: "masonry", label: "Masonry", desc: "CSS flexbox · round-robin columns" },
  { value: "masonry-balanced", label: "Balanced", desc: "JS-measured · shortest-column-first" },
  { value: "masonry-virtual", label: "Virtual", desc: "Virtualized · interval tree · O(log n)" },
];

const PRESETS: { name: string; description: string; config: Partial<Config> }[] = [
  {
    name: "Pinterest",
    description: "2 cols · tall random heights",
    config: {
      component: "masonry",
      columnMode: "fixed",
      fixedColumns: 2,
      gapMode: "fixed",
      fixedGap: 6,
      heightMode: "random",
      minItemH: 200,
      maxItemH: 600,
      itemCount: 20,
      cardStyle: "color-block",
    },
  },
  {
    name: "Photo grid",
    description: "Auto columns · uniform height",
    config: {
      component: "masonry",
      columnMode: "columnWidth",
      autoColumnWidth: 180,
      gapMode: "fixed",
      fixedGap: 4,
      heightMode: "uniform",
      uniformHeight: 220,
      itemCount: 40,
      cardStyle: "color-block",
    },
  },
  {
    name: "Text notes",
    description: "Balanced layout · text cards",
    config: {
      component: "masonry-balanced",
      columnMode: "fixed",
      fixedColumns: 3,
      gapMode: "fixed",
      fixedGap: 16,
      heightMode: "stepped",
      itemCount: 24,
      cardStyle: "text-card",
    },
  },
  {
    name: "10k items",
    description: "Virtual · 10,000 items",
    config: {
      component: "masonry-virtual",
      columnMode: "custom",
      customColBps: [
        { minWidth: 0, value: 2 },
        { minWidth: 768, value: 3 },
        { minWidth: 1200, value: 4 },
      ],
      gapMode: "fixed",
      fixedGap: 10,
      heightMode: "random",
      minItemH: 100,
      maxItemH: 400,
      itemCount: 10000,
      cardStyle: "color-block",
    },
  },
];

// ─── Presets dropdown ─────────────────────────────────────────────────────────

function PresetsDropdown({ onApply }: { onApply: (config: Partial<Config>) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        className={clsx(
          "flex items-center gap-1.5 rounded border border-zinc-800 px-2.5 py-1",
          "text-xs text-zinc-400",
          "transition-colors hover:border-zinc-600 hover:text-zinc-200",
        )}
      >
        Presets
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
          <path
            d="M1.5 3L4.5 6L7.5 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 top-full z-20 mt-1.5 w-52",
            "rounded-xl border border-zinc-800 bg-zinc-900",
            "p-1 shadow-2xl shadow-black/60",
          )}
        >
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                onApply(p.config);
                setOpen(false);
              }}
              className={clsx(
                "flex w-full flex-col rounded-lg px-3 py-2.5 text-left",
                "transition-colors hover:bg-zinc-800",
              )}
            >
              <span className="text-xs font-medium text-zinc-200">{p.name}</span>
              <span className="mt-0.5 text-[10px] text-zinc-500">{p.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [shuffleKey, setShuffleKey] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollHandleRef = useRef<MasonryVirtualHandle>(null);

  const items = makePhotos(config.itemCount, shuffleKey, config);
  const activeTab = TABS.find((t) => t.value === config.component)!;

  function applyPreset(preset: Partial<Config>) {
    setConfig({ ...DEFAULT_CONFIG, ...preset });
    setShuffleKey(0);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "s" || e.key === "S") setShuffleKey((prevKey) => prevKey + 1);
      if (e.key === "r" || e.key === "R") {
        setConfig(DEFAULT_CONFIG);
        setShuffleKey(0);
      }
      if (e.key === "1") setConfig((c) => ({ ...c, component: "masonry" }));
      if (e.key === "2") setConfig((c) => ({ ...c, component: "masonry-balanced" }));
      if (e.key === "3") setConfig((c) => ({ ...c, component: "masonry-virtual" }));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const gapInfo = config.gapMode === "fixed" ? `gap ${config.fixedGap}px` : "responsive gap";

  return (
    <div className="flex h-full flex-col text-sm">
      {/* ── Top bar ── */}
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-800 bg-[#111111] px-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="none"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <rect x="1" y="2" width="8" height="15" rx="2" fill="#2563eb" />
            <rect x="1" y="19" width="8" height="9" rx="2" fill="#60a5fa" />
            <rect x="12" y="2" width="8" height="8" rx="2" fill="#93c5fd" />
            <rect x="12" y="12" width="8" height="16" rx="2" fill="#3b82f6" />
            <rect x="23" y="2" width="8" height="11" rx="2" fill="#60a5fa" />
            <rect x="23" y="15" width="8" height="13" rx="2" fill="#bfdbfe" />
          </svg>
          <span className="font-mono text-sm font-bold text-zinc-100">masonix</span>
        </div>

        {/* Component tabs */}
        <div className="flex rounded-lg bg-zinc-950 p-0.5">
          {TABS.map((tab, tabIndex) => (
            <button
              key={tab.value}
              type="button"
              title={tab.desc}
              onClick={() => setConfig((prevConfig) => ({ ...prevConfig, component: tab.value }))}
              className={clsx(
                "rounded-md px-3 py-1.5",
                "text-xs font-medium",
                "transition-colors",
                config.component === tab.value
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              <span className="mr-1.5 font-mono text-[9px] opacity-50">{tabIndex + 1}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active component description */}
        <span className="hidden truncate text-[11px] text-zinc-500 lg:block">{activeTab.desc}</span>

        <div className="ml-auto flex items-center gap-2">
          <PresetsDropdown onApply={applyPreset} />
          <button
            type="button"
            onClick={() => setShuffleKey((prevKey) => prevKey + 1)}
            className={clsx(
              "flex items-center gap-1.5 rounded border border-zinc-800 px-2.5 py-1",
              "text-xs text-zinc-400",
              "transition-colors hover:border-zinc-600 hover:text-zinc-200",
            )}
          >
            Shuffle
            <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[9px] text-zinc-500">
              S
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => {
              setConfig(DEFAULT_CONFIG);
              setShuffleKey(0);
            }}
            className={clsx(
              "flex items-center gap-1.5 rounded border border-zinc-800 px-2.5 py-1",
              "text-xs text-zinc-400",
              "transition-colors hover:border-zinc-600 hover:text-zinc-200",
            )}
          >
            Reset
            <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[9px] text-zinc-500">
              R
            </kbd>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1">
        <Sidebar config={config} setConfig={setConfig} />

        {/* Preview — dot grid scrolls with content */}
        <ScrollArea.Root className="min-w-0 flex-1">
          <ScrollArea.Viewport
            ref={scrollContainerRef}
            className="h-full"
            style={{ overflowX: "hidden" }}
          >
            <div
              className="min-h-full p-6"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              {config.component === "masonry-virtual" && (
                <ScrollToIndexBar maxIndex={items.length - 1} scrollHandleRef={scrollHandleRef} />
              )}
              <MasonryPreview
                items={items}
                config={config}
                scrollContainerRef={scrollContainerRef}
                scrollHandleRef={
                  config.component === "masonry-virtual" ? scrollHandleRef : undefined
                }
              />
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="vertical"
            className="flex w-1.5 touch-none select-none p-px transition-opacity duration-150 data-[hovering]:opacity-100"
          >
            <ScrollArea.Thumb className="flex-1 rounded-full bg-zinc-600 hover:bg-zinc-500" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>

      {/* ── Status bar ── */}
      <footer className="flex h-6 shrink-0 items-center gap-3 border-t border-zinc-800 bg-[#111111] px-4">
        <div className="flex items-center gap-3 text-[10px] text-zinc-300">
          <span className="tabular-nums">{items.length} items</span>
          <span className="text-zinc-600">·</span>
          <span>{activeTab.label}</span>
          <span className="text-zinc-600">·</span>
          <span>{gapInfo}</span>
        </div>
        <div className="ml-auto hidden items-center gap-3 text-[10px] text-zinc-500 lg:flex">
          <span>
            <kbd className="rounded bg-zinc-900 px-1 font-mono text-[9px]">1</kbd>
            <kbd className="mx-0.5 rounded bg-zinc-900 px-1 font-mono text-[9px]">2</kbd>
            <kbd className="rounded bg-zinc-900 px-1 font-mono text-[9px]">3</kbd> component
          </span>
          <span className="text-zinc-600">·</span>
          <span>
            <kbd className="rounded bg-zinc-900 px-1 font-mono text-[9px]">S</kbd> shuffle
          </span>
          <span className="text-zinc-600">·</span>
          <span>
            <kbd className="rounded bg-zinc-900 px-1 font-mono text-[9px]">R</kbd> reset
          </span>
        </div>
      </footer>
    </div>
  );
}
