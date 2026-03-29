import type React from "react";
import { ScrollArea } from "@base-ui-components/react/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColumnMode = "fixed" | "custom" | "columnWidth";
export type GapMode = "fixed" | "custom";

export interface BpEntry {
  minWidth: number;
  value: number;
}

export interface Config {
  // Items
  itemCount: number;
  showEmpty: boolean;

  // Columns
  columnMode: ColumnMode;
  fixedColumns: number;
  customColBps: BpEntry[];
  autoColumnWidth: number;
  maxColumns: number;
  useMaxColumns: boolean;

  // Gap
  gapMode: GapMode;
  fixedGap: number;
  customGapBps: BpEntry[];

  // Layout
  dir: "ltr" | "rtl" | "auto";
  role: "list" | "grid" | "none";
  enableNative: boolean;

  // Elements
  as: "div" | "ul" | "section" | "main";
  itemAs: "div" | "li" | "article";
  ariaLabel: string;
}

export const DEFAULT_CONFIG: Config = {
  itemCount: 20,
  showEmpty: false,

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

  dir: "ltr",
  role: "list",
  enableNative: false,

  as: "div",
  itemAs: "div",
  ariaLabel: "",
};

// ─── Primitives ───────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 border-b border-zinc-800 pb-1.5 text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="min-w-[76px] shrink-0 text-xs text-zinc-400">{label}</label>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const baseInputCls =
  "bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 px-1.5 py-1 outline-none focus:ring-1 focus:ring-blue-500";

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
  return (
    <input
      type="number"
      className={`${baseInputCls} w-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      style={style}
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
      }}
    />
  );
}

function Sel<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      className={`${baseInputCls} cursor-pointer`}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative h-5 w-8 rounded-full transition-colors duration-150 ${
        value ? "bg-blue-500" : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] duration-150 ${
          value ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

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
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className="w-24 accent-blue-500"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-6 text-right text-xs tabular-nums text-zinc-400">{value}</span>
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

  function remove(i: number) {
    onChange(entries.filter((_, idx) => idx !== i));
  }

  function add() {
    const last = entries[entries.length - 1];
    onChange([
      ...entries,
      { minWidth: (last?.minWidth ?? 0) + 300, value: last?.value ?? valueMin },
    ]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="mb-0.5 grid grid-cols-[1fr_1fr_16px] gap-x-1.5">
        <span className="text-center text-[10px] text-zinc-600">min-width (px)</span>
        <span className="text-center text-[10px] text-zinc-600">{valueLabel}</span>
      </div>

      {entries.map((entry, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_16px] items-center gap-x-1.5">
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
            onClick={() => remove(i)}
            className="text-base leading-none text-zinc-600 transition-colors hover:text-zinc-300"
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="mt-0.5 w-full rounded border border-dashed border-zinc-700 py-1 text-xs text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-400"
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
                max={50}
                onChange={(v) => set("itemCount", v)}
              />
            </Row>
            <Row label="Empty state">
              <Toggle value={config.showEmpty} onChange={(v) => set("showEmpty", v)} />
            </Row>
          </Section>

          {/* Columns */}
          <Section title="Columns">
            <Row label="Mode">
              <Sel
                value={config.columnMode}
                options={[
                  { label: "Fixed", value: "fixed" },
                  { label: "Custom bps", value: "custom" },
                  { label: "Col width", value: "columnWidth" },
                ]}
                onChange={(v) => set("columnMode", v)}
              />
            </Row>

            {config.columnMode === "fixed" && (
              <Row label="Columns">
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
              <Row label="Min width (px)">
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
            <Row label="Mode">
              <Sel
                value={config.gapMode}
                options={[
                  { label: "Fixed", value: "fixed" },
                  { label: "Custom bps", value: "custom" },
                ]}
                onChange={(v) => set("gapMode", v)}
              />
            </Row>

            {config.gapMode === "fixed" && (
              <Row label="Gap (px)">
                <NumInput
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

          {/* Layout */}
          <Section title="Layout">
            <Row label="Dir">
              <Sel
                value={config.dir}
                options={[
                  { label: "ltr", value: "ltr" },
                  { label: "rtl", value: "rtl" },
                  { label: "auto", value: "auto" },
                ]}
                onChange={(v) => set("dir", v)}
              />
            </Row>
            <Row label="Role">
              <Sel
                value={config.role}
                options={[
                  { label: "list", value: "list" },
                  { label: "grid", value: "grid" },
                  { label: "none", value: "none" },
                ]}
                onChange={(v) => set("role", v)}
              />
            </Row>
            <Row label="Native CSS">
              <Toggle value={config.enableNative} onChange={(v) => set("enableNative", v)} />
            </Row>
          </Section>

          {/* Elements */}
          <Section title="Elements">
            <Row label="Container">
              <Sel
                value={config.as}
                options={[
                  { label: "div", value: "div" },
                  { label: "ul", value: "ul" },
                  { label: "section", value: "section" },
                  { label: "main", value: "main" },
                ]}
                onChange={(v) => set("as", v)}
              />
            </Row>
            <Row label="Item">
              <Sel
                value={config.itemAs}
                options={[
                  { label: "div", value: "div" },
                  { label: "li", value: "li" },
                  { label: "article", value: "article" },
                ]}
                onChange={(v) => set("itemAs", v)}
              />
            </Row>
            <Row label="aria-label">
              <input
                className={`${baseInputCls} w-28 placeholder:text-zinc-600`}
                value={config.ariaLabel}
                placeholder="optional"
                onChange={(e) => set("ariaLabel", e.target.value)}
              />
            </Row>
          </Section>
        </div>
      </ScrollArea.Viewport>

      <ScrollArea.Scrollbar
        orientation="vertical"
        className="flex w-1.5 touch-none select-none rounded-full p-px"
      >
        <ScrollArea.Thumb className="flex-1 rounded-full bg-zinc-700 transition-colors hover:bg-zinc-500" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
