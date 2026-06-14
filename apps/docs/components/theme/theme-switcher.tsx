'use client';

import { clsx } from 'clsx';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';

export function ThemeSwitcher() {
  return (
    <ThemeSwitch
      className={clsx(
        'shrink-0',
        'border-fd-border bg-fd-background/70 text-fd-muted-foreground',
        'transition-colors',
        'hover:bg-fd-accent/60',
      )}
    />
  );
}
