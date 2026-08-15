import type { CodegenConfig } from "@graphql-codegen/cli";

// Split in three so Server Components never pull in `@apollo/client/react`:
//   schemaTypes.ts - schema-level types (Me, enums, ...), via `typescript`.
//   documents.ts   - operation types + TypedDocumentNode constants, via
//                    `typescript-operations` + `typed-document-node`. No React
//                    import - safe for both RSC and client code.
//   hooks.ts       - React hooks, via `typescript-react-apollo`. Redeclares its
//                    own operation types (separate file, so no clash with
//                    documents.ts) and is NOT re-exported by the barrel -
//                    import it directly from client components that need hooks.
// Each operation target uses `importSchemaTypesFrom` so schema-level types
// (e.g. `OnboardingStep`) aren't re-declared and collide when re-exported
// together from index.ts.
// `index.ts` re-exports schemaTypes + documents; it is hand-written on
// purpose (see index.ts) and is the one file in this folder codegen does not
// own.
const config: CodegenConfig = {
  schema:
    process.env.NEXT_PUBLIC_BFF_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  // features/<feature>/graphql for feature-owned operations, shared/graphql
  // for operations consumed by cross-cutting components (e.g. SiteHeader)
  // that don't belong to any one feature.
  documents: ["src/features/**/*.graphql", "src/shared/**/*.graphql"],
  generates: {
    "src/lib/graphql/generated/schemaTypes.ts": {
      plugins: ["typescript"],
    },
    "src/lib/graphql/generated/documents.ts": {
      plugins: ["typescript-operations", "typed-document-node"],
      config: {
        importSchemaTypesFrom: "./src/lib/graphql/generated/schemaTypes",
      },
    },
    "src/lib/graphql/generated/hooks.ts": {
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        withHooks: true,
        importSchemaTypesFrom: "./src/lib/graphql/generated/schemaTypes",
        // Apollo Client v4 moved useQuery/useLazyQuery/useSuspenseQuery and
        // their option types out of the root export into "@apollo/client/react".
        // This plugin still defaults to importing them from "@apollo/client".
        apolloReactHooksImportFrom: "@apollo/client/react",
        apolloReactCommonImportFrom: "@apollo/client/react",
      },
    },
  },
};

export default config;
