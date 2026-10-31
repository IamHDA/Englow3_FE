import { describe, expect, it } from "vitest";
import { abbreviatePartOfSpeech } from "./partOfSpeech";

describe("abbreviatePartOfSpeech", () => {
  it("abbreviates the common parts of speech in capitals", () => {
    expect(abbreviatePartOfSpeech("noun")).toBe("N");
    expect(abbreviatePartOfSpeech("Adjective")).toBe("ADJ");
    expect(abbreviatePartOfSpeech(" adverb ")).toBe("ADV");
    expect(abbreviatePartOfSpeech("determiner")).toBe("DET");
  });

  it("keeps an unknown part of speech readable instead of dropping it", () => {
    expect(abbreviatePartOfSpeech("particle")).toBe("PARTICLE");
  });
});
