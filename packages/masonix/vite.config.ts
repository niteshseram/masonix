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
});
