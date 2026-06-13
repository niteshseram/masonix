import type { Config, ComponentMode } from './components/config-panel';

export const TABS: { value: ComponentMode; label: string; desc: string }[] = [
  {
    value: 'masonry',
    label: 'Masonry',
    desc: 'CSS layout · source order preserved',
  },
  {
    value: 'masonry-balanced',
    label: 'Balanced',
    desc: 'Measured cards · shortest column placement',
  },
  {
    value: 'masonry-virtual',
    label: 'Virtual',
    desc: 'Windowed rendering for long feeds',
  },
];

export const PRESETS: {
  name: string;
  description: string;
  config: Partial<Config>;
}[] = [
  {
    name: 'Tall gallery',
    description: 'Two columns with varied heights',
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
    name: 'Photo wall',
    description: 'Auto-fit columns with even cards',
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
    name: 'Note cards',
    description: 'Measured cards with mixed heights',
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
    name: 'Large feed',
    description: 'Virtualized 10,000-item layout',
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
