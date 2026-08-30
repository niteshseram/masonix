'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type HomeRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function HomeReveal({
  children,
  className,
  delay = 0,
}: HomeRevealProps) {
  const shouldReduceMotion = useReducedMotion() === true;

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        delay: shouldReduceMotion ? 0 : delay,
        duration: shouldReduceMotion ? 0 : 0.52,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
