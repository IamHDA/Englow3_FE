/**
 * Phát âm bằng giọng đọc của trình duyệt.
 *
 * Giọng đọc đó đọc được từ, không đọc được ký hiệu IPA: đưa "iː" hay "θ" cho nó
 * thì phần lớn giọng đọc im lặng hoặc đánh vần chữ cái. Nên một âm được nghe qua
 * từ ví dụ của nó ("see" cho /iː/), và thứ người học thấy trên thẻ là ký hiệu.
 */

/** Từ đầu tiên của chuỗi ví dụ: "see, eat" -> "see". */
export function firstExampleWord(example: string): string {
  return example.split(",")[0]?.trim() ?? "";
}

/**
 * Đọc một từ tiếng Anh. Trả về `false` khi trình duyệt không có giọng đọc, để
 * màn hình báo thay vì để nút loa im lặng. Danh sách giọng nạp bất đồng bộ -
 * lần bấm đầu tiên có thể thấy nó còn rỗng - nên chờ `voiceschanged` rồi mới đọc.
 */
export function speakEnglish(text: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  const synth = window.speechSynthesis;
  const say = () => {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    const voice = synth
      .getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith("en"));
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  };
  if (synth.getVoices().length === 0) {
    synth.addEventListener("voiceschanged", say, { once: true });
    // Vài trình duyệt không bao giờ bắn sự kiện nếu không có giọng nào.
    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", say);
      if (!synth.speaking && !synth.pending) say();
    }, 800);
    return true;
  }
  say();
  return true;
}
