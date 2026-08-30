'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

const installCommand = 'npm install masonix';

export function HomeInstallCommand({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyCommand}
      className={clsx(
        'group inline-flex items-center gap-3',
        compact ? 'px-3 py-2.5' : 'px-3.5 py-2.5',
        'rounded-md border',
        'font-mono text-xs',
        'border-fd-border bg-fd-background text-fd-muted-foreground',
        'cursor-pointer',
        'transition-colors',
        'hover:bg-fd-accent/40 hover:text-fd-foreground',
      )}
      aria-label="Copy npm install command"
    >
      <span aria-hidden="true" className="text-fd-muted-foreground">
        $
      </span>
      <span>{installCommand}</span>
      <span
        className={clsx(
          'min-w-10',
          'text-right',
          copied
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-fd-muted-foreground',
        )}
      >
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}
