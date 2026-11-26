import { concat, downsample, encodeWav, toMono } from "../wav";

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

describe("encodeWav", () => {
  it("writes a 16 kHz mono 16-bit PCM header the backend accepts", () => {
    const wav = encodeWav(new Float32Array([0, 0.5, -0.5, 1, -1]));
    const view = new DataView(wav.buffer);

    expect(ascii(wav, 0, 4)).toBe("RIFF");
    expect(ascii(wav, 8, 4)).toBe("WAVE");
    expect(ascii(wav, 36, 4)).toBe("data");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(10);
    expect(wav.byteLength).toBe(44 + 10);
  });

  it("clamps and scales samples without overflowing the positive peak", () => {
    const wav = encodeWav(new Float32Array([2, -2]));
    const view = new DataView(wav.buffer);
    expect(view.getInt16(44, true)).toBe(0x7fff);
    expect(view.getInt16(46, true)).toBe(-0x8000);
  });
});

describe("downsample", () => {
  it("averages 48 kHz down to 16 kHz", () => {
    const input = new Float32Array([0.3, 0.3, 0.3, 0.9, 0.9, 0.9]);
    const output = downsample(input, 48_000);
    expect(Array.from(output).map((value) => Number(value.toFixed(2)))).toEqual(
      [0.3, 0.9],
    );
  });

  it("leaves audio already at or below the target alone", () => {
    const input = new Float32Array([0.1, 0.2]);
    expect(downsample(input, 16_000)).toBe(input);
  });
});

describe("toMono and concat", () => {
  it("averages interleaved stereo frames", () => {
    expect(Array.from(toMono(new Float32Array([1, 0, 0.5, 0.5]), 2))).toEqual([
      0.5, 0.5,
    ]);
  });

  it("joins captured buffers in order", () => {
    expect(
      Array.from(concat([new Float32Array([1]), new Float32Array([2, 3])])),
    ).toEqual([1, 2, 3]);
  });
});
