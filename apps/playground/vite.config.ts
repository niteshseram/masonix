import { resolve } from "node:path";
import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: resolve(import.meta.dirname),
  resolve: {
    alias: {
      "masonix/virtual": resolve(import.meta.dirname, "../../src/virtual.ts"),
      masonix: resolve(import.meta.dirname, "../../src/index.ts"),
    },
  },
  server: { port: 3000, open: true },
});
