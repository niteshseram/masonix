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
  accent: string;
};

function TaskCard({ task }: { task: Task }) {
  return (
    <article
      className={clsx(
        'relative overflow-hidden',
        'p-4',
        'rounded-xl border shadow-sm',
        'border-zinc-200 bg-white text-zinc-950 shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
      )}
    >
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: task.accent }}
      />
      <div className="flex items-center justify-between gap-3 pl-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {task.area}
        </span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {task.status}
        </span>
      </div>
      <div className="pl-2 pt-2">
        <h3 className="text-sm font-semibold">{task.title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
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
    accent: '#60a5fa',
    area: 'Release',
    status: 'Ready',
  },
  {
    id: 'brand-board',
    title: 'Brand board',
    detail: 'Palette, type scale, and image direction for campaign pages.',
    accent: '#f472b6',
    area: 'Design',
    status: 'Review',
  },
  {
    id: 'research',
    title: 'Research notes',
    detail: 'Five customer interviews summarized into product opportunities.',
    accent: '#34d399',
    area: 'Research',
    status: 'New',
  },
  {
    id: 'metrics',
    title: 'Metrics review',
    detail: 'Activation moved up after the onboarding card refresh.',
    accent: '#fbbf24',
    area: 'Growth',
    status: 'Done',
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    detail: 'Small bets that improve feed performance and editorial control.',
    accent: '#a78bfa',
    area: 'Product',
    status: 'Planning',
  },
  {
    id: 'support',
    title: 'Support themes',
    detail: 'Repeated tickets grouped by install, styling, and virtualization.',
    accent: '#22d3ee',
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
