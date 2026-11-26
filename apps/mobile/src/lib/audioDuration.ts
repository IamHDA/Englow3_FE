import { createAudioPlayer } from "expo-audio";

/**
 * Seconds of a WAV file, read from its header: the data chunk's size over the
 * format's byte rate. Null when the bytes are not a PCM WAV this can read.
 */
export function wavDurationSeconds(bytes: Uint8Array): number | null {
  if (bytes.byteLength < 12) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (offset: number) =>
    String.fromCharCode(
      bytes[offset] ?? 0,
      bytes[offset + 1] ?? 0,
      bytes[offset + 2] ?? 0,
      bytes[offset + 3] ?? 0,
    );
  if (tag(0) !== "RIFF" || tag(8) !== "WAVE") return null;
  let byteRate = 0;
  let offset = 12;
  while (offset + 8 <= bytes.byteLength) {
    const id = tag(offset);
    const size = view.getUint32(offset + 4, true);
    if (id === "fmt " && offset + 20 <= bytes.byteLength)
      byteRate = view.getUint32(offset + 16, true);
    if (id === "data") {
      if (!byteRate) return null;
      const seconds = size / byteRate;
      return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
    }
    // Chunks are padded to an even length.
    offset += 8 + size + (size % 2);
  }
  return null;
}

/**
 * Whole seconds of an audio file, rounded up as the web's uploader does: from
 * the header for WAV, otherwise from the player once it has loaded the file.
 */
export async function audioDurationSeconds(
  uri: string,
  bytes: Uint8Array,
  timeoutMs = 10_000,
): Promise<number> {
  const fromHeader = wavDurationSeconds(bytes);
  if (fromHeader) return Math.ceil(fromHeader);
  const player = createAudioPlayer({ uri });
  try {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (player.isLoaded && player.duration > 0)
        return Math.ceil(player.duration);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Audio duration unavailable");
  } finally {
    player.remove();
  }
}
