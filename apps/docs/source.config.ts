import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import type { DocsCollection } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';

export const docs: DocsCollection<typeof frontmatterSchema, typeof metaSchema> =
  defineDocs({
    dir: 'content/docs',
  });

export default defineConfig({
  plugins: [lastModified()],
});
