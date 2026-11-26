import { randomUUID } from "@/lib/uuid";

import { parseReport, wordCount } from "../report";

const report = {
  overall: 6.5,
  criteria: [
    { key: "TASK_RESPONSE", score: 6, feedback: "ok" },
    { key: "COHERENCE_COHESION", score: 7, feedback: "ok" },
    { key: "LEXICAL_RESOURCE", score: 6.5, feedback: "ok" },
    { key: "GRAMMATICAL_RANGE", score: 6, feedback: "ok" },
  ],
  summary: "Good",
  strengths: ["clear"],
  improvements: ["linking"],
};

describe("parseReport", () => {
  it("accepts a well-formed report", () => {
    expect(parseReport(JSON.stringify(report))?.overall).toBe(6.5);
  });

  it("accepts the learner view with criterion scores redacted", () => {
    const hidden = {
      ...report,
      scoresHidden: true,
      criteria: report.criteria.map(({ key, feedback }) => ({ key, feedback })),
    };
    expect(parseReport(JSON.stringify(hidden))).not.toBeNull();
  });

  it("rejects malformed or out-of-range reports instead of rendering garbage", () => {
    expect(parseReport("not json")).toBeNull();
    expect(parseReport(JSON.stringify({ ...report, overall: 12 }))).toBeNull();
    expect(
      parseReport(
        JSON.stringify({ ...report, criteria: report.criteria.slice(0, 3) }),
      ),
    ).toBeNull();
    expect(parseReport(null)).toBeNull();
  });
});

describe("wordCount", () => {
  it("counts words across any whitespace", () => {
    expect(wordCount("  one two\nthree\tfour ")).toBe(4);
    expect(wordCount("   ")).toBe(0);
  });
});

describe("randomUUID", () => {
  it("produces version 4 UUIDs", () => {
    const id = randomUUID();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(randomUUID()).not.toBe(id);
  });
});
