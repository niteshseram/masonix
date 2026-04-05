import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [react()],
  pack: {
    entry: {
      index: 'src/index.ts',
      virtual: 'src/virtual.ts',
    },
    format: ['esm', 'cjs'],
    dts: { tsconfig: './tsconfig.build.json' },
    sourcemap: true,
    deps: {
      neverBundle: ['react', 'react-dom', 'react/jsx-runtime', /^react-dom\//],
    },
    banner: { js: '"use client";' },
    outDir: 'dist',
    clean: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        '**/*.test.*',
        '**/*.d.ts',
        'src/index.ts',
        'src/virtual.ts',
      ],
    },
  },
  lint: {
    plugins: ['react', 'jsx-a11y', 'typescript', 'unicorn', 'import'],
    categories: {
      correctness: 'warn',
      suspicious: 'warn',
    },
    env: { browser: true, es2022: true },
    ignorePatterns: ['dist/**', 'node_modules/**', 'apps/**'],
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
  },
  fmt: {
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
    include: ['src/'],
  },
});
