import type { CodegenConfig } from "@graphql-codegen/cli";

// Schema is introspected from the running BFF. Start it first:
//   pnpm dev:bff
const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  documents: "src/**/*.graphql",
  ignoreNoDocuments: true,
  generates: {
    "src/lib/graphql/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
    },
  },
};

export default config;
