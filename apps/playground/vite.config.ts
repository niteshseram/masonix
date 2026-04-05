import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: resolve(import.meta.dirname),
  resolve: {
    alias: {
      'masonix/virtual': resolve(import.meta.dirname, '../../src/virtual.ts'),
      masonix: resolve(import.meta.dirname, '../../src/index.ts'),
    },
  },
  server: { port: 3000, open: true },
});
