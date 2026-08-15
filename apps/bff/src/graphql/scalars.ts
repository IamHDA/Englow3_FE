import { GraphQLScalarType, Kind } from "graphql";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertDateString(value: unknown): string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new TypeError(
      `Date scalar expects a "YYYY-MM-DD" string, got: ${String(value)}`,
    );
  }
  return value;
}

/** Calendar date, no time component - matches the backend's `format: date` fields exactly. */
export const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Calendar date in YYYY-MM-DD format, no time component.",
  serialize: assertDateString,
  parseValue: assertDateString,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError("Date scalar literal must be a string");
    }
    return assertDateString(ast.value);
  },
});
