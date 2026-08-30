'use client';

// docs:start basic-layout
import { clsx } from 'clsx';
import { Masonry } from 'masonix';
// docs:end basic-layout

import { DemoFrame } from '@/components/docs/examples/docs-example-frame';

// docs:start basic-layout
type Task = {
  id: string;
  title: string;
  detail: string;
  area: string;
  status: string;
};

function TaskCard({ task }: { task: Task }) {
  return (
    <article
      className={clsx(
        'min-w-0',
        'p-5',
        'rounded-lg border',
        'border-zinc-200/80 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
      )}
    >
      <div
        className={clsx(
          'flex items-center justify-between gap-3',
          'pb-4',
          'border-b',
          'border-zinc-200/70 dark:border-zinc-800',
        )}
      >
        <span
          className={clsx(
            'font-mono text-[11px] font-medium uppercase tracking-[0.14em]',
            'text-zinc-500 dark:text-zinc-400',
          )}
        >
          {task.area}
        </span>
        <span
          className={clsx(
            'flex items-center gap-1.5',
            'text-xs',
            'text-zinc-500 dark:text-zinc-400',
          )}
        >
          <span
            aria-hidden="true"
            className={clsx(
              'size-1.5 shrink-0',
              'rounded-full',
              'bg-zinc-400 dark:bg-zinc-600',
            )}
          />
          {task.status}
        </span>
      </div>
      <div className="pt-4">
        <h3 className="text-base font-semibold leading-6">{task.title}</h3>
        <p
          className={clsx(
            'mt-2',
            'text-sm leading-6',
            'text-zinc-600 dark:text-zinc-400',
          )}
        >
          {task.detail}
        </p>
      </div>
    </article>
  );
}

export function TaskGrid({ tasks }: { tasks: Task[] }) {
  return (
    <Masonry
      items={tasks}
      columnWidth={190}
      maxColumns={3}
      gap={14}
      itemKey={(task) => task.id}
      render={({ data }) => <TaskCard task={data} />}
    />
  );
}
// docs:end basic-layout

const basicItems: Task[] = [
  {
    id: 'launch-plan',
    title: 'Launch plan',
    detail: 'Milestones, owners, and final QA notes for the public release.',
    area: 'Release',
    status: 'Ready',
  },
  {
    id: 'brand-board',
    title: 'Brand board',
    detail: 'Palette, type scale, and image direction for campaign pages.',
    area: 'Design',
    status: 'Review',
  },
  {
    id: 'research',
    title: 'Research notes',
    detail: 'Five customer interviews summarized into product opportunities.',
    area: 'Research',
    status: 'New',
  },
  {
    id: 'metrics',
    title: 'Metrics review',
    detail: 'Activation moved up after the onboarding card refresh.',
    area: 'Growth',
    status: 'Done',
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    detail: 'Small bets that improve feed performance and editorial control.',
    area: 'Product',
    status: 'Planning',
  },
  {
    id: 'support',
    title: 'Support themes',
    detail: 'Repeated tickets grouped by install, styling, and virtualization.',
    area: 'Support',
    status: 'Open',
  },
];

export function BasicLayoutDemo() {
  return (
    <DemoFrame>
      <TaskGrid tasks={basicItems} />
    </DemoFrame>
  );
}

export function ResponsiveMasonryDemo() {
  return <BasicLayoutDemo />;
}
