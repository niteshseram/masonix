'use client';

// docs:start photo-gallery
import { clsx } from 'clsx';
import { MasonryBalanced } from 'masonix';
// docs:end photo-gallery

import { DemoFrame } from '@/components/docs/examples/docs-example-frame';

// docs:start photo-gallery
type Photo = {
  id: string;
  title: string;
  location: string;
  gradient: string;
  width: number;
  height: number;
};

function PhotoCard({ photo, width }: { photo: Photo; width: number }) {
  const renderedHeight = Math.round(width * (photo.height / photo.width));

  return (
    <article
      className={clsx(
        'relative overflow-hidden',
        'rounded-xl border',
        'border-white/20',
      )}
      style={{ height: renderedHeight, background: photo.gradient }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-white/65">
          {photo.location}
        </p>
        <h3 className="mt-1 text-base font-semibold text-white">
          {photo.title}
        </h3>
      </div>
    </article>
  );
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  return (
    <MasonryBalanced
      items={photos}
      columns={{ 0: 1, 560: 2, 860: 3 }}
      gap={14}
      defaultWidth={960}
      itemKey={(photo) => photo.id}
      getItemHeight={(photo, _itemIndex, columnWidth) =>
        Math.round(columnWidth * (photo.height / photo.width))
      }
      render={({ data, width }) => <PhotoCard photo={data} width={width} />}
    />
  );
}
// docs:end photo-gallery

const photoItems: Photo[] = [
  {
    id: 'desert-dawn',
    title: 'Desert dawn',
    location: 'Marfa, TX',
    gradient: 'linear-gradient(135deg, #fb7185, #f59e0b 55%, #fde68a)',
    width: 1200,
    height: 1480,
  },
  {
    id: 'glass-house',
    title: 'Glass house',
    location: 'Seattle, WA',
    gradient: 'linear-gradient(135deg, #0f766e, #22d3ee 48%, #ecfeff)',
    width: 1400,
    height: 960,
  },
  {
    id: 'blue-hour',
    title: 'Blue hour',
    location: 'Reykjavik, IS',
    gradient: 'linear-gradient(135deg, #1d4ed8, #818cf8 55%, #e0e7ff)',
    width: 1100,
    height: 1360,
  },
  {
    id: 'courtyard',
    title: 'Courtyard',
    location: 'Lisbon, PT',
    gradient: 'linear-gradient(135deg, #065f46, #34d399 52%, #fef3c7)',
    width: 1000,
    height: 1180,
  },
  {
    id: 'studio-wall',
    title: 'Studio wall',
    location: 'Brooklyn, NY',
    gradient: 'linear-gradient(135deg, #7c2d12, #f97316 48%, #fed7aa)',
    width: 1500,
    height: 1040,
  },
  {
    id: 'quiet-arch',
    title: 'Quiet arch',
    location: 'Kyoto, JP',
    gradient: 'linear-gradient(135deg, #581c87, #c084fc 48%, #f5d0fe)',
    width: 980,
    height: 1260,
  },
  {
    id: 'sea-path',
    title: 'Sea path',
    location: 'Busan, KR',
    gradient: 'linear-gradient(135deg, #0369a1, #38bdf8 52%, #cffafe)',
    width: 1320,
    height: 920,
  },
  {
    id: 'green-room',
    title: 'Green room',
    location: 'Portland, OR',
    gradient: 'linear-gradient(135deg, #166534, #86efac 54%, #f0fdf4)',
    width: 920,
    height: 1220,
  },
];

export function PhotoGalleryDemo() {
  return (
    <DemoFrame>
      <PhotoGallery photos={photoItems} />
    </DemoFrame>
  );
}
