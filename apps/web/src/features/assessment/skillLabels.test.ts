import { describe, expect, it } from "vitest";

import { skillLabel, taskTypeLabel } from "./types";

describe("skillLabel", () => {
  it("names a skill in the language on screen instead of printing the enum", () => {
    expect(skillLabel("WRITING", true)).toBe("Viết");
    expect(skillLabel("WRITING", false)).toBe("Writing");
    expect(skillLabel("SPEAKING", true)).toBe("Nói");
    expect(skillLabel("SPEAKING", false)).toBe("Speaking");
  });

  it("leaves a skill it does not know as it came", () => {
    expect(skillLabel("LISTENING", true)).toBe("LISTENING");
  });
});

describe("taskTypeLabel", () => {
  it("turns the enum into the name IELTS gives it", () => {
    expect(taskTypeLabel("TASK_1")).toBe("Task 1");
    expect(taskTypeLabel("PART_3")).toBe("Part 3");
  });
});
