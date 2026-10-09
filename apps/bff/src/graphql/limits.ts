import {
  GraphQLError,
  Kind,
  type ASTVisitor,
  type FragmentDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
} from "graphql";

/**
 * Bounds on the shape of a query, checked before anything runs.
 *
 * Every field here becomes one or more calls to the backend, so a document
 * that repeats a field under a hundred aliases, or nests as deep as the schema
 * allows, turns one HTTP request into a hundred backend requests. The rate
 * limiter counts the first and never sees the rest.
 *
 * The numbers sit well above what the web app sends (its deepest operation is
 * seven levels, with at most two root fields and no aliases), so they only
 * ever refuse a document nobody here wrote. A refusal is an ordinary
 * validation error (GRAPHQL_VALIDATION_FAILED), reported before any resolver
 * runs.
 */
export const QUERY_LIMITS = { maxDepth: 12, maxRootFields: 10, maxAliases: 20 };

function depthOf(
  selectionSet: SelectionSetNode | undefined,
  fragments: Map<string, FragmentDefinitionNode>,
  visiting: Set<string>,
): number {
  if (!selectionSet) return 0;
  let deepest = 0;
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const below = selection.selectionSet
        ? depthOf(selection.selectionSet, fragments, visiting)
        : 0;
      deepest = Math.max(deepest, 1 + below);
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      deepest = Math.max(
        deepest,
        depthOf(selection.selectionSet, fragments, visiting),
      );
    } else {
      const name = selection.name.value;
      // A fragment that spreads itself is rejected by the standard rules; this
      // only has to avoid looping while it gets there.
      if (visiting.has(name)) continue;
      const fragment = fragments.get(name);
      if (!fragment) continue;
      visiting.add(name);
      deepest = Math.max(
        deepest,
        depthOf(fragment.selectionSet, fragments, visiting),
      );
      visiting.delete(name);
    }
  }
  return deepest;
}

export function queryLimitRule(limits = QUERY_LIMITS) {
  return (context: ValidationContext): ASTVisitor => {
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const definition of context.getDocument().definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(definition.name.value, definition);
      }
    }
    let aliases = 0;
    return {
      Field(node) {
        if (node.alias && ++aliases === limits.maxAliases + 1) {
          context.reportError(
            new GraphQLError(
              `Query uses more than ${limits.maxAliases} aliases.`,
            ),
          );
        }
      },
      OperationDefinition(node) {
        // Introspection (`__schema`, `__type`) is a tool asking for the shape
        // of the schema, and the standard introspection query is nested deeper
        // than any real screen. It is switched off where it matters
        // (introspection is off in production), so exempting it here only keeps
        // code generation working against a local server.
        if (
          node.selectionSet.selections.every(
            (selection) =>
              selection.kind === Kind.FIELD &&
              selection.name.value.startsWith("__"),
          )
        ) {
          return;
        }
        if (node.selectionSet.selections.length > limits.maxRootFields) {
          context.reportError(
            new GraphQLError(
              `Query asks for more than ${limits.maxRootFields} root fields.`,
            ),
          );
        }
        if (
          depthOf(node.selectionSet, fragments, new Set()) > limits.maxDepth
        ) {
          context.reportError(
            new GraphQLError(
              `Query is nested deeper than ${limits.maxDepth} levels.`,
            ),
          );
        }
      },
    };
  };
}
