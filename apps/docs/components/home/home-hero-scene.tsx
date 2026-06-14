'use client';

import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';

const cardSettleDuration = 1.28;
const heroLoopDuration = 8.8;
const boardLoopDuration = 12.8;
const softEase = 'easeInOut' as const;
const settleEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const solverRails = ['47%', '64%', '83%'] as const;

const solverCards = [
  {
    id: 1,
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.36)',
    left: '47%',
    top: '9%',
    width: '15rem',
    height: 132,
    fromX: '18rem',
    fromY: '-6rem',
    fromRotate: -7,
    shuffleX: -10,
    shuffleY: 12,
    shuffleRotate: -1.4,
    measureTravel: 82,
    delay: 0,
  },
  {
    id: 2,
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.4)',
    left: '64%',
    top: '8%',
    width: '17.25rem',
    height: 236,
    fromX: '20rem',
    fromY: '-4rem',
    fromRotate: 5,
    shuffleX: 8,
    shuffleY: -14,
    shuffleRotate: 1.1,
    measureTravel: 118,
    delay: 0.18,
  },
  {
    id: 3,
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.32)',
    left: '47%',
    top: '30%',
    width: '15rem',
    height: 188,
    fromX: '16rem',
    fromY: '-2rem',
    fromRotate: 6,
    shuffleX: -8,
    shuffleY: -10,
    shuffleRotate: 1.2,
    measureTravel: 92,
    delay: 0.36,
  },
  {
    id: 4,
    color: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.32)',
    left: '83%',
    top: '13%',
    width: '12rem',
    height: 154,
    fromX: '12rem',
    fromY: '-4rem',
    fromRotate: -4,
    shuffleX: 10,
    shuffleY: 10,
    shuffleRotate: -1,
    measureTravel: 66,
    delay: 0.54,
  },
  {
    id: 5,
    color: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.36)',
    left: '64%',
    top: '48%',
    width: '17.25rem',
    height: 150,
    fromX: '15rem',
    fromY: '4rem',
    fromRotate: -5,
    shuffleX: 10,
    shuffleY: -9,
    shuffleRotate: -1.2,
    measureTravel: 122,
    delay: 0.72,
  },
  {
    id: 6,
    color: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.36)',
    left: '83%',
    top: '37%',
    width: '12rem',
    height: 226,
    fromX: '11rem',
    fromY: '3rem',
    fromRotate: 6,
    shuffleX: -9,
    shuffleY: 14,
    shuffleRotate: 1.4,
    measureTravel: 72,
    delay: 0.9,
  },
  {
    id: 7,
    color: '#f87171',
    glow: 'rgba(248, 113, 113, 0.32)',
    left: '47%',
    top: '60%',
    width: '15rem',
    height: 170,
    fromX: '14rem',
    fromY: '7rem',
    fromRotate: -6,
    shuffleX: 8,
    shuffleY: -12,
    shuffleRotate: -1.1,
    measureTravel: 88,
    delay: 1.08,
  },
  {
    id: 8,
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.32)',
    left: '64%',
    top: '71%',
    width: '17.25rem',
    height: 116,
    fromX: '13rem',
    fromY: '7rem',
    fromRotate: 4,
    shuffleX: -10,
    shuffleY: 8,
    shuffleRotate: 1,
    measureTravel: 116,
    delay: 1.26,
  },
] as const;

const mobileSolverCards = [
  ['#22d3ee', 120],
  ['#a78bfa', 172],
  ['#fbbf24', 138],
  ['#4ade80', 112],
  ['#f472b6', 152],
  ['#60a5fa', 124],
] as const;

const cardTilePatterns = [
  [24, 42, 18],
  [34, 62, 28],
  [44, 24, 38],
  [28, 48, 22],
  [22, 36, 44],
  [56, 32, 48],
  [38, 30, 52],
  [20, 34, 26],
] as const;

const cardLineWidths = ['82%', '54%'] as const;

type SolverCard = (typeof solverCards)[number];

function getCardBackground(card: SolverCard) {
  return `linear-gradient(145deg, color-mix(in srgb, ${card.color} 78%, white 22%), ${card.color} 48%, color-mix(in srgb, ${card.color} 68%, black 32%))`;
}

function getCardRestingShadow(card: SolverCard) {
  return `inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 28px 80px rgba(0, 0, 0, 0.26), 0 0 48px ${card.glow}`;
}

function getCardLitShadow(card: SolverCard) {
  return `inset 0 1px 0 rgba(255, 255, 255, 0.34), 0 34px 96px rgba(0, 0, 0, 0.3), 0 0 72px ${card.glow}`;
}

function getCardInitial(card: SolverCard, shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return {
      opacity: 1,
      x: '0rem',
      y: '0rem',
      scale: 1,
      rotate: 0,
    };
  }

  return {
    opacity: 0,
    x: card.fromX,
    y: card.fromY,
    scale: 0.84,
    rotate: card.fromRotate,
  };
}

function getCardAnimate() {
  return {
    opacity: 1,
    x: '0rem',
    y: '0rem',
    scale: 1,
    rotate: 0,
  };
}

function getCardTransition(card: SolverCard, shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return { duration: 0 };
  }

  return {
    delay: card.delay,
    duration: cardSettleDuration,
    ease: settleEase,
  };
}

function getCardTilePattern(card: SolverCard) {
  return cardTilePatterns[card.id - 1] ?? cardTilePatterns[0];
}

function getCardSurfaceAnimate(card: SolverCard, shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      boxShadow: getCardRestingShadow(card),
    };
  }

  return {
    x: [0, card.shuffleX, card.shuffleX * -0.35, 0],
    y: [0, card.shuffleY, card.shuffleY * -0.3, 0],
    scale: [1, 1.018, 0.996, 1],
    rotate: [0, card.shuffleRotate, card.shuffleRotate * -0.4, 0],
    boxShadow: [
      getCardRestingShadow(card),
      getCardLitShadow(card),
      getCardRestingShadow(card),
      getCardRestingShadow(card),
    ],
  };
}

function getCardSurfaceTransition(
  card: SolverCard,
  shouldReduceMotion: boolean,
) {
  if (shouldReduceMotion) {
    return { duration: 0 };
  }

  return {
    delay: card.delay + cardSettleDuration + 3.6,
    duration: 1.9,
    repeat: Infinity,
    repeatDelay: 4.8,
    ease: settleEase,
  };
}

function getMeasureAnimate(card: SolverCard, shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return { opacity: 0, x: 0 };
  }

  return {
    opacity: [0, 0, 0.88, 0.42, 0],
    x: [
      0,
      0,
      card.measureTravel,
      card.measureTravel + 22,
      card.measureTravel + 22,
    ],
  };
}

function getMeasureTransition(card: SolverCard, shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return { duration: 0 };
  }

  return {
    delay: card.delay + cardSettleDuration + 0.34,
    duration: heroLoopDuration,
    repeat: Infinity,
    ease: softEase,
    times: [0, 0.18, 0.34, 0.48, 1],
  };
}

function getHighlightAnimate(shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return { opacity: 0, x: '-130%' };
  }

  return {
    opacity: [0, 0, 0.75, 0],
    x: ['-130%', '-130%', '380%', '380%'],
  };
}

function getHighlightTransition(card: SolverCard, shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return { duration: 0 };
  }

  return {
    delay: card.delay + cardSettleDuration + 0.72,
    duration: heroLoopDuration + 0.8,
    repeat: Infinity,
    ease: softEase,
    times: [0, 0.24, 0.42, 1],
  };
}

export function HomeHeroScene() {
  const shouldReduceMotion = useReducedMotion() === true;

  return (
    <div
      aria-hidden={true}
      className={clsx('absolute inset-0 overflow-hidden')}
    >
      <motion.div
        className={clsx('masonix-hero-grid absolute inset-0')}
        animate={
          shouldReduceMotion
            ? { opacity: 0.82 }
            : {
                opacity: [0.72, 0.95, 0.78],
                backgroundPosition: ['0px 0px', '44px 22px', '0px 44px'],
              }
        }
        transition={{
          duration: 16,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: softEase,
        }}
      />
      <div className={clsx('absolute inset-0', 'bg-fd-background/62')} />
      <div
        className={clsx(
          'masonix-solver-stage absolute inset-y-0 hidden md:block',
        )}
      >
        <motion.div
          className={clsx('masonix-solver-board absolute inset-y-10 right-20')}
          animate={
            shouldReduceMotion
              ? { y: 0, rotateY: 0 }
              : { y: [-4, 5, -4], rotateY: [-2, 1.5, -2] }
          }
          transition={{
            duration: boardLoopDuration,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: softEase,
          }}
        >
          {solverRails.map((left) => (
            <motion.div
              key={left}
              className={clsx('masonix-solver-rail absolute inset-y-6 w-px')}
              style={{ left }}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.62 }
                  : { opacity: [0.36, 0.78, 0.5] }
              }
              transition={{
                duration: 6,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: softEase,
              }}
            />
          ))}
          <motion.div
            className={clsx(
              'masonix-solver-window absolute right-8 top-[5.5rem] h-[24rem] w-[38rem]',
              'rounded-xl border',
              'border-fd-primary/20 bg-fd-primary/5',
            )}
            animate={
              shouldReduceMotion
                ? { opacity: 0.28, y: 0 }
                : { opacity: [0.18, 0.36, 0.22], y: [-6, 6, -6] }
            }
            transition={{
              duration: heroLoopDuration + 1.8,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: softEase,
            }}
          />
          <motion.div
            className={clsx('masonix-solver-scan absolute inset-y-8 w-px')}
            animate={
              shouldReduceMotion
                ? { opacity: 0, x: 0, scaleY: 0.9 }
                : {
                    opacity: [0, 0, 0.92, 0.58, 0, 0],
                    x: [0, 0, 220, 500, 610, 610],
                    scaleY: [0.72, 0.72, 1, 1, 0.86, 0.86],
                  }
            }
            transition={{
              duration: heroLoopDuration,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: softEase,
              times: [0, 0.1, 0.26, 0.5, 0.66, 1],
            }}
          />
          {solverCards.map((card) => (
            <motion.div
              key={card.id}
              className={clsx('masonix-solver-card absolute')}
              style={{
                left: card.left,
                top: card.top,
                width: card.width,
                height: card.height,
              }}
              initial={getCardInitial(card, shouldReduceMotion)}
              animate={getCardAnimate()}
              transition={getCardTransition(card, shouldReduceMotion)}
            >
              <motion.div
                className={clsx(
                  'masonix-solver-card-surface absolute inset-0 overflow-hidden',
                  'rounded-lg border',
                  'border-white/15',
                )}
                style={{
                  background: getCardBackground(card),
                }}
                animate={getCardSurfaceAnimate(card, shouldReduceMotion)}
                transition={getCardSurfaceTransition(card, shouldReduceMotion)}
              >
                <div
                  className={clsx(
                    'absolute inset-0',
                    'bg-gradient-to-br from-white/30 via-transparent to-black/30',
                  )}
                />
                <div
                  className={clsx(
                    'absolute inset-x-3 top-3 grid grid-cols-3 items-start gap-1.5',
                    'opacity-75',
                  )}
                >
                  {getCardTilePattern(card).map((tileHeight, tileIndex) => (
                    <motion.span
                      key={`${card.id}-${tileHeight}-${tileIndex}`}
                      className={clsx(
                        'block w-full',
                        'rounded-sm',
                        'bg-white/35',
                      )}
                      style={{ height: tileHeight }}
                      animate={
                        shouldReduceMotion
                          ? { opacity: 0.46 }
                          : { opacity: [0.32, 0.58, 0.38] }
                      }
                      transition={{
                        delay: card.delay + tileIndex * 0.12 + 1.4,
                        duration: 5.8,
                        repeat: shouldReduceMotion ? 0 : Infinity,
                        ease: softEase,
                      }}
                    />
                  ))}
                </div>
                <div
                  className={clsx(
                    'absolute inset-x-3 bottom-3 flex flex-col gap-1.5',
                    'opacity-60',
                  )}
                >
                  {cardLineWidths.map((lineWidth, lineIndex) => (
                    <motion.span
                      key={`${card.id}-${lineWidth}`}
                      className={clsx(
                        'block h-1',
                        'rounded-full',
                        'bg-white/40',
                      )}
                      style={{ width: lineWidth }}
                      animate={
                        shouldReduceMotion
                          ? { opacity: 0.42 }
                          : { opacity: [0.28, 0.54, 0.36] }
                      }
                      transition={{
                        delay: card.delay + lineIndex * 0.16 + 1.65,
                        duration: 6.2,
                        repeat: shouldReduceMotion ? 0 : Infinity,
                        ease: softEase,
                      }}
                    />
                  ))}
                </div>
                <motion.div
                  className={clsx(
                    'absolute inset-y-0 -left-1/3 w-1/3',
                    'bg-gradient-to-r from-transparent via-white/60 to-transparent',
                    'pointer-events-none',
                  )}
                  animate={getHighlightAnimate(shouldReduceMotion)}
                  transition={getHighlightTransition(card, shouldReduceMotion)}
                />
                <motion.div
                  className={clsx(
                    'masonix-solver-measure absolute inset-y-4 w-px',
                  )}
                  animate={getMeasureAnimate(card, shouldReduceMotion)}
                  transition={getMeasureTransition(card, shouldReduceMotion)}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <motion.div
        className={clsx(
          'masonix-solver-mobile-cluster absolute top-24 -right-8 grid w-60 grid-cols-2 gap-3 md:hidden',
          'opacity-45',
        )}
        animate={
          shouldReduceMotion
            ? { y: 0, rotate: -2 }
            : { y: [-8, 8, -8], rotate: [-2.5, -1, -2.5] }
        }
        transition={{
          duration: 9,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: softEase,
        }}
      >
        {mobileSolverCards.map(([color, height], index) => (
          <motion.div
            key={`${color}-${height}`}
            className={clsx(
              'rounded-lg border shadow-xl',
              'border-white/15 shadow-fd-foreground/10',
            )}
            style={{
              background: color,
              height,
              marginTop: index % 2 === 0 ? 0 : 28,
            }}
            initial={
              shouldReduceMotion
                ? { opacity: 0.9, y: 0 }
                : { opacity: 0, y: 22 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 0.9, y: 0 }
                : {
                    opacity: [0.86, 0.86, 0.95, 0.86],
                    x: [0, 0, index % 2 === 0 ? 8 : -8, 0],
                    y: [0, 0, index % 2 === 0 ? -10 : 10, 0],
                    scale: [1, 1, 1.02, 1],
                  }
            }
            transition={{
              delay: index * 0.12,
              duration: heroLoopDuration,
              repeat: shouldReduceMotion ? 0 : Infinity,
              repeatDelay: 2.4,
              ease: softEase,
            }}
          />
        ))}
      </motion.div>
      <div
        className={clsx(
          'absolute inset-0',
          'bg-gradient-to-r from-fd-background via-fd-background/90 to-fd-background/20',
        )}
      />
      <div
        className={clsx(
          'absolute inset-x-0 bottom-0 h-32',
          'bg-gradient-to-t from-fd-background to-transparent',
        )}
      />
    </div>
  );
}
