import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: ["src/graphql/schema.ts", "src/modules/**/*.typeDefs.ts"],
  generates: {
    "src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "../graphql/context.js#GraphQLContext",
        useIndexSignature: true,
        // String unions, not TS `enum`s: the backend DTOs already type these
        // fields as unions, and a real `enum` would refuse them.
        enumsAsTypes: true,
        useTypeImports: true,
        scalars: {
          Date: "string",
          DateTime: "string",
        },
      },
    },
  },
};

export default config;
