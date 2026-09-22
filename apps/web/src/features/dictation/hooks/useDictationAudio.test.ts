import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDictationAudio } from "./useDictationAudio";

/**
 * A stand-in for the browser's audio element.
 *
 * jsdom has no media pipeline - play() is not implemented and currentTime never
 * moves on its own - so the element is replaced with something that records what
 * was asked of it. These tests are about what the hook tells the element to do,
 * which is the part that carries the sentence windows.
 */
class FakeAudio {
  currentTime = 0;
  playbackRate = 1;
  paused = true;
  ontimeupdate: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;

  static last: FakeAudio | null = null;

  constructor(public readonly src: string) {
    FakeAudio.last = this;
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  /** Moves the playhead and fires the listener, as a real element would. */
  advanceTo(seconds: number) {
    this.currentTime = seconds;
    this.ontimeupdate?.();
  }
}

beforeEach(() => {
  FakeAudio.last = null;
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("a sentence that is the whole file", () => {
  it("plays from the start", async () => {
    const { result } = renderHook(() =>
      useDictationAudio({ audioUrl: "clip.mp3", durationSeconds: 4 }),
    );

    await act(async () => result.current.togglePlay());

    expect(FakeAudio.last?.currentTime).toBe(0);
    expect(result.current.duration).toBe(4);
  });
});

describe("a sentence cut from a longer recording", () => {
  function windowed() {
    return renderHook(() =>
      useDictationAudio({
        audioUrl: "passage.mp3",
        durationSeconds: 60,
        audioStartMs: 12_000,
        audioEndMs: 16_000,
      }),
    );
  }

  // Without this the learner hears the passage from the top for every line.
  it("seeks to where the sentence starts", async () => {
    const { result } = windowed();

    await act(async () => result.current.togglePlay());

    expect(FakeAudio.last?.currentTime).toBe(12);
  });

  /**
   * The length the learner hears, not the length of the recording. Showing the
   * whole passage would leave the progress bar almost still for a four-second
   * sentence.
   */
  it("reports the length of the sentence rather than of the recording", () => {
    const { result } = windowed();

    expect(result.current.duration).toBe(4);
  });

  it("counts time from the start of the sentence", async () => {
    const { result } = windowed();
    await act(async () => result.current.togglePlay());

    await act(async () => FakeAudio.last?.advanceTo(13.5));

    expect(result.current.currentTime).toBeCloseTo(1.5);
  });

  // The whole point of the window: the next sentence is on the same file, and
  // without a stop the learner hears it too.
  it("stops at the end of the sentence instead of running on", async () => {
    const { result } = windowed();
    await act(async () => result.current.togglePlay());

    await act(async () => FakeAudio.last?.advanceTo(16));

    expect(FakeAudio.last?.paused).toBe(true);
    expect(result.current.isPlaying).toBe(false);
  });

  /** Half a window is not a window, so it is ignored rather than half-applied. */
  it("ignores an end with no start", () => {
    const { result } = renderHook(() =>
      useDictationAudio({
        audioUrl: "passage.mp3",
        durationSeconds: 60,
        audioEndMs: 16_000,
      }),
    );

    expect(result.current.duration).toBe(60);
  });
});

describe("seeking", () => {
  /**
   * These two used to move only the displayed number, so a learner pressing
   * "back 5" watched the clock jump and heard the audio carry on unchanged.
   */
  it("moves the audio, not just the clock", async () => {
    const { result } = renderHook(() =>
      useDictationAudio({
        audioUrl: "passage.mp3",
        durationSeconds: 60,
        audioStartMs: 10_000,
        audioEndMs: 30_000,
      }),
    );
    await act(async () => result.current.togglePlay());
    await act(async () => FakeAudio.last?.advanceTo(20));

    await act(async () => result.current.back5());

    // Five seconds back from ten seconds in, still measured from the window.
    expect(FakeAudio.last?.currentTime).toBe(15);
    expect(result.current.currentTime).toBeCloseTo(5);
  });

  it("does not seek behind the start of the sentence", async () => {
    const { result } = renderHook(() =>
      useDictationAudio({
        audioUrl: "passage.mp3",
        audioStartMs: 10_000,
        audioEndMs: 30_000,
      }),
    );
    await act(async () => result.current.togglePlay());

    await act(async () => result.current.back5());

    expect(FakeAudio.last?.currentTime).toBe(10);
  });
});

describe("a sentence with no recording", () => {
  it("still reports a length rather than failing", () => {
    const { result } = renderHook(() =>
      useDictationAudio({ audioUrl: null, durationSeconds: 6 }),
    );

    expect(result.current.duration).toBe(6);
    expect(result.current.isPlaying).toBe(false);
  });
});
