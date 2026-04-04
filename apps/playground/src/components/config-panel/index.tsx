import type React from "react";
import { clsx } from "clsx";
import { ScrollArea } from "@base-ui-components/react/scroll-area";
import { Seg } from "../ui/seg";
import { NumInput, inputCls } from "../ui/num-input";
import { Toggle } from "../ui/toggle";
import { Slider } from "../ui/slider";
import { Section, Collapsible, Row, Field } from "./layout";
import { BpEditor } from "./bp-editor";
import type { Config } from "./types";

export type {
  ComponentMode,
  ColumnMode,
  GapMode,
  HeightMode,
  CardStyle,
  BpEntry,
  Config,
} from "./types";
export { DEFAULT_CONFIG } from "./types";

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
