import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function checkReleaseNotes({
  changedFiles,
  changesets,
  previousVersion,
  currentVersion,
  changelog,
}) {
  if (currentVersion !== previousVersion) {
    if (
      !changedFiles.includes('packages/masonix/CHANGELOG.md') ||
      !changelog
        .split('\n')
        .some((line) => line.trim() === `## ${currentVersion}`)
    ) {
      return 'The package version changed without a matching package CHANGELOG.md heading.';
    }
    return null;
  }
  const runtimeChanged = changedFiles.some(
    (filename) =>
      (filename.startsWith('packages/masonix/src/') &&
        !filename.includes('/__tests__/')) ||
      filename === 'packages/masonix/package.json' ||
      filename === 'packages/masonix/vite.config.ts',
  );
  if (!runtimeChanged) {
    return null;
  }
  const hasReleaseNote = changesets.some((contents) => {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(contents)?.[1] ?? '';
    return /^\s*["']?masonix["']?:\s*(patch|minor|major)\s*$/m.test(
      frontmatter,
    );
  });
  return hasReleaseNote
    ? null
    : 'Package changes need a new or updated Masonix changeset. Run pnpm exec changeset.';
}

function main() {
  const base = process.argv[2];
  if (!base || !/^[a-f0-9]{40,64}$/i.test(base)) {
    throw new Error('Pass the base commit SHA.');
  }
  const changedFiles = execFileSync(
    'git',
    ['diff', '--name-only', `${base}...HEAD`],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  const packagePath = 'packages/masonix/package.json';
  const previousVersion = JSON.parse(
    execFileSync('git', ['show', `${base}:${packagePath}`], {
      encoding: 'utf8',
    }),
  ).version;
  const currentVersion = JSON.parse(readFileSync(packagePath, 'utf8')).version;
  const changesets = changedFiles
    .filter(
      (filename) =>
        filename.startsWith('.changeset/') &&
        filename.endsWith('.md') &&
        existsSync(filename),
    )
    .map((filename) => readFileSync(filename, 'utf8'));
  const error = checkReleaseNotes({
    changedFiles,
    changesets,
    previousVersion,
    currentVersion,
    changelog: readFileSync('packages/masonix/CHANGELOG.md', 'utf8'),
  });
  if (error) {
    throw new Error(error);
  }
  process.stdout.write('Release notes check passed.\n');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
