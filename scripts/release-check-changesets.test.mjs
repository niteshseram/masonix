import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkReleaseNotes } from './release-check-changesets.mjs';

const defaults = {
  changedFiles: ['packages/masonix/src/types.ts'],
  changesets: [],
  previousVersion: '1.1.0',
  currentVersion: '1.1.0',
  changelog: '## 1.1.0\n',
};

test('requires a package changeset for runtime changes but not documentation or tests', () => {
  assert.match(checkReleaseNotes(defaults), /changeset/);
  assert.equal(
    checkReleaseNotes({
      ...defaults,
      changedFiles: [
        'apps/docs/content/guide.mdx',
        'packages/masonix/src/__tests__/core.test.ts',
      ],
    }),
    null,
  );
  assert.equal(
    checkReleaseNotes({
      ...defaults,
      changesets: ['---\n"masonix": minor\n---\nAdd feed controls.\n'],
    }),
    null,
  );
  assert.match(
    checkReleaseNotes({
      ...defaults,
      changesets: ['---\n"another-package": patch\n---\nmasonix: patch\n'],
    }),
    /changeset/,
  );
});

test('release version changes require a matching package changelog heading', () => {
  assert.match(
    checkReleaseNotes({ ...defaults, currentVersion: '1.2.0' }),
    /CHANGELOG/,
  );
  assert.equal(
    checkReleaseNotes({
      ...defaults,
      currentVersion: '1.2.0',
      changedFiles: [...defaults.changedFiles, 'packages/masonix/CHANGELOG.md'],
      changelog: '## 1.2.0\n\n### Minor Changes\n',
    }),
    null,
  );
});
