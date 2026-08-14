import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Lets @testing-library/react register its auto-cleanup afterEach hook;
    // without a global `afterEach` it never unmounts between tests, so a
    // second test's queries match elements the first test already rendered.
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
