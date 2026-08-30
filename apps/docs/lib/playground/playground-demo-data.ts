import type { Config } from '@/components/playground/config-panel/playground-config-panel';

export interface PlaygroundItem {
  id: number;
  height: number;
  title: string;
  summary: string;
  category: string;
  project: string;
  status: string;
  owner: string;
  initials: string;
  updated: string;
  tags: readonly string[];
  surface: string;
  ink: string;
  accent: string;
}

const CONTENT = [
  {
    title: 'Wayfinding at dusk',
    summary:
      'Field observations from the west entrance, where the existing signs disappear as daylight drops.',
    category: 'Field note',
    project: 'North terminal',
    status: 'In review',
    owner: 'Mira Chen',
    initials: 'MC',
    updated: '18 min',
    tags: ['Wayfinding', 'Accessibility'],
  },
  {
    title: 'A quieter checkout',
    summary:
      'Removed three competing actions and kept the order summary visible through the final payment step.',
    category: 'Interface',
    project: 'Market app',
    status: 'Ready',
    owner: 'Noah Williams',
    initials: 'NW',
    updated: '42 min',
    tags: ['Checkout'],
  },
  {
    title: 'Room for the work',
    summary:
      'The new system uses spacing and type scale to create hierarchy before adding decoration.',
    category: 'Direction',
    project: 'Studio system',
    status: 'Approved',
    owner: 'Inez Park',
    initials: 'IP',
    updated: '2 hr',
    tags: ['Type scale', 'Tokens'],
  },
  {
    title: 'After the last train',
    summary:
      'An image sequence about empty platforms, fluorescent light, and the final service of the night.',
    category: 'Photo essay',
    project: 'Night archive',
    status: 'Editing',
    owner: 'Theo Martin',
    initials: 'TM',
    updated: '4 hr',
    tags: ['Photography', 'Sequence'],
  },
  {
    title: 'Material library, v2',
    summary:
      'Added finish samples, supplier notes, and a clearer durability rating for every surface.',
    category: 'Collection',
    project: 'Workshop',
    status: 'In progress',
    owner: 'Samira Ali',
    initials: 'SA',
    updated: 'Yesterday',
    tags: ['Materials'],
  },
  {
    title: 'The useful edge case',
    summary:
      'Seven failure states from the latest test are now represented in the component specification.',
    category: 'Research',
    project: 'Account recovery',
    status: 'Needs input',
    owner: 'Jon Bell',
    initials: 'JB',
    updated: 'Yesterday',
    tags: ['Edge cases', 'Specification'],
  },
  {
    title: 'Common ground',
    summary:
      'A compact identity toolkit for neighborhood events, local notices, and shared public spaces.',
    category: 'Identity',
    project: 'Civic commons',
    status: 'Ready',
    owner: 'Lea Ortiz',
    initials: 'LO',
    updated: 'Mon',
    tags: ['Identity', 'Toolkit'],
  },
  {
    title: 'Small screens, full context',
    summary:
      'Reworked the mobile detail view so the primary record and recent activity remain connected.',
    category: 'Prototype',
    project: 'Field kit',
    status: 'Testing',
    owner: 'Arun Rao',
    initials: 'AR',
    updated: 'Tue',
    tags: ['Mobile', 'Prototype'],
  },
] as const;

const PALETTES = [
  { surface: '#d9ff57', ink: '#11150b', accent: '#23543a' },
  { surface: '#ff7657', ink: '#24100b', accent: '#7a2017' },
  { surface: '#bdc9ff', ink: '#11162e', accent: '#3c4aa8' },
  { surface: '#f0e7d2', ink: '#1d1b17', accent: '#8b4e31' },
  { surface: '#164e45', ink: '#f4f0e6', accent: '#82d9b3' },
  { surface: '#232326', ink: '#f4f1e8', accent: '#aaa6ff' },
] as const;

function seededRand(seed: number): number {
  const sinValue = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5;
  return sinValue - Math.floor(sinValue);
}

function resolveHeight(
  index: number,
  shuffleKey: number,
  config: Config,
): number {
  switch (config.heightMode) {
    case 'uniform':
      return config.uniformHeight;
    case 'random': {
      const randomValue = seededRand(index * 31 + shuffleKey * 1000);
      return Math.round(
        config.minItemH + randomValue * (config.maxItemH - config.minItemH),
      );
    }
    default:
      return 120 + ((((index + shuffleKey * 3) % 7) + 7) % 7) * 40;
  }
}

export function makePlaygroundItems(
  count: number,
  shuffleKey: number,
  config: Config,
): PlaygroundItem[] {
  return Array.from({ length: count }, (_, itemIndex) => {
    const contentIndex = (itemIndex + shuffleKey * 3) % CONTENT.length;
    const paletteIndex = (itemIndex * 5 + shuffleKey) % PALETTES.length;

    return {
      id: itemIndex,
      height: resolveHeight(itemIndex, shuffleKey, config),
      ...CONTENT[contentIndex],
      ...PALETTES[paletteIndex],
    };
  });
}
