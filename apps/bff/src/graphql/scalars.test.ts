import { describe, expect, it } from "vitest";

import { dateScalar, dateTimeScalar } from "./scalars.js";

describe("Date scalar", () => {
  it.each(["2026-01-01", "2026-12-31", "2024-02-29"])(
    "accepts a real calendar date: %s",
    (value) => {
      expect(dateScalar.serialize(value)).toBe(value);
    },
  );

  it.each([
    [
      "2026-99-99",
      "the doc's own example of nonsense that a regex alone lets through",
    ],
    ["2026-02-30", "February never has 30 days"],
    ["2023-02-29", "2023 is not a leap year"],
    ["2026-04-31", "April has 30 days"],
    ["2026-13-01", "there is no month 13"],
    ["2026-1-1", "not zero-padded"],
    ["09/06/2026", "not YYYY-MM-DD at all"],
  ])("rejects %s (%s)", (value) => {
    expect(() => dateScalar.serialize(value)).toThrow();
  });

  it("rejects a non-string value", () => {
    expect(() => dateScalar.serialize(20260101)).toThrow();
  });
});

describe("DateTime scalar", () => {
  it.each([
    "2026-09-06T10:15:30Z",
    "2026-09-06T00:00:00Z",
    "2026-09-06T10:15:30.123Z",
    "2026-09-06T10:15:30.123456789Z",
  ])("accepts %s", (value) => {
    expect(dateTimeScalar.serialize(value)).toBe(value);
  });

  it.each([
    [
      "2026-09-06T10:15:30",
      "no zone designator - ambiguous, the backend never sends this",
    ],
    [
      "2026-09-06T10:15:30+02:00",
      "a numeric offset - this scalar only accepts Z",
    ],
    ["2026-09-06T10:15:30+00:00", "still an offset, even at zero"],
    ["2026-13-06T10:15:30Z", "no month 13"],
    ["2026-09-06T24:00:00Z", "hour 24 does not exist"],
    ["2026-09-06T10:60:30Z", "minute 60 does not exist"],
    ["2026-09-06T10:15:60Z", "second 60 does not exist"],
    [
      "2026/09/06 10:15:30",
      "not ISO-8601 at all, but Date.parse used to accept it",
    ],
    [
      "September 6, 2026",
      "a format Date.parse is permissive about but the contract is not",
    ],
  ])("rejects %s (%s)", (value) => {
    expect(() => dateTimeScalar.serialize(value)).toThrow();
  });

  it("rejects a non-string value", () => {
    expect(() => dateTimeScalar.serialize(Date.now())).toThrow();
  });
});
