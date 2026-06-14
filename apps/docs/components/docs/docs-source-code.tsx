import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

interface DocsSourceCodeProps {
  file: string;
  snippet: string;
  title?: string;
}

const EXAMPLE_SOURCE_DIR = join(process.cwd(), 'components/docs/examples');

export async function DocsSourceCode({
  file,
  snippet,
  title,
}: DocsSourceCodeProps) {
  const code = await readFile(join(EXAMPLE_SOURCE_DIR, basename(file)), 'utf8');

  return (
    <ServerCodeBlock
      code={extractCodeSnippet(code, snippet)}
      lang="tsx"
      codeblock={title ? { title } : undefined}
    />
  );
}

function extractCodeSnippet(code: string, snippet: string) {
  const startMarker = `// docs:start ${snippet}`;
  const endMarker = `// docs:end ${snippet}`;
  const snippets: string[] = [];
  let searchIndex = 0;

  while (searchIndex < code.length) {
    const startIndex = code.indexOf(startMarker, searchIndex);
    if (startIndex === -1) {
      break;
    }

    const contentStartIndex = startIndex + startMarker.length;
    const endIndex = code.indexOf(endMarker, contentStartIndex);
    if (endIndex === -1) {
      break;
    }

    snippets.push(code.slice(contentStartIndex, endIndex).trim());
    searchIndex = endIndex + endMarker.length;
  }

  if (snippets.length === 0) {
    return code.trim();
  }

  return snippets.join('\n\n');
}
