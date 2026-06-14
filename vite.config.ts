import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite-plus';
import { defineConfig } from 'vite-plus';

const ignoredPaths = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.next/**',
  '**/.source/**',
  '**/next-env.d.ts',
];

export const sharedFmtConfig: NonNullable<UserConfig['fmt']> = {
  singleQuote: true,
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  semi: true,
  trailingComma: 'all',
  sortImports: {},
  sortPackageJson: {
    sortScripts: true,
  },
  ignorePatterns: ignoredPaths,
};

export const sharedLintConfig: NonNullable<UserConfig['lint']> = {
  plugins: ['react', 'jsx-a11y', 'typescript', 'unicorn', 'import', 'nextjs'],
  categories: {
    correctness: 'warn',
    suspicious: 'warn',
  },
  env: { browser: true, es2022: true },
  settings: {
    next: {
      rootDir: 'apps/docs/',
    },
  },
  ignorePatterns: ignoredPaths,
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/prefer-tag-over-role': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'no-shadow': 'off',
    'import/no-unassigned-import': 'off',
    'unicorn/consistent-function-scoping': 'off',
  },
};

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./packages/masonix/src/test/setup.ts'],
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/*/src/test/**',
        '**/*.test.*',
        '**/*.d.ts',
        'packages/*/src/index.ts',
        'packages/*/src/virtual.ts',
      ],
    },
  },
  fmt: sharedFmtConfig,
  lint: sharedLintConfig,
  run: {
    tasks: {
      typecheck: "vp run --filter './packages/*' --filter './apps/*' tc",
    },
  },
});
