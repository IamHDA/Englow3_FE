// The one hand-written file in this folder - everything else is codegen
// output (see apps/web/codegen.ts). Re-exports schema types + operation
// documents under one import path so callers can
// `import { ... } from "@/lib/graphql/generated"` without knowing they're
// split across schemaTypes.ts and documents.ts.
//
// hooks.ts is deliberately NOT re-exported here: it imports
// "@apollo/client/react", which breaks under Next's `react-server` bundling
// condition. Server Components must only ever import from this barrel;
// Client Components that need hooks import "@/lib/graphql/generated/hooks"
// directly.
export * from "./schemaTypes";
export * from "./documents";
