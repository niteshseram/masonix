"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { useScroller, type MasonryVirtualHandle, type MasonryVirtualRange } from "masonix/virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Logo } from "@/components/brand/brand-logo";
import { DEFAULT_CONFIG } from "@/components/playground/config-panel/playground-config-panel";
import type { Config } from "@/components/playground/config-panel/playground-config-panel";
import { MasonryPreview } from "@/components/playground/playground-masonry-preview";
import { ScrollToIndexBar } from "@/components/playground/playground-scroll-to-index-bar";
import { Sidebar } from "@/components/playground/playground-sidebar";
import { ScrollArea } from "@/components/playground/ui/playground-scroll-area";
import { makePhotos } from "@/lib/playground/playground-demo-data";
import { TABS, PRESETS } from "@/lib/playground/playground-config";

interface VirtualDiagnostics extends MasonryVirtualRange {
  endReachedCount: number;
}

const EMPTY_VIRTUAL_DIAGNOSTICS: VirtualDiagnostics = {
  startIndex: 0,
  stopIndex: 0,
  itemCount: 0,
  totalItems: 0,
  endReachedCount: 0,
};

const metricValueClassName = clsx(
  "font-semibold",
  "text-zinc-100",
);

const toolbarButtonClassName = clsx(
  "flex items-center gap-1.5",
  "px-2.5 py-1",
  "rounded border",
  "text-xs",
  "border-zinc-800 text-zinc-400",
  "transition-colors",
  "hover:border-zinc-600 hover:text-zinc-200",
);

const shortcutKeyClassName = clsx(
  "hidden sm:inline-block",
  "px-1 py-0.5",
  "rounded",
  "font-mono text-xs",
  "bg-zinc-800 text-zinc-500",
);

const statusKeyClassName = clsx(
  "px-1",
  "rounded",
  "font-mono text-xs",
  "bg-zinc-900",
);

const statusSeparatorClassName = "text-zinc-600";

function getRenderedCount(diagnostics: VirtualDiagnostics): number {
  if (diagnostics.itemCount === 0) {
    return 0;
  }
  if (diagnostics.stopIndex < diagnostics.startIndex) {
    return 0;
  }
  return diagnostics.stopIndex - diagnostics.startIndex + 1;
}

function VirtualDiagnosticsBar({
  diagnostics,
  scrollVelocity,
}: {
  diagnostics: VirtualDiagnostics;
  scrollVelocity: number;
}) {
  const renderedCount = getRenderedCount(diagnostics);
  const rangeLabel =
    renderedCount === 0 ? "none" : `${diagnostics.startIndex + 1}-${diagnostics.stopIndex + 1}`;

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-x-4 gap-y-1",
        "mb-5 px-3 py-2",
        "rounded-lg border",
        "font-mono text-xs",
        "border-zinc-800 bg-zinc-950/80 text-zinc-400",
      )}
    >
      <span>
        rendered <strong className={metricValueClassName}>{renderedCount}</strong>
      </span>
      <span>
        range <strong className={metricValueClassName}>{rangeLabel}</strong>
      </span>
      <span>
        total <strong className={metricValueClassName}>{diagnostics.itemCount}</strong>
      </span>
      <span>
        velocity{" "}
        <strong className={metricValueClassName}>
          {Math.round(Math.abs(scrollVelocity))}
        </strong>{" "}
        px/s
      </span>
      <span>
        end <strong className={metricValueClassName}>{diagnostics.endReachedCount}</strong>
      </span>
    </div>
  );
}

function PresetsDropdown({ onApply }: { onApply: (config: Partial<Config>) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        className={toolbarButtonClassName}
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
            "absolute top-full right-0 z-20 w-52",
            "mt-1.5 p-1",
            "rounded-xl border shadow-2xl",
            "border-zinc-800 bg-zinc-900 shadow-black/60",
          )}
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                onApply(preset.config);
                setOpen(false);
              }}
              className={clsx(
                "flex w-full flex-col",
                "px-3 py-2.5",
                "rounded-lg",
                "text-left",
                "transition-colors",
                "hover:bg-zinc-800",
              )}
            >
              <span className={clsx("text-xs font-medium", "text-zinc-200")}>
                {preset.name}
              </span>
              <span className={clsx("mt-0.5", "text-xs", "text-zinc-500")}>
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [virtualDiagnostics, setVirtualDiagnostics] =
    useState<VirtualDiagnostics>(EMPTY_VIRTUAL_DIAGNOSTICS);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollHandleRef = useRef<MasonryVirtualHandle>(null);
  const { scrollVelocity } = useScroller(scrollContainerRef);

  const items = useMemo(
    () => makePhotos(config.itemCount, shuffleKey, config),
    [config, shuffleKey],
  );
  const activeTab = TABS.find((tab) => tab.value === config.component)!;

  const handleVirtualRangeChange = useCallback((range: MasonryVirtualRange) => {
    setVirtualDiagnostics((prevDiagnostics) => ({
      ...prevDiagnostics,
      ...range,
    }));
  }, []);

  const handleVirtualEndReached = useCallback((range: MasonryVirtualRange) => {
    setVirtualDiagnostics((prevDiagnostics) => ({
      ...prevDiagnostics,
      ...range,
      endReachedCount: prevDiagnostics.endReachedCount + 1,
    }));
  }, []);

  function applyPreset(preset: Partial<Config>) {
    setConfig({ ...DEFAULT_CONFIG, ...preset });
    setShuffleKey(0);
  }

  useEffect(() => {
    setVirtualDiagnostics({
      ...EMPTY_VIRTUAL_DIAGNOSTICS,
      itemCount: items.length,
      totalItems: items.length,
    });
  }, [config.component, items.length, shuffleKey]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
        return;
      }
      if (event.key === "s" || event.key === "S") {
        setShuffleKey((prevKey) => prevKey + 1);
      }
      if (event.key === "r" || event.key === "R") {
        setConfig(DEFAULT_CONFIG);
        setShuffleKey(0);
      }
      if (event.key === "1") {
        setConfig((prevConfig) => ({ ...prevConfig, component: "masonry" }));
      }
      if (event.key === "2") {
        setConfig((prevConfig) => ({ ...prevConfig, component: "masonry-balanced" }));
      }
      if (event.key === "3") {
        setConfig((prevConfig) => ({ ...prevConfig, component: "masonry-virtual" }));
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const gapInfo = config.gapMode === "fixed" ? `gap ${config.fixedGap}px` : "responsive gap";

  return (
    <div className={clsx("flex h-full flex-col", "text-sm")}>
      <header className={clsx("shrink-0", "border-b", "border-zinc-800 bg-zinc-950")}>
        <div className={clsx("flex h-11 items-center gap-3", "px-4")}>
          <Link href="/" aria-label="Go to masonix home">
            <Logo size={24} />
          </Link>

          <div className={clsx("hidden md:flex", "p-0.5", "rounded-lg", "bg-zinc-950")}>
            {TABS.map((tab, tabIndex) => (
              <button
                key={tab.value}
                type="button"
                title={tab.desc}
                onClick={() =>
                  setConfig((prevConfig) => ({
                    ...prevConfig,
                    component: tab.value,
                  }))
                }
                className={clsx(
                  "px-3 py-1.5",
                  "rounded-md",
                  config.component === tab.value ? "shadow-sm" : null,
                  "text-xs font-medium",
                  config.component === tab.value ? "bg-zinc-700 text-zinc-100" : "text-zinc-400",
                  "transition-colors",
                  config.component === tab.value ? null : "hover:text-zinc-200",
                )}
              >
                <span className={clsx("mr-1.5", "opacity-50", "font-mono text-xs")}>
                  {tabIndex + 1}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          <span className={clsx("hidden truncate lg:block", "text-xs", "text-zinc-500")}>
            {activeTab.desc}
          </span>

          <div className={clsx("flex items-center gap-2", "ml-auto")}>
            <PresetsDropdown onApply={applyPreset} />
            <button
              type="button"
              onClick={() => setShuffleKey((prevKey) => prevKey + 1)}
              className={toolbarButtonClassName}
            >
              Shuffle
              <kbd className={shortcutKeyClassName}>
                S
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => {
                setConfig(DEFAULT_CONFIG);
                setShuffleKey(0);
              }}
              className={toolbarButtonClassName}
            >
              Reset
              <kbd className={shortcutKeyClassName}>
                R
              </kbd>
            </button>
          </div>
        </div>

        <div className={clsx("flex md:hidden", "px-3 py-2", "border-t", "border-zinc-800")}>
          <div className={clsx("flex w-full", "p-0.5", "rounded-lg", "bg-zinc-950")}>
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                title={tab.desc}
                onClick={() =>
                  setConfig((prevConfig) => ({
                    ...prevConfig,
                    component: tab.value,
                  }))
                }
                className={clsx(
                  "flex-1",
                  "px-2 py-1.5",
                  "rounded-md",
                  config.component === tab.value ? "shadow-sm" : null,
                  "text-xs font-medium",
                  config.component === tab.value ? "bg-zinc-700 text-zinc-100" : "text-zinc-400",
                  "transition-colors",
                  config.component === tab.value ? null : "hover:text-zinc-200",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <Sidebar config={config} setConfig={setConfig} />

        <ScrollArea
          className="min-w-0 flex-1"
          viewportRef={scrollContainerRef}
          viewportClassName="h-full overflow-x-hidden"
        >
          <div
            className={clsx("min-h-full", "p-6")}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            {config.component === "masonry-virtual" && (
              <>
                <ScrollToIndexBar itemCount={items.length} scrollHandleRef={scrollHandleRef} />
                <VirtualDiagnosticsBar
                  diagnostics={virtualDiagnostics}
                  scrollVelocity={scrollVelocity}
                />
              </>
            )}
            <MasonryPreview
              items={items}
              config={config}
              scrollContainerRef={scrollContainerRef}
              scrollHandleRef={config.component === "masonry-virtual" ? scrollHandleRef : undefined}
              onVirtualRangeChange={handleVirtualRangeChange}
              onVirtualEndReached={handleVirtualEndReached}
            />
          </div>
        </ScrollArea>
      </div>

      <footer
        className={clsx(
          "flex h-6 shrink-0 items-center gap-3",
          "px-4",
          "border-t",
          "border-zinc-800 bg-zinc-950",
        )}
      >
        <div className={clsx("flex items-center gap-3", "text-xs", "text-zinc-300")}>
          <span className="tabular-nums">{items.length} items</span>
          <span className={statusSeparatorClassName}>·</span>
          <span>{activeTab.label}</span>
          <span className={statusSeparatorClassName}>·</span>
          <span>{gapInfo}</span>
        </div>
        <div
          className={clsx(
            "hidden items-center gap-3 lg:flex",
            "ml-auto",
            "text-xs",
            "text-zinc-500",
          )}
        >
          <span>
            <kbd className={statusKeyClassName}>1</kbd>
            <kbd
              className={clsx(
                "mx-0.5 px-1",
                "rounded",
                "font-mono text-xs",
                "bg-zinc-900",
              )}
            >
              2
            </kbd>
            <kbd className={statusKeyClassName}>3</kbd> component
          </span>
          <span className={statusSeparatorClassName}>·</span>
          <span>
            <kbd className={statusKeyClassName}>S</kbd> shuffle
          </span>
          <span className={statusSeparatorClassName}>·</span>
          <span>
            <kbd className={statusKeyClassName}>R</kbd> reset
          </span>
        </div>
      </footer>
    </div>
  );
}
