import { describe, expect, it } from "vitest";

import { instructionsPreview, splitInstructions } from "./TaskInstructions";

const task = [
  "The table below shows energy use.",
  "",
  "Year | Gas | Solar",
  "2000 | 45% | 5%",
  "2020 | 38% | 23%",
  "",
  "Write at least 150 words.",
].join("\n");

describe("splitInstructions", () => {
  it("turns a run of piped lines into one table between the prose", () => {
    const blocks = splitInstructions(task);

    expect(blocks.map((b) => b.kind)).toEqual(["text", "table", "text"]);
    expect(blocks[1]).toEqual({
      kind: "table",
      rows: [
        ["Year", "Gas", "Solar"],
        ["2000", "45%", "5%"],
        ["2020", "38%", "23%"],
      ],
    });
  });

  it("skips a markdown separator row and leading or trailing pipes", () => {
    const blocks = splitInstructions("| A | B |\n|---|---|\n| 1 | 2 |");

    expect(blocks).toEqual([
      {
        kind: "table",
        rows: [
          ["A", "B"],
          ["1", "2"],
        ],
      },
    ]);
  });

  it("leaves a single piped line as prose", () => {
    expect(splitInstructions("Choose A | B or C.")).toEqual([
      { kind: "text", text: "Choose A | B or C." },
    ]);
  });
});

describe("instructionsPreview", () => {
  it("drops the table so a card shows only the prompt", () => {
    expect(instructionsPreview(task)).toBe(
      "The table below shows energy use. Write at least 150 words.",
    );
  });
});
