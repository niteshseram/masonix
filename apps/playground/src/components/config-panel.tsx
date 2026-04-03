import type React from "react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { ScrollArea } from "@base-ui-components/react/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ComponentMode = "masonry" | "masonry-balanced" | "masonry-virtual";
export type ColumnMode = "fixed" | "custom" | "columnWidth";
export type GapMode = "fixed" | "custom";
export type HeightMode = "stepped" | "random" | "uniform";
export type CardStyle = "color-block" | "text-card";

export interface BpEntry {
  minWidth: number;
  value: number;
}

export interface Config {
  component: ComponentMode;

  itemCount: number;
  showEmpty: boolean;
  cardStyle: CardStyle;
  heightMode: HeightMode;
  minItemH: number;
  maxItemH: number;
  uniformHeight: number;

  columnMode: ColumnMode;
  fixedColumns: number;
  customColBps: BpEntry[];
  autoColumnWidth: number;
  maxColumns: number;
  useMaxColumns: boolean;

  gapMode: GapMode;
  fixedGap: number;
  customGapBps: BpEntry[];

  role: "list" | "grid" | "none";
  enableNative: boolean;

  as: "div" | "ul" | "section" | "main";
  itemAs: "div" | "li" | "article";
  ariaLabel: string;

  useKnownHeights: boolean;
  estimatedItemHeight: number;
  useMinItemHeight: boolean;
  minItemHeight: number;

  overscanBy: number;
}

export const DEFAULT_CONFIG: Config = {
  component: "masonry",

  itemCount: 20,
  showEmpty: false,
  cardStyle: "color-block",
  heightMode: "stepped",
  minItemH: 80,
  maxItemH: 480,
  uniformHeight: 200,

  columnMode: "custom",
  fixedColumns: 3,
  customColBps: [
    { minWidth: 0, value: 1 },
    { minWidth: 600, value: 2 },
    { minWidth: 900, value: 3 },
    { minWidth: 1200, value: 4 },
  ],
  autoColumnWidth: 200,
  maxColumns: 6,
  useMaxColumns: false,

  gapMode: "custom",
  fixedGap: 16,
  customGapBps: [
    { minWidth: 0, value: 8 },
    { minWidth: 900, value: 16 },
  ],

  role: "list",
  enableNative: false,

  as: "div",
  itemAs: "div",
  ariaLabel: "",

  useKnownHeights: false,
  estimatedItemHeight: 150,
  useMinItemHeight: false,
  minItemHeight: 80,

  overscanBy: 2,
};

// ─── Layout primitives ────────────────────────────────────────────────────────

function SectionHeader({ title, chevron }: { title: string; chevron?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-zinc-800/70 pb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{title}</span>
      {chevron !== undefined && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={clsx(
            "text-zinc-500 transition-transform duration-150",
            chevron && "rotate-180",
          )}
        >
          <path
            d="M1.5 3.5L5 7L8.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <SectionHeader title={title} />
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full">
        <SectionHeader title={title} chevron={open} />
      </button>
      {open && <div className="flex flex-col gap-2.5">{children}</div>}
    </div>
  );
}

/**
 * Row — label left, single-value control right.
 * Use for: Toggle, NumInput, Slider, composites.
 * Never put a Seg in Row — use Field instead.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-zinc-400">{label}</span>
      <div className="flex flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

/**
 * Field — label above, full-width control below.
 * Always use for Seg so it fills available width.
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
    </div>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────

const inputCls = clsx(
  "bg-zinc-900 border border-zinc-800 rounded",
  "text-xs text-zinc-100",
  "px-1.5 py-1",
  "outline-none focus:ring-1 focus:ring-blue-500/60",
);

/** Segmented control — always full-width; use inside Field, never inside Row. */
function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex w-full rounded-md bg-zinc-950 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            "flex-1 rounded px-2 py-1.5",
            "text-xs font-medium",
            "transition-colors",
            value === o.value
              ? "bg-zinc-700 text-zinc-100 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NumInput({
  value,
  min = 0,
  max = 9999,
  style,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  style?: React.CSSProperties;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit(raw: string) {
    const n = parseInt(raw, 10);
    const clamped = isNaN(n) ? value : Math.min(max, Math.max(min, n));
    onChange(clamped);
    setDraft(String(clamped));
  }

  return (
    <input
      type="number"
      className={clsx(
        inputCls,
        "w-16",
        "[appearance:textfield]",
        "[&::-webkit-inner-spin-button]:appearance-none",
        "[&::-webkit-outer-spin-button]:appearance-none",
      )}
      style={style}
      value={draft}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
      }}
    />
  );
}

function Toggle({
  value,
  disabled,
  onChange,
}: {
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={clsx(
        "relative h-5 w-8 rounded-full",
        "transition-colors duration-150",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        value && !disabled ? "bg-blue-500" : "bg-zinc-700",
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow",
          "transition-[left] duration-150",
          value ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

/** Full-width slider — always use inside Row. */
function Slider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className="flex-1 cursor-pointer accent-blue-500"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-7 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-300">
        {value}
      </span>
    </div>
  );
}

// ─── Breakpoint editor ────────────────────────────────────────────────────────

function BpEditor({
  entries,
  valueLabel,
  valueMin,
  valueMax,
  onChange,
}: {
  entries: BpEntry[];
  valueLabel: string;
  valueMin: number;
  valueMax: number;
  onChange: (entries: BpEntry[]) => void;
}) {
  function update(i: number, field: keyof BpEntry, val: number) {
    onChange(entries.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[1fr_1fr_20px] gap-x-1.5">
        <span className="text-center text-[10px] text-zinc-500">min-width</span>
        <span className="text-center text-[10px] text-zinc-500">{valueLabel}</span>
      </div>

      {entries.map((entry, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_20px] items-center gap-x-1.5">
          <NumInput
            value={entry.minWidth}
            min={0}
            max={9999}
            style={{ width: "100%" }}
            onChange={(v) => update(i, "minWidth", v)}
          />
          <NumInput
            value={entry.value}
            min={valueMin}
            max={valueMax}
            style={{ width: "100%" }}
            onChange={(v) => update(i, "value", v)}
          />
          <button
            type="button"
            onClick={() => onChange(entries.filter((_, idx) => idx !== i))}
            title="Remove"
            className={clsx(
              "flex h-5 w-5 items-center justify-center rounded",
              "text-zinc-500 transition-colors",
              "hover:bg-zinc-800 hover:text-zinc-200",
            )}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path
                d="M1 1l6 6M7 1L1 7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const last = entries[entries.length - 1];
          onChange([
            ...entries,
            { minWidth: (last?.minWidth ?? 0) + 300, value: last?.value ?? valueMin },
          ]);
        }}
        className={clsx(
          "w-full rounded border border-dashed border-zinc-700 py-1",
          "text-[11px] text-zinc-500",
          "transition-colors hover:border-zinc-500 hover:text-zinc-300",
        )}
      >
        + add breakpoint
      </button>
    </div>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────────

export function ConfigPanel({
  config,
  setConfig,
}: {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}) {
  function set<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  const isBalancedOrVirtual =
    config.component === "masonry-balanced" || config.component === "masonry-virtual";
  const knownHeightsDisabled = config.cardStyle === "text-card";
  const maxCount = config.component === "masonry-virtual" ? 500 : 100;

  return (
    <ScrollArea.Root className="h-full overflow-hidden">
      <ScrollArea.Viewport className="h-full">
        <div className="px-4 pb-8 pt-4">
          {/* Items */}
          <Section title="Items">
            <Row label="Count">
              <Slider
                value={config.itemCount}
                min={0}
                max={maxCount}
                onChange={(v) => set("itemCount", v)}
              />
            </Row>
            <Field label="Card">
              <Seg
                value={config.cardStyle}
                options={[
                  { label: "Color block", value: "color-block" },
                  { label: "Text card", value: "text-card" },
                ]}
                onChange={(v) => set("cardStyle", v)}
              />
            </Field>
            <Field label="Heights">
              <Seg
                value={config.heightMode}
                options={[
                  { label: "Stepped", value: "stepped" },
                  { label: "Random", value: "random" },
                  { label: "Uniform", value: "uniform" },
                ]}
                onChange={(v) => set("heightMode", v)}
              />
            </Field>
            {config.heightMode === "random" && (
              <Row label="Range">
                <div className="flex items-center gap-1.5">
                  <NumInput
                    value={config.minItemH}
                    min={20}
                    max={config.maxItemH - 20}
                    onChange={(v) => set("minItemH", v)}
                  />
                  <span className="text-xs text-zinc-600">–</span>
                  <NumInput
                    value={config.maxItemH}
                    min={config.minItemH + 20}
                    max={800}
                    onChange={(v) => set("maxItemH", v)}
                  />
                </div>
              </Row>
            )}
            {config.heightMode === "uniform" && (
              <Row label="Height">
                <NumInput
                  value={config.uniformHeight}
                  min={20}
                  max={800}
                  onChange={(v) => set("uniformHeight", v)}
                />
              </Row>
            )}
            <Row label="Empty">
              <Toggle value={config.showEmpty} onChange={(v) => set("showEmpty", v)} />
            </Row>
          </Section>

          {/* Columns */}
          <Section title="Columns">
            <Field label="Mode">
              <Seg
                value={config.columnMode}
                options={[
                  { label: "Fixed", value: "fixed" },
                  { label: "Custom", value: "custom" },
                  { label: "Auto", value: "columnWidth" },
                ]}
                onChange={(v) => set("columnMode", v)}
              />
            </Field>
            {config.columnMode === "fixed" && (
              <Row label="Count">
                <NumInput
                  value={config.fixedColumns}
                  min={1}
                  max={12}
                  onChange={(v) => set("fixedColumns", v)}
                />
              </Row>
            )}
            {config.columnMode === "custom" && (
              <BpEditor
                entries={config.customColBps}
                valueLabel="columns"
                valueMin={1}
                valueMax={12}
                onChange={(bps) => set("customColBps", bps)}
              />
            )}
            {config.columnMode === "columnWidth" && (
              <Row label="Min width">
                <NumInput
                  value={config.autoColumnWidth}
                  min={50}
                  max={800}
                  onChange={(v) => set("autoColumnWidth", v)}
                />
              </Row>
            )}
            <Row label="Max cols">
              <div className="flex items-center gap-2">
                <Toggle value={config.useMaxColumns} onChange={(v) => set("useMaxColumns", v)} />
                {config.useMaxColumns && (
                  <NumInput
                    value={config.maxColumns}
                    min={1}
                    max={12}
                    onChange={(v) => set("maxColumns", v)}
                  />
                )}
              </div>
            </Row>
          </Section>

          {/* Gap */}
          <Section title="Gap">
            <Field label="Mode">
              <Seg
                value={config.gapMode}
                options={[
                  { label: "Fixed", value: "fixed" },
                  { label: "Custom", value: "custom" },
                ]}
                onChange={(v) => set("gapMode", v)}
              />
            </Field>
            {config.gapMode === "fixed" && (
              <Row label="Size">
                <Slider
                  value={config.fixedGap}
                  min={0}
                  max={64}
                  onChange={(v) => set("fixedGap", v)}
                />
              </Row>
            )}
            {config.gapMode === "custom" && (
              <BpEditor
                entries={config.customGapBps}
                valueLabel="gap (px)"
                valueMin={0}
                valueMax={64}
                onChange={(bps) => set("customGapBps", bps)}
              />
            )}
          </Section>

          {/* Measurement — balanced + virtual only */}
          {isBalancedOrVirtual && (
            <Section title="Measurement">
              <Row label="Known">
                <Toggle
                  value={config.useKnownHeights}
                  disabled={knownHeightsDisabled}
                  onChange={(v) => set("useKnownHeights", v)}
                />
              </Row>
              {!config.useKnownHeights && !knownHeightsDisabled && (
                <Row label="Est. height">
                  <NumInput
                    value={config.estimatedItemHeight}
                    min={10}
                    max={800}
                    onChange={(v) => set("estimatedItemHeight", v)}
                  />
                </Row>
              )}
              <Row label="Min height">
                <div className="flex items-center gap-2">
                  <Toggle
                    value={config.useMinItemHeight}
                    onChange={(v) => set("useMinItemHeight", v)}
                  />
                  {config.useMinItemHeight && (
                    <NumInput
                      value={config.minItemHeight}
                      min={0}
                      max={400}
                      onChange={(v) => set("minItemHeight", v)}
                    />
                  )}
                </div>
              </Row>
            </Section>
          )}

          {/* Virtual — virtual only */}
          {config.component === "masonry-virtual" && (
            <Section title="Virtual">
              <Row label="Overscan">
                <Slider
                  value={config.overscanBy}
                  min={0}
                  max={10}
                  onChange={(v) => set("overscanBy", v)}
                />
              </Row>
            </Section>
          )}

          {/* Advanced */}
          <Collapsible title="Advanced">
            <Field label="Role">
              <Seg
                value={config.role}
                options={[
                  { label: "List", value: "list" },
                  { label: "Grid", value: "grid" },
                  { label: "None", value: "none" },
                ]}
                onChange={(v) => set("role", v)}
              />
            </Field>
            {config.component === "masonry" && (
              <Row label="Native CSS">
                <Toggle value={config.enableNative} onChange={(v) => set("enableNative", v)} />
              </Row>
            )}
            <Field label="Container">
              <Seg
                value={config.as}
                options={[
                  { label: "div", value: "div" },
                  { label: "ul", value: "ul" },
                  { label: "section", value: "section" },
                  { label: "main", value: "main" },
                ]}
                onChange={(v) => set("as", v)}
              />
            </Field>
            <Field label="Item">
              <Seg
                value={config.itemAs}
                options={[
                  { label: "div", value: "div" },
                  { label: "li", value: "li" },
                  { label: "article", value: "article" },
                ]}
                onChange={(v) => set("itemAs", v)}
              />
            </Field>
            <Row label="aria-label">
              <input
                className={clsx(inputCls, "w-28 placeholder:text-zinc-600")}
                value={config.ariaLabel}
                placeholder="optional"
                onChange={(e) => set("ariaLabel", e.target.value)}
              />
            </Row>
          </Collapsible>
        </div>
      </ScrollArea.Viewport>

      <ScrollArea.Scrollbar
        orientation="vertical"
        className="flex w-1 touch-none select-none rounded-full p-px"
      >
        <ScrollArea.Thumb className="flex-1 rounded-full bg-zinc-700 transition-colors hover:bg-zinc-500" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
