import { describe, expect, it } from "vitest";

import { concat, downsample, encodeWav, TARGET_SAMPLE_RATE } from "./wav";

function readAscii(view: DataView, offset: number, length: number): string {
  let text = "";
  for (let i = 0; i < length; i++) {
    text += String.fromCharCode(view.getUint8(offset + i));
  }
  return text;
}

describe("encodeWav", () => {
  it("writes a header the format actually requires", () => {
    const view = new DataView(encodeWav(new Float32Array([0, 0]), 16_000));

    expect(readAscii(view, 0, 4)).toBe("RIFF");
    expect(readAscii(view, 8, 4)).toBe("WAVE");
    expect(readAscii(view, 12, 4)).toBe("fmt ");
    expect(readAscii(view, 36, 4)).toBe("data");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
  });

  it("sizes the file from the samples it was given", () => {
    const buffer = encodeWav(new Float32Array(100));

    // 44 bytes of header plus two bytes per sample.
    expect(buffer.byteLength).toBe(44 + 200);
    expect(new DataView(buffer).getUint32(40, true)).toBe(200);
  });

  it("puts silence at zero and full scale at the ends of the range", () => {
    const view = new DataView(encodeWav(new Float32Array([0, 1, -1]), 16_000));

    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(32_767);
    expect(view.getInt16(48, true)).toBe(-32_768);
  });

  /**
   * The case that decides whether a loud speaker is heard as loud or as
   * distorted. Without the clamp the sample wraps and flips sign, and the
   * assessment scores the resulting crackle instead of the learner.
   */
  it("clamps a sample that came in too loud rather than wrapping it", () => {
    const view = new DataView(encodeWav(new Float32Array([2.5, -2.5]), 16_000));

    expect(view.getInt16(44, true)).toBe(32_767);
    expect(view.getInt16(46, true)).toBe(-32_768);
  });
});

describe("downsample", () => {
  it("reduces the sample count by the ratio between the two rates", () => {
    const input = new Float32Array(48_000);

    expect(downsample(input, 48_000, 16_000)).toHaveLength(16_000);
  });

  /** Averaging, not picking every nth sample - the difference between speech and aliased hiss. */
  it("averages each group rather than dropping what falls between", () => {
    const input = new Float32Array([1, 0, 1, 0]);

    const output = downsample(input, 4, 2);

    expect(Array.from(output)).toEqual([0.5, 0.5]);
  });

  /** A microphone already at the target rate needs nothing done to it. */
  it("leaves audio alone when it is not being reduced", () => {
    const input = new Float32Array([0.1, 0.2]);

    expect(downsample(input, TARGET_SAMPLE_RATE, TARGET_SAMPLE_RATE)).toBe(
      input,
    );
  });

  it("does not try to raise a rate it was handed below the target", () => {
    const input = new Float32Array([0.1, 0.2]);

    expect(downsample(input, 8_000, 16_000)).toBe(input);
  });
});

describe("concat", () => {
  it("joins the recorded chunks in order", () => {
    const merged = concat([
      new Float32Array([1, 2]),
      new Float32Array([3]),
      new Float32Array([4, 5]),
    ]);

    expect(Array.from(merged)).toEqual([1, 2, 3, 4, 5]);
  });

  it("gives an empty result for a recording that captured nothing", () => {
    expect(concat([])).toHaveLength(0);
  });
});
