import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./tests/setup/global-server.ts"],
    include: ["src/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
    hookTimeout: 60_000,
    testTimeout: 20_000,
  },
});
