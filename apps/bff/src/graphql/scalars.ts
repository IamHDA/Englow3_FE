import { GraphQLScalarType, Kind } from "graphql";

/**
 * `Date.UTC` silently rolls an out-of-range field into the next one - month
 * 13 becomes next January, February 30 becomes March 2 - so a regex match
 * alone would let `2026-99-99` or `2026-02-30` through as "valid". Building
 * the instant and reading the fields back catches that rollover. It also
 * doubles as the DateTime scalar's time-of-day check (hour 24, minute 60,
 * second 60 all roll over the same way), which is why they default to zero.
 */
function isRealUtcInstant(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): boolean {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function assertDateString(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError(
      `Date scalar expects a "YYYY-MM-DD" string, got: ${String(value)}`,
    );
  }
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new TypeError(
      `Date scalar expects a "YYYY-MM-DD" string, got: ${value}`,
    );
  }
  const [, year, month, day] = match;
  if (!isRealUtcInstant(Number(year), Number(month), Number(day))) {
    throw new TypeError(
      `Date scalar got a calendar date that does not exist: ${value}`,
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

/**
 * The backend only ever sends a `java.time.Instant`, which has no offset of
 * its own - Jackson renders it with a trailing `Z` and a variable-length
 * (0-9 digit) fraction, never a numeric offset. This is chosen to match that
 * exactly rather than accept `Date.parse`'s much wider, permissive grammar:
 *
 * - a zone designator is mandatory - a bare local timestamp is ambiguous and
 *   the backend never produces one, so it is rejected rather than guessed at;
 * - `Z` is the only zone accepted - a numeric offset such as `+02:00` would
 *   pass straight through unconverted (this scalar validates, it does not
 *   shift time), silently handing a non-UTC instant to code that assumes `Z`;
 * - milliseconds are optional, 0-9 fractional digits, matching Instant's
 *   variable precision.
 */
const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/;

function assertDateTimeString(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError(
      `DateTime scalar expects "YYYY-MM-DDTHH:mm:ss[.fraction]Z", got: ${String(value)}`,
    );
  }
  const match = DATE_TIME_PATTERN.exec(value);
  if (!match) {
    throw new TypeError(
      `DateTime scalar expects "YYYY-MM-DDTHH:mm:ss[.fraction]Z", got: ${value}`,
    );
  }
  const [, year, month, day, hour, minute, second] = match;
  if (
    !isRealUtcInstant(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    )
  ) {
    throw new TypeError(
      `DateTime scalar got a timestamp that does not exist: ${value}`,
    );
  }
  return value;
}

/** Instant with a time component - what Jackson serialises a java.time.Instant to. */
export const dateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 UTC timestamp, e.g. 2026-09-06T10:15:30Z.",
  serialize: assertDateTimeString,
  parseValue: assertDateTimeString,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError("DateTime scalar literal must be a string");
    }
    return assertDateTimeString(ast.value);
  },
});
