import { clsx } from 'clsx';
import type React from 'react';

import { BpEditor } from '@/components/playground/config-panel/playground-config-panel-bp-editor';
import {
  Section,
  Collapsible,
  Row,
  Field,
} from '@/components/playground/config-panel/playground-config-panel-layout';
import type { Config } from '@/components/playground/config-panel/playground-config-panel-types';
import {
  NumInput,
  inputCls,
} from '@/components/playground/ui/playground-num-input';
import { ScrollArea } from '@/components/playground/ui/playground-scroll-area';
import { Seg } from '@/components/playground/ui/playground-seg';
import { Slider } from '@/components/playground/ui/playground-slider';
import { Toggle } from '@/components/playground/ui/playground-toggle';

export type {
  ComponentMode,
  ColumnMode,
  GapMode,
  HeightMode,
  CardStyle,
  BpEntry,
  Config,
} from '@/components/playground/config-panel/playground-config-panel-types';
export { DEFAULT_CONFIG } from '@/components/playground/config-panel/playground-config-panel-types';

export function ConfigPanel({
  config,
  setConfig,
}: {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}) {
  function set<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((prevConfig) => ({ ...prevConfig, [key]: value }));
  }

  const isBalancedOrVirtual =
    config.component === 'masonry-balanced' ||
    config.component === 'masonry-virtual';
  const knownHeightsDisabled = config.cardStyle === 'text-card';
  const maxCount = config.component === 'masonry-virtual' ? 10000 : 100;

  return (
    <ScrollArea
      autoHide={true}
      className="h-full overflow-hidden"
      scrollbarClassName={clsx(
        'flex w-1',
        'p-px',
        'rounded-full',
        'touch-none select-none',
      )}
    >
      <div className="px-4 pt-4 pb-8">
        <Section title="Items">
          <Row label="Count">
            <Slider
              ariaLabel="Item count"
              value={config.itemCount}
              min={0}
              max={maxCount}
              onChange={(nextValue) => set('itemCount', nextValue)}
            />
          </Row>
          <Field label="Card type">
            <Seg
              value={config.cardStyle}
              options={[
                { label: 'Color block', value: 'color-block' },
                { label: 'Text card', value: 'text-card' },
              ]}
              onChange={(nextValue) => set('cardStyle', nextValue)}
            />
          </Field>
          <Field label="Height pattern">
            <Seg
              value={config.heightMode}
              options={[
                { label: 'Stepped', value: 'stepped' },
                { label: 'Random', value: 'random' },
                { label: 'Uniform', value: 'uniform' },
              ]}
              onChange={(nextValue) => set('heightMode', nextValue)}
            />
          </Field>
          {config.heightMode === 'random' && (
            <Row label="Height range">
              <div className="flex items-center gap-1.5">
                <NumInput
                  ariaLabel="Minimum item height"
                  value={config.minItemH}
                  min={20}
                  max={config.maxItemH - 20}
                  onChange={(nextValue) => set('minItemH', nextValue)}
                />
                <span className={clsx('text-xs', 'text-zinc-600')}>-</span>
                <NumInput
                  ariaLabel="Maximum item height"
                  value={config.maxItemH}
                  min={config.minItemH + 20}
                  max={800}
                  onChange={(nextValue) => set('maxItemH', nextValue)}
                />
              </div>
            </Row>
          )}
          {config.heightMode === 'uniform' && (
            <Row label="Height">
              <NumInput
                ariaLabel="Uniform item height"
                value={config.uniformHeight}
                min={20}
                max={800}
                onChange={(nextValue) => set('uniformHeight', nextValue)}
              />
            </Row>
          )}
        </Section>

        <Section title="Columns">
          <Field label="Mode">
            <Seg
              value={config.columnMode}
              options={[
                { label: 'Fixed', value: 'fixed' },
                { label: 'Custom', value: 'custom' },
                { label: 'Auto', value: 'columnWidth' },
              ]}
              onChange={(nextValue) => set('columnMode', nextValue)}
            />
          </Field>
          {config.columnMode === 'fixed' && (
            <Row label="Count">
              <NumInput
                ariaLabel="Column count"
                value={config.fixedColumns}
                min={1}
                max={12}
                onChange={(nextValue) => set('fixedColumns', nextValue)}
              />
            </Row>
          )}
          {config.columnMode === 'custom' && (
            <BpEditor
              entries={config.customColBps}
              valueLabel="columns"
              valueMin={1}
              valueMax={12}
              onChange={(nextBreakpoints) =>
                set('customColBps', nextBreakpoints)
              }
            />
          )}
          {config.columnMode === 'columnWidth' && (
            <Row label="Min column">
              <NumInput
                ariaLabel="Minimum column width"
                value={config.autoColumnWidth}
                min={50}
                max={800}
                onChange={(nextValue) => set('autoColumnWidth', nextValue)}
              />
            </Row>
          )}
          <Row label="Max columns">
            <div className="flex items-center gap-2">
              <Toggle
                ariaLabel="Use max columns"
                value={config.useMaxColumns}
                onChange={(nextValue) => set('useMaxColumns', nextValue)}
              />
              {config.useMaxColumns && (
                <NumInput
                  ariaLabel="Maximum columns"
                  value={config.maxColumns}
                  min={1}
                  max={12}
                  onChange={(nextValue) => set('maxColumns', nextValue)}
                />
              )}
            </div>
          </Row>
        </Section>

        <Section title="Gap">
          <Field label="Mode">
            <Seg
              value={config.gapMode}
              options={[
                { label: 'Fixed', value: 'fixed' },
                { label: 'Custom', value: 'custom' },
              ]}
              onChange={(nextValue) => set('gapMode', nextValue)}
            />
          </Field>
          {config.gapMode === 'fixed' && (
            <Row label="Gap size">
              <Slider
                ariaLabel="Gap size"
                value={config.fixedGap}
                min={0}
                max={64}
                onChange={(nextValue) => set('fixedGap', nextValue)}
              />
            </Row>
          )}
          {config.gapMode === 'custom' && (
            <BpEditor
              entries={config.customGapBps}
              valueLabel="gap (px)"
              valueMin={0}
              valueMax={64}
              onChange={(nextBreakpoints) =>
                set('customGapBps', nextBreakpoints)
              }
            />
          )}
        </Section>

        {isBalancedOrVirtual && (
          <Section title="Measurement">
            <Row label="Known heights">
              <Toggle
                ariaLabel="Use known heights"
                value={config.useKnownHeights}
                disabled={knownHeightsDisabled}
                onChange={(nextValue) => set('useKnownHeights', nextValue)}
              />
            </Row>
            {!config.useKnownHeights && !knownHeightsDisabled && (
              <Row label="Estimate">
                <NumInput
                  ariaLabel="Estimated item height"
                  value={config.estimatedItemHeight}
                  min={10}
                  max={800}
                  onChange={(nextValue) =>
                    set('estimatedItemHeight', nextValue)
                  }
                />
              </Row>
            )}
            <Row label="Min height">
              <div className="flex items-center gap-2">
                <Toggle
                  ariaLabel="Use minimum item height"
                  value={config.useMinItemHeight}
                  onChange={(nextValue) => set('useMinItemHeight', nextValue)}
                />
                {config.useMinItemHeight && (
                  <NumInput
                    ariaLabel="Minimum item height"
                    value={config.minItemHeight}
                    min={0}
                    max={400}
                    onChange={(nextValue) => set('minItemHeight', nextValue)}
                  />
                )}
              </div>
            </Row>
          </Section>
        )}

        {config.component === 'masonry-virtual' && (
          <Section title="Virtualization">
            <Row label="Overscan">
              <Slider
                ariaLabel="Overscan"
                value={config.overscanBy}
                min={0}
                max={10}
                onChange={(nextValue) => set('overscanBy', nextValue)}
              />
            </Row>
            <Row label="End threshold">
              <NumInput
                ariaLabel="End reached threshold"
                value={config.endReachedThreshold}
                min={0}
                max={1000}
                onChange={(nextValue) => set('endReachedThreshold', nextValue)}
              />
            </Row>
            <Row label="Scroll seek">
              <div className="flex items-center gap-2">
                <Toggle
                  ariaLabel="Enable scroll seek"
                  value={config.enableScrollSeek}
                  onChange={(nextValue) => set('enableScrollSeek', nextValue)}
                />
                {config.enableScrollSeek && (
                  <NumInput
                    ariaLabel="Scroll seek velocity threshold"
                    value={config.scrollSeekVelocityThreshold}
                    min={0}
                    max={20000}
                    onChange={(nextValue) =>
                      set('scrollSeekVelocityThreshold', nextValue)
                    }
                  />
                )}
              </div>
            </Row>
          </Section>
        )}

        <Collapsible title="Advanced">
          <Field label="Role">
            <Seg
              value={config.role}
              options={[
                { label: 'List', value: 'list' },
                { label: 'Grid', value: 'grid' },
                { label: 'None', value: 'none' },
              ]}
              onChange={(nextValue) => set('role', nextValue)}
            />
          </Field>
          {config.component === 'masonry' && (
            <Row label="Native CSS">
              <Toggle
                ariaLabel="Enable native CSS"
                value={config.enableNative}
                onChange={(nextValue) => set('enableNative', nextValue)}
              />
            </Row>
          )}
          <Field label="Container">
            <Seg
              value={config.as}
              options={[
                { label: 'div', value: 'div' },
                { label: 'ul', value: 'ul' },
                { label: 'section', value: 'section' },
                { label: 'main', value: 'main' },
              ]}
              onChange={(nextValue) => set('as', nextValue)}
            />
          </Field>
          <Field label="Item">
            <Seg
              value={config.itemAs}
              options={[
                { label: 'div', value: 'div' },
                { label: 'li', value: 'li' },
                { label: 'article', value: 'article' },
              ]}
              onChange={(nextValue) => set('itemAs', nextValue)}
            />
          </Field>
          <Row label="aria-label">
            <input
              aria-label="aria-label"
              className={clsx(inputCls, 'w-28 placeholder:text-zinc-600')}
              value={config.ariaLabel}
              placeholder="Optional"
              onChange={(event) => set('ariaLabel', event.target.value)}
            />
          </Row>
        </Collapsible>
      </div>
    </ScrollArea>
  );
}
