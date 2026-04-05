import type { Config, ComponentMode } from './components/config-panel';

export const TABS: { value: ComponentMode; label: string; desc: string }[] = [
  {
    value: 'masonry',
    label: 'Masonry',
    desc: 'CSS flexbox · round-robin columns',
  },
  {
    value: 'masonry-balanced',
    label: 'Balanced',
    desc: 'JS-measured · shortest-column-first',
  },
  {
    value: 'masonry-virtual',
    label: 'Virtual',
    desc: 'Virtualized · interval tree · O(log n)',
  },
];

export const PRESETS: {
  name: string;
  description: string;
  config: Partial<Config>;
}[] = [
  {
    name: 'Pinterest',
    description: '2 cols · tall random heights',
    config: {
      component: 'masonry',
      columnMode: 'fixed',
      fixedColumns: 2,
      gapMode: 'fixed',
      fixedGap: 6,
      heightMode: 'random',
      minItemH: 200,
      maxItemH: 600,
      itemCount: 20,
      cardStyle: 'color-block',
    },
  },
  {
    name: 'Photo grid',
    description: 'Auto columns · uniform height',
    config: {
      component: 'masonry',
      columnMode: 'columnWidth',
      autoColumnWidth: 180,
      gapMode: 'fixed',
      fixedGap: 4,
      heightMode: 'uniform',
      uniformHeight: 220,
      itemCount: 40,
      cardStyle: 'color-block',
    },
  },
  {
    name: 'Text notes',
    description: 'Balanced layout · text cards',
    config: {
      component: 'masonry-balanced',
      columnMode: 'fixed',
      fixedColumns: 3,
      gapMode: 'fixed',
      fixedGap: 16,
      heightMode: 'stepped',
      itemCount: 24,
      cardStyle: 'text-card',
    },
  },
  {
    name: '10k items',
    description: 'Virtual · 10,000 items',
    config: {
      component: 'masonry-virtual',
      columnMode: 'custom',
      customColBps: [
        { minWidth: 0, value: 2 },
        { minWidth: 768, value: 3 },
        { minWidth: 1200, value: 4 },
      ],
      gapMode: 'fixed',
      fixedGap: 10,
      heightMode: 'random',
      minItemH: 100,
      maxItemH: 400,
      itemCount: 10000,
      cardStyle: 'color-block',
    },
  },
];
