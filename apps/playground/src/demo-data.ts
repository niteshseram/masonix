import type { Config } from "./components/config-panel";

export interface Photo {
  id: number;
  alt: string;
  height: number;
  color: string;
}

export const COLORS = [
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

// Deterministic pseudo-random in [0, 1) for a given seed.
function seededRand(seed: number): number {
  const sinValue = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5;
  return sinValue - Math.floor(sinValue);
}

function resolveHeight(index: number, shuffleKey: number, config: Config): number {
  switch (config.heightMode) {
    case "uniform":
      return config.uniformHeight;
    case "random": {
      const randomValue = seededRand(index * 31 + shuffleKey * 1000);
      return Math.round(config.minItemH + randomValue * (config.maxItemH - config.minItemH));
    }
    default: // stepped
      return 120 + ((((index + shuffleKey * 3) % 7) + 7) % 7) * 40;
  }
}

export function makePhotos(count: number, shuffleKey: number, config: Config): Photo[] {
  return Array.from({ length: count }, (_, itemIndex) => ({
    id: itemIndex,
    alt: `Item ${itemIndex + 1}`,
    height: resolveHeight(itemIndex, shuffleKey, config),
    color: COLORS[(itemIndex + shuffleKey * 3) % COLORS.length],
  }));
}
