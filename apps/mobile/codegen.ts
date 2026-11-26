import type { CodegenConfig } from "@graphql-codegen/cli";

// The schema is read from the BFF's source, so codegen needs no running server
// and CI can check the generated file against the SDL it was built from.
//
// Operations: the web app's feature documents are the shared contract with the
// BFF, and mobile reuses them rather than keeping a drifting copy. Operations
// only mobile needs live under src/. Operation names are global across both
// sets; codegen refuses a duplicate, which is the guard against a clash.
//
// Schema types and operations are generated into separate files, as on the
// web: typescript-operations v6 declares the input types and enums an
// operation uses, which collide with the schema's own copies in one file.
// `index.ts` (hand-written) re-exports both.
const SCALARS = { Date: "string", DateTime: "string" } as const;

const config: CodegenConfig = {
  schema: [
    "../bff/src/graphql/schema.ts",
    "../bff/src/modules/**/*.typeDefs.ts",
  ],
  documents: [
    "../web/src/features/**/*.graphql",
    "../web/src/shared/**/*.graphql",
    "src/**/*.graphql",
  ],
  generates: {
    "src/lib/graphql/generated/schemaTypes.ts": {
      plugins: ["typescript"],
      config: { namingConvention: { enumValues: "keep" }, scalars: SCALARS },
    },
    "src/lib/graphql/generated/graphql.ts": {
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        importSchemaTypesFrom: "./src/lib/graphql/generated/schemaTypes",
        scalars: SCALARS,
        withHooks: true,
        // Plain AST objects, so no graphql-tag at runtime.
        documentMode: "documentNode",
        apolloReactHooksImportFrom: "@apollo/client/react",
        apolloReactCommonImportFrom: "@apollo/client/react",
      },
    },
  },
};

export default config;
