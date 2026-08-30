'use client';

import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

type StageTile = {
  id: string;
  tone: 'accent' | 'inverse' | 'muted' | 'plain';
  kind: 'brand' | 'code' | 'count' | 'css' | 'balance' | 'ssr' | 'window';
};

type TilePosition = {
  height: number;
  left: string;
  top: number;
};

const stageTiles: StageTile[] = [
  { id: 'brand', tone: 'accent', kind: 'brand' },
  { id: 'count', tone: 'inverse', kind: 'count' },
  { id: 'code', tone: 'plain', kind: 'code' },
  { id: 'css', tone: 'muted', kind: 'css' },
  { id: 'balance', tone: 'plain', kind: 'balance' },
  { id: 'ssr', tone: 'inverse', kind: 'ssr' },
  { id: 'window', tone: 'muted', kind: 'window' },
];

const stageOrders = [
  [0, 1, 2, 3, 4, 5, 6],
  [2, 0, 4, 1, 6, 3, 5],
  [5, 2, 6, 0, 3, 1, 4],
] as const;

const stageHeights = [
  [134, 182, 120, 160, 142, 196, 150],
  [168, 130, 176, 140, 190, 128, 158],
  [144, 198, 132, 184, 126, 164, 176],
] as const;

const stageEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

function calculateTilePositions(stageCycle: number) {
  const columnHeights = [0, 0, 0];
  const positions: Record<string, TilePosition> = {};
  const order = stageOrders[stageCycle];
  const heights = stageHeights[stageCycle];

  order.forEach((tileIndex) => {
    const shortestHeight = Math.min(...columnHeights);
    const columnIndex = columnHeights.indexOf(shortestHeight);
    const tile = stageTiles[tileIndex];
    const height = heights[tileIndex];

    positions[tile.id] = {
      height,
      left: `${columnIndex * 34}%`,
      top: shortestHeight,
    };
    columnHeights[columnIndex] += height + 10;
  });

  return positions;
}

export function HomeMasonryStage() {
  const shouldReduceMotion = useReducedMotion() === true;
  const [stageCycle, setStageCycle] = useState(0);
  const tilePositions = useMemo(
    () => calculateTilePositions(stageCycle),
    [stageCycle],
  );

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const stageInterval = window.setInterval(() => {
      setStageCycle((currentCycle) => (currentCycle + 1) % stageOrders.length);
    }, 3_600);

    return () => window.clearInterval(stageInterval);
  }, [shouldReduceMotion]);

  return (
    <div
      aria-hidden="true"
      className={clsx(
        'relative h-[31rem] overflow-hidden',
        'rounded-xl',
        'bg-fd-muted/25',
      )}
    >
      <div className="absolute inset-3">
        {stageTiles.map((tile, tileIndex) => {
          const position = tilePositions[tile.id];

          return (
            <motion.div
              key={tile.id}
              className={clsx(
                'absolute w-[32%] overflow-hidden',
                'rounded-[10px] border',
                'select-none',
                tile.tone === 'accent' &&
                  'border-transparent bg-blue-600 text-white',
                tile.tone === 'inverse' &&
                  'border-transparent bg-fd-foreground text-fd-background',
                tile.tone === 'muted' &&
                  'border-fd-border/60 bg-fd-muted text-fd-foreground',
                tile.tone === 'plain' &&
                  'border-fd-border bg-fd-background text-fd-foreground',
              )}
              initial={
                shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 24 }
              }
              animate={{
                height: position.height,
                left: position.left,
                opacity: 1,
                scale: 1,
                top: position.top,
                y: 0,
              }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
              transition={{
                delay: shouldReduceMotion ? 0 : tileIndex * 0.035,
                duration: shouldReduceMotion ? 0 : 0.9,
                ease: stageEase,
              }}
            >
              <StageTileContent tile={tile} />
            </motion.div>
          );
        })}
      </div>
      <div
        className={clsx(
          'absolute inset-x-3 bottom-3 flex items-center justify-between',
          'px-1',
          'font-mono text-[10px] uppercase tracking-[0.16em]',
          'text-fd-muted-foreground',
        )}
      >
        <span>Items arrive</span>
        <span>Shortest column wins</span>
      </div>
    </div>
  );
}

function StageTileContent({ tile }: { tile: StageTile }) {
  if (tile.kind === 'brand') {
    return (
      <div className={clsx('flex h-full flex-col justify-between', 'p-3')}>
        <span className={clsx('text-xs font-medium', 'text-white/75')}>
          Masonix
        </span>
        <span className="text-6xl font-semibold leading-none tracking-[-0.08em]">
          M
        </span>
      </div>
    );
  }

  if (tile.kind === 'count') {
    return (
      <div className={clsx('flex h-full flex-col justify-end', 'p-3')}>
        <span className="text-3xl font-semibold tracking-[-0.06em]">10K</span>
        <span className={clsx('mt-1', 'font-mono text-[10px] uppercase')}>
          items
        </span>
      </div>
    );
  }

  if (tile.kind === 'code') {
    return (
      <div
        className={clsx(
          'flex h-full flex-col justify-center gap-1',
          'p-3',
          'font-mono text-[10px] leading-4',
          'text-fd-muted-foreground',
        )}
      >
        <span className="text-blue-600 dark:text-blue-400">&lt;Masonry</span>
        <span className="pl-2">columns=&#123;3&#125;</span>
        <span className="pl-2">gap=&#123;12&#125;</span>
        <span className="text-blue-600 dark:text-blue-400">/&gt;</span>
      </div>
    );
  }

  if (tile.kind === 'css') {
    return (
      <div className={clsx('flex h-full flex-col justify-between', 'p-3')}>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
          CSS-first
        </span>
        <span className="text-4xl font-medium tracking-[-0.07em]">01</span>
      </div>
    );
  }

  if (tile.kind === 'balance') {
    return (
      <div className={clsx('flex h-full flex-col justify-between', 'p-3')}>
        <span
          className={clsx(
            'font-mono text-[10px] uppercase tracking-[0.14em]',
            'text-fd-muted-foreground',
          )}
        >
          Placement
        </span>
        <span className="text-xl font-semibold leading-5 tracking-[-0.04em]">
          Always the shortest.
        </span>
      </div>
    );
  }

  if (tile.kind === 'ssr') {
    return (
      <div className={clsx('flex h-full flex-col justify-between', 'p-3')}>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
          Ready
        </span>
        <span className="text-4xl font-semibold tracking-[-0.06em]">SSR</span>
      </div>
    );
  }

  return (
    <div className={clsx('flex h-full flex-col justify-between', 'p-3')}>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
        Windowed
      </span>
      <div className="space-y-1.5">
        <span
          className={clsx(
            'block h-1.5 w-full',
            'rounded-full',
            'bg-fd-foreground/20',
          )}
        />
        <span
          className={clsx(
            'block h-1.5 w-3/4',
            'rounded-full',
            'bg-fd-foreground/20',
          )}
        />
        <span
          className={clsx('block h-1.5 w-1/2', 'rounded-full', 'bg-blue-600')}
        />
      </div>
    </div>
  );
}
