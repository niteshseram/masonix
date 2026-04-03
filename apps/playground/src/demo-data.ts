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
  const s = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5;
  return s - Math.floor(s);
}

function resolveHeight(index: number, shuffleKey: number, config: Config): number {
  switch (config.heightMode) {
    case "uniform":
      return config.uniformHeight;
    case "random": {
      const r = seededRand(index * 31 + shuffleKey * 1000);
      return Math.round(config.minItemH + r * (config.maxItemH - config.minItemH));
    }
    default: // stepped
      return 120 + (((index + shuffleKey * 3) % 7) + 7) % 7 * 40;
  }
}

export function makePhotos(count: number, shuffleKey: number, config: Config): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    alt: `Item ${i + 1}`,
    height: resolveHeight(i, shuffleKey, config),
    color: COLORS[(i + shuffleKey * 3) % COLORS.length],
  }));
}
