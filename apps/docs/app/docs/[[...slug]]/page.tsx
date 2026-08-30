import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents, { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { source } from '@/lib/docs-source';
import { createSeoMetadata, seoDefaultDescription } from '@/lib/seo/seo-config';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug ?? ['guide', 'getting-started']);
  if (!page) {
    notFound();
  }

  return createSeoMetadata({
    title: page.data.title,
    description: page.data.description ?? seoDefaultDescription,
    pathname: page.url,
    type: 'article',
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug ?? ['guide', 'getting-started']);
  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            a: createRelativeLink(source, page),
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}
