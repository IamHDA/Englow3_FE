import { wavDurationSeconds } from "../audioDuration";
import { encodeWav, TARGET_SAMPLE_RATE } from "../wav";

describe("wavDurationSeconds", () => {
  it("reads the length of a PCM WAV from its header", () => {
    const samples = new Float32Array(TARGET_SAMPLE_RATE * 2.5);
    expect(wavDurationSeconds(encodeWav(samples))).toBeCloseTo(2.5, 5);
  });

  it("skips chunks before the data chunk", () => {
    const wav = encodeWav(new Float32Array(TARGET_SAMPLE_RATE));
    // RIFF header, fmt chunk, then a 4-byte LIST chunk ahead of data.
    const list = new Uint8Array([
      0x4c, 0x49, 0x53, 0x54, 4, 0, 0, 0, 1, 2, 3, 4,
    ]);
    const withList = new Uint8Array(wav.byteLength + list.byteLength);
    withList.set(wav.subarray(0, 36), 0);
    withList.set(list, 36);
    withList.set(wav.subarray(36), 36 + list.byteLength);
    expect(wavDurationSeconds(withList)).toBeCloseTo(1, 5);
  });

  it("returns null for anything that is not a WAV", () => {
    expect(
      wavDurationSeconds(new Uint8Array([0x49, 0x44, 0x33, 4, 0, 0])),
    ).toBeNull();
    expect(wavDurationSeconds(new Uint8Array(0))).toBeNull();
  });
});
