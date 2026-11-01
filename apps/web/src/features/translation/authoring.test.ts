import { describe, expect, it } from "vitest";

import { parsePasted, slugify } from "./authoring";

describe("slugify", () => {
  it("drops Vietnamese tones and đ, and hyphenates", () => {
    expect(slugify("Cuộc sống hằng ngày - Đi chợ")).toBe(
      "cuoc-song-hang-ngay-di-cho",
    );
  });

  it("never starts or ends with a hyphen", () => {
    expect(slugify("  Du lịch!  ")).toBe("du-lich");
  });
});

describe("parsePasted", () => {
  it("reads one sentence per line, split by a bar or a tab", () => {
    expect(
      parsePasted(
        "Trời đang mưa. | It is raining.\nTôi đói.\tI am hungry.\tA note",
      ),
    ).toEqual([
      { sourceVi: "Trời đang mưa.", referenceEn: "It is raining.", notes: "" },
      { sourceVi: "Tôi đói.", referenceEn: "I am hungry.", notes: "A note" },
    ]);
  });

  /** A blank line, or one with only half a pair, is not a sentence. */
  it("skips lines that are not a complete pair", () => {
    expect(parsePasted("\nChỉ có tiếng Việt\n | Only English\n")).toEqual([]);
  });

  it("accepts Windows line endings from a spreadsheet", () => {
    expect(parsePasted("Xin chào.|Hello.\r\nTạm biệt.|Goodbye.")).toHaveLength(
      2,
    );
  });
});
