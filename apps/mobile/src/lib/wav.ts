/**
 * The recording format every speech path on the backend accepts: 16 kHz,
 * mono, 16-bit PCM WAV (speaking practice, assessed speaking tasks and the
 * tutor's voice input all check for audio/wav). A port of the web's
 * apps/web/src/shared/audio/wav.ts: the web builds the file in the browser
 * for the same reason the app builds it on the phone - Android's recorder
 * cannot write WAV.
 */
export const TARGET_SAMPLE_RATE = 16_000;
export const WAV_CONTENT_TYPE = "audio/wav";

const BYTES_PER_SAMPLE = 2;
const CHANNELS = 1;
const WAV_HEADER_BYTES = 44;

/** Averages each output sample's span of input, so the result is not aliased. */
export function downsample(
  input: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number = TARGET_SAMPLE_RATE,
): Float32Array {
  if (outputSampleRate >= inputSampleRate) return input;
  const ratio = inputSampleRate / outputSampleRate;
  const output = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < output.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j] ?? 0;
    output[i] = end > start ? sum / (end - start) : 0;
  }
  return output;
}

export function concat(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((length, chunk) => length + chunk.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

/** Interleaved multi-channel samples to mono by averaging each frame. */
export function toMono(samples: Float32Array, channels: number): Float32Array {
  if (channels <= 1) return samples;
  const frames = Math.floor(samples.length / channels);
  const mono = new Float32Array(frames);
  for (let frame = 0; frame < frames; frame++) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel++)
      sum += samples[frame * channels + channel] ?? 0;
    mono[frame] = sum / channels;
  }
  return mono;
}

export function encodeWav(
  samples: Float32Array,
  sampleRate: number = TARGET_SAMPLE_RATE,
): Uint8Array {
  const buffer = new ArrayBuffer(
    WAV_HEADER_BYTES + samples.length * BYTES_PER_SAMPLE,
  );
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, buffer.byteLength - 8, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM header length
  view.setUint16(20, 1, true); // format 1 = PCM
  view.setUint16(22, CHANNELS, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * CHANNELS * BYTES_PER_SAMPLE, true); // byte rate
  view.setUint16(32, CHANNELS * BYTES_PER_SAMPLE, true); // block align
  view.setUint16(34, BYTES_PER_SAMPLE * 8, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, samples.length * BYTES_PER_SAMPLE, true);
  let offset = WAV_HEADER_BYTES;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    // Signed 16-bit has one more negative step than positive.
    view.setInt16(
      offset,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    );
    offset += BYTES_PER_SAMPLE;
  }
  return new Uint8Array(buffer);
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++)
    view.setUint8(offset + i, text.charCodeAt(i));
}
