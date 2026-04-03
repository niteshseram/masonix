import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // -------------------------------------------------------------------------
  // Library packaging — tsdown (via `vp pack`)
  // -------------------------------------------------------------------------
  pack: {
    entry: {
      index: "src/index.ts",
      virtual: "src/virtual.ts",
    },
    format: ["esm", "cjs"],
    dts: { tsconfig: "./tsconfig.build.json" },
    sourcemap: true,
    deps: {
      neverBundle: ["react", "react-dom", "react/jsx-runtime", /^react-dom\//],
    },
    banner: { js: '"use client";' },
    outDir: "dist",
    clean: true,
  },

  // -------------------------------------------------------------------------
  // Tests — Vitest (via `vp test`)
  // -------------------------------------------------------------------------
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "**/*.test.*", "**/*.d.ts", "src/index.ts", "src/virtual.ts"],
    },
  },

  // -------------------------------------------------------------------------
  // Linting — Oxlint (via `vp lint`)
  // -------------------------------------------------------------------------
  lint: {
    plugins: ["react", "typescript"],
    env: { browser: true, es2022: true },
    ignorePatterns: ["dist/**", "node_modules/**", "apps/**"],
    rules: {
      "no-unused-vars": "error",
      "no-console": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // -------------------------------------------------------------------------
  // Formatting — Oxfmt (via `vp fmt`)
  // -------------------------------------------------------------------------
  fmt: {
    include: ["src/"],
  },
});
