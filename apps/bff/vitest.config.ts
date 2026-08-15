import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // graphql-js does internal `instanceof` checks (GraphQLError, GraphQLSchema).
    // Vite's default resolution can pick "graphql"'s ESM build (the "module"
    // field) for some import sites and its CJS build ("main") for others -
    // same package, two separately-defined classes, so `instanceof` fails
    // across them even though both point at the same npm package. Alias
    // forces every import of "graphql" to the exact same file.
    alias: {
      graphql: "graphql/index.js",
    },
  },
  test: {
    globals: true,
    // `tsconfig.build.json` already keeps tests out of dist/, but exclude it
    // here too - a stray dist/ from a manual `tsc -p tsconfig.json` run would
    // otherwise double the compiled JS tests alongside the TS source.
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
