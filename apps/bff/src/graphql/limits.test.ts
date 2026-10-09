import { buildSchema, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";

import { queryLimitRule } from "./limits.js";

const schema = buildSchema(`
  type Node { id: ID!, child: Node }
  type Query { node: Node, health: String }
`);

const limits = { maxDepth: 3, maxRootFields: 2, maxAliases: 2 };
const errorsFor = (query: string) =>
  validate(schema, parse(query), [queryLimitRule(limits)]).map(
    (e) => e.message,
  );

describe("queryLimitRule", () => {
  it("lets an ordinary query through", () => {
    expect(errorsFor("{ node { child { id } } health }")).toEqual([]);
  });

  it("refuses a query nested past the limit, also through fragments", () => {
    expect(errorsFor("{ node { child { child { id } } } }")).toEqual([
      "Query is nested deeper than 3 levels.",
    ]);
    expect(
      errorsFor(
        "fragment F on Node { child { child { id } } } { node { ...F } }",
      ),
    ).toHaveLength(1);
  });

  it("refuses one request fanned out into many root fields or aliases", () => {
    expect(errorsFor("{ a: health b: health c: health }")).toEqual([
      "Query asks for more than 2 root fields.",
      "Query uses more than 2 aliases.",
    ]);
  });

  it("does not loop on a fragment that spreads itself", () => {
    expect(() =>
      errorsFor("fragment F on Node { child { ...F } } { node { ...F } }"),
    ).not.toThrow();
  });
});
