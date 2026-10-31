import { afterEach, describe, expect, it, vi } from "vitest";
import { firstExampleWord, speakEnglish } from "./speakExample";

describe("firstExampleWord", () => {
  it("speaks the first example of a sound, not the symbol", () => {
    expect(firstExampleWord("see, eat")).toBe("see");
    expect(firstExampleWord("  cup ")).toBe("cup");
    expect(firstExampleWord("")).toBe("");
  });
});

describe("speakEnglish", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reports when the browser has no speech synthesis", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    expect(speakEnglish("see")).toBe(false);
  });

  it("speaks with an English voice when voices are loaded", () => {
    const speak = vi.fn();
    const voice = { lang: "en-GB" } as SpeechSynthesisVoice;
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [{ lang: "fr-FR" }, voice],
      cancel: vi.fn(),
      speak,
    });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        constructor(public text: string) {}
        lang = "";
        voice: unknown = null;
      },
    );

    expect(speakEnglish("see")).toBe(true);

    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toMatchObject({ text: "see", voice });
  });
});
