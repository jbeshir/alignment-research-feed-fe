/// <reference types="vitest/config" />
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy({
      getLoadContext: ({ context }) =>
        ({
          ...context,
          authCache: {},
        }) as unknown as AppLoadContext,
    }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    include: ["app/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "build"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./test/coverage",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "build/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/test/**",
        "app/entry.*.tsx",
        "app/root.tsx",
      ],
      thresholds: {
        // TODO: Increase thresholds as test coverage improves
        // Current coverage is ~5% - set thresholds just below to allow CI to pass
        // Target: 60% coverage for all metrics
        statements: 4,
        branches: 10,
        functions: 4,
        lines: 4,
      },
    },
  },
});
