// Patches a known @graphql-codegen/typescript-react-apollo@4.4.2 bug: it
// emits `// @ts-ignore` before the *first* of the two useXSuspenseQuery
// overloads it generates, but under @apollo/client v4's types the real
// TS2394 "overload incompatible with implementation" mismatch is on the
// *second* one. Moves the suppression down one line.
//
// This can't be done via codegen's own `hooks.beforeOneFileWrite` - adding
// any `hooks` entry to codegen.ts breaks plugin loading on Windows with
// "Only URLs with a scheme in: file, data, and node are supported by the
// default ESM loader" - so it runs as a separate step after `graphql-codegen`
// in the `codegen` npm script instead.
//
// Delete this script (and its call in package.json) once the plugin fixes
// the placement upstream.
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/lib/graphql/generated/hooks.ts";
const content = readFileSync(path, "utf8");

const fixed = content
  .replace(
    /\/\/ @ts-ignore\n(export function use\w+SuspenseQuery\(baseOptions\?: ApolloReactHooks\.SuspenseQueryHookOptions[^\n]*\n)/g,
    "$1",
  )
  .replace(
    // `;$` anchors to the overload *declaration* line only - the
    // implementation right below it starts identically but ends in `) {`,
    // and it must not get the same suppression (it isn't the error site,
    // and an unused directive is itself a compile error). The negative
    // lookbehind makes this safe to run twice: without it, a second run
    // would stack a second `@ts-expect-error` above the first, which is
    // itself unused (its "next line" is a comment, not the overload).
    /(?<!\/\/ @ts-expect-error - see scripts\/fixSuspenseOverload\.mjs\n)^(export function use\w+SuspenseQuery\(baseOptions\?: ApolloReactHooks\.SkipToken \|.*;)$/gm,
    "// @ts-expect-error - see scripts/fixSuspenseOverload.mjs\n$1",
  );

if (fixed !== content) {
  writeFileSync(path, fixed);
  console.log(`fixSuspenseOverload: patched ${path}`);
}
