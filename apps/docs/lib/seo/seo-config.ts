import type { Metadata } from 'next';

const defaultSiteUrl = 'https://masonix.vercel.app';

export const seoSiteName = 'Masonix';
export const seoHomeTitle =
  'Masonix — React Masonry Grid & Virtualized Layouts';
export const seoDefaultDescription =
  'Build responsive React masonry grids with measured placement, SSR support, and virtualized rendering for large feeds.';
export const seoSiteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl,
);
export const seoSocialImage = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'Masonix React masonry layout library',
};

interface SeoMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  type?: 'article' | 'website';
}

export function createSeoMetadata({
  title,
  description,
  pathname,
  type = 'website',
}: SeoMetadataOptions): Metadata {
  const socialTitle = `${title} — ${seoSiteName}`;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: pathname,
      siteName: seoSiteName,
      type,
      images: [seoSocialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [seoSocialImage.url],
    },
  };
}

export function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, seoSiteUrl).toString();
}
