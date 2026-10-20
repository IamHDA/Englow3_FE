/**
 * Đóng gói PCM thô thành file WAV 16-bit mono.
 *
 * Vì sao không dùng thẳng `MediaRecorder`: Chrome trả `audio/webm;codecs=opus`,
 * Firefox trả `audio/ogg;codecs=opus`, Safari lại khác nữa. Dịch vụ chấm chỉ
 * nhận WAV và OGG, nên dựa vào `MediaRecorder` sẽ là "chạy trên Firefox, hỏng
 * trên Chrome" - mà lỗi lại nổ ra lúc chấm, muộn hơn nhiều so với lúc ghi.
 *
 * Ghi PCM rồi tự đóng gói thì mọi trình duyệt cho ra cùng một định dạng, và WAV
 * 16 kHz mono đúng là thứ bộ chấm phát âm muốn. Đổi lại file to hơn Opus, nhưng
 * một câu 15 giây chỉ khoảng 480 KB - còn xa giới hạn 10 MB.
 */

/** Tần số lấy mẫu bộ chấm phát âm dùng. Gửi cao hơn chỉ tốn băng thông. */
export const TARGET_SAMPLE_RATE = 16_000;

export const WAV_CONTENT_TYPE = "audio/wav";

const BYTES_PER_SAMPLE = 2;
const CHANNELS = 1;
const WAV_HEADER_BYTES = 44;

/**
 * Hạ tần số bằng cách lấy trung bình từng nhóm mẫu, không phải nhảy cóc lấy
 * mẫu thứ n. Nhảy cóc là cách tạo ra răng cưa: tiếng gió của âm /s/ biến thành
 * tiếng rít lạc quãng, và bộ chấm sẽ trừ điểm cho thứ micro không hề thu.
 */
export function downsample(
  input: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number = TARGET_SAMPLE_RATE,
): Float32Array {
  if (outputSampleRate >= inputSampleRate) {
    return input;
  }

  const ratio = inputSampleRate / outputSampleRate;
  const output = new Float32Array(Math.floor(input.length / ratio));

  for (let i = 0; i < output.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);

    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += input[j];
    }
    output[i] = end > start ? sum / (end - start) : 0;
  }

  return output;
}

/** Nối các khối thu được thành một dải liên tục. */
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

/**
 * Dựng file WAV hoàn chỉnh, kể cả header.
 *
 * Mẫu bị kẹp về [-1, 1] trước khi nhân lên 16-bit. Không kẹp thì một tiếng nói
 * quá to sẽ tràn số và lật dấu, nghe thành tiếng rè - bộ chấm sẽ nghe đúng
 * tiếng rè đó chứ không phải giọng người học.
 */
export function encodeWav(
  samples: Float32Array,
  sampleRate: number = TARGET_SAMPLE_RATE,
): ArrayBuffer {
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
    // Âm và dương có biên khác nhau ở số nguyên có dấu, nên nhân bằng hai hằng
    // số khác nhau; dùng chung 0x8000 sẽ tràn đúng một bậc ở đỉnh dương.
    view.setInt16(
      offset,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    );
    offset += BYTES_PER_SAMPLE;
  }

  return buffer;
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
