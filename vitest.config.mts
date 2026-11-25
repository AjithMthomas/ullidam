import path from "node:path";
import { defineConfig } from "vitest/config";

// Security-critical unit tests only (docs/specs/portal.md section 7).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      // "server-only" throws outside React Server Components; tests run on the server side anyway.
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
