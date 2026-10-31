import { describe, expect, it } from "vitest";

import { levelRank, sortLessons, type OrderableLesson } from "./lessonOrder";

const lesson = (
  title: string,
  level: string | null,
  extra: Partial<OrderableLesson> = {},
): OrderableLesson => ({
  title,
  targetLevel: level,
  sentenceCount: 6,
  completedSentenceCount: 0,
  ...extra,
});

const titles = (lessons: OrderableLesson[]) => lessons.map((l) => l.title);

describe("levelRank", () => {
  it("puts a lesson with no level after every real one", () => {
    expect(levelRank("A1")).toBeLessThan(levelRank("C1"));
    expect(levelRank(null)).toBeGreaterThan(levelRank("C2"));
  });
});

describe("sortLessons", () => {
  const library = [
    lesson("Zebra crossing", "B2"),
    lesson("Part 10", "A1"),
    lesson("Part 2", "A1"),
    lesson("apple", "A1"),
    lesson("Unlevelled", null),
    lesson("Banking", "C1"),
  ];

  // The library once showed lessons in alphabetical order by title, which
  // scatters A1 and C1 through the whole list.
  it("by default puts easy before hard, then names them the way a person counts", () => {
    expect(titles(sortLessons(library, "recent"))).toEqual([
      "apple",
      "Part 2",
      "Part 10",
      "Zebra crossing",
      "Banking",
      "Unlevelled",
    ]);
  });

  it("puts what the learner practised last first, then the rest in the default order", () => {
    const sorted = sortLessons(
      [
        lesson("Old", "A1", { lastPractisedAt: "2026-09-01T10:00:00Z" }),
        lesson("Never", "A1"),
        lesson("Recent", "C1", { lastPractisedAt: "2026-10-08T10:00:00Z" }),
      ],
      "recent",
    );

    expect(titles(sorted)).toEqual(["Recent", "Old", "Never"]);
  });

  it("orders by difficulty, shorter lessons first within a level", () => {
    const sorted = sortLessons(
      [
        lesson("Long", "A2", { sentenceCount: 9 }),
        lesson("Short", "A2", { sentenceCount: 4 }),
        lesson("Easy", "A1", { sentenceCount: 12 }),
      ],
      "difficulty",
    );

    expect(titles(sorted)).toEqual(["Easy", "Short", "Long"]);
  });

  it("puts the most progressed first", () => {
    const sorted = sortLessons(
      [
        lesson("Half", "A1", { completedSentenceCount: 3 }),
        lesson("Done", "B1", { completedSentenceCount: 6 }),
        lesson("Untouched", "A1"),
      ],
      "progress",
    );

    expect(titles(sorted)).toEqual(["Done", "Half", "Untouched"]);
  });

  it("puts the newest lessons first, and ties by level then name", () => {
    const sorted = sortLessons(
      [
        lesson("Old", "A1", { publishedAt: "2026-09-01T00:00:00Z" }),
        lesson("Batch B", "B1", { publishedAt: "2026-10-09T00:00:00Z" }),
        lesson("Batch A", "A1", { publishedAt: "2026-10-09T00:00:00Z" }),
        lesson("Undated", "A1"),
      ],
      "newest",
    );

    expect(titles(sorted)).toEqual(["Batch A", "Batch B", "Old", "Undated"]);
  });

  it("does not reorder the list it was given", () => {
    const input = [lesson("b", "B1"), lesson("a", "A1")];

    sortLessons(input, "difficulty");

    expect(titles(input)).toEqual(["b", "a"]);
  });
});
