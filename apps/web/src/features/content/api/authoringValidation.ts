import type {
  AuthoringDocument,
  AuthoringKind,
  Entry,
} from "../types/authoring";
import {
  cardFields,
  sentenceFields,
} from "../components/blocks/AuthoringFields";

export function validateAuthoring(
  kind: AuthoringKind,
  document: AuthoringDocument,
  isVi: boolean,
) {
  const errors: Record<string, string> = {};
  const required = isVi
    ? "Vui lòng nhập trường này."
    : "This field is required.";
  const metadata = document.metadata;
  const invalid = (key: string, vi: string, en: string) =>
    (errors[`metadata.${key}`] = isVi ? vi : en);
  if (kind === "QUIZ") {
    if (
      !Number.isInteger(metadata.timeLimitSeconds) ||
      (metadata.timeLimitSeconds ?? 0) < 1 ||
      (metadata.timeLimitSeconds ?? 0) > 7200
    )
      invalid(
        "timeLimitSeconds",
        "Thời gian phải từ 1 đến 7200 giây.",
        "Time must be between 1 and 7200 seconds.",
      );
    if (
      !Number.isInteger(metadata.passingScorePercent) ||
      (metadata.passingScorePercent ?? 0) < 1 ||
      (metadata.passingScorePercent ?? 0) > 100
    )
      invalid(
        "passingScorePercent",
        "Tỷ lệ đạt phải từ 1 đến 100%.",
        "Passing score must be between 1 and 100%.",
      );
  }
  if (kind === "EXAM") {
    if (
      !Number.isInteger(metadata.durationSeconds) ||
      (metadata.durationSeconds ?? 0) < 1
    )
      invalid(
        "durationSeconds",
        "Nhập số giây nguyên dương.",
        "Enter a positive number of seconds.",
      );
    if ((metadata.title?.length ?? 0) > 100)
      invalid(
        "title",
        "Tiêu đề đề thi tối đa 100 ký tự.",
        "Exam titles can have at most 100 characters.",
      );
    const variants =
      metadata.certificateType === "IELTS"
        ? ["ACADEMIC", "GENERAL"]
        : metadata.certificateType === "TOEIC"
          ? ["LR", "SW"]
          : [];
    if (
      metadata.certificateType &&
      !variants.includes(metadata.certificateVariant ?? "")
    )
      invalid(
        "certificateVariant",
        "Chọn phiên bản chứng chỉ tương ứng.",
        "Choose a matching certificate variant.",
      );
    const total =
      document.content?.sections?.reduce((n, s) => n + s.maxRawScore, 0) ?? 0;
    if (
      metadata.passScore != null &&
      (!Number.isFinite(metadata.passScore) ||
        metadata.passScore < 0 ||
        metadata.passScore > total)
    )
      invalid(
        "passScore",
        "Điểm đạt phải trong thang điểm của đề.",
        "Passing score must be within the exam score range.",
      );
  }
  for (const key of kind === "FLASHCARD_SET"
    ? ["name", "topic"]
    : kind === "EXAM"
      ? ["title", "description"]
      : kind === "SPEAKING_PROMPT"
        ? ["title", "category", "referenceText"]
        : kind === "QUIZ"
          ? ["title", "category"]
          : ["title", "topic"]) {
    if (!String(metadata[key as keyof typeof metadata] ?? "").trim())
      errors[`metadata.${key}`] = required;
  }
  const entries =
    kind === "FLASHCARD_SET"
      ? document.content?.cards
      : kind === "QUIZ"
        ? document.content?.questions
        : document.sentences;
  entries?.forEach((entry, i) => {
    const prefix =
      kind === "DICTATION_LESSON"
        ? `sentences[${i}]`
        : `content.${kind === "QUIZ" ? "questions" : "cards"}[${i}]`;
    const fields =
      kind === "FLASHCARD_SET"
        ? cardFields
        : kind === "DICTATION_LESSON"
          ? sentenceFields
          : [{ key: "title" }, { key: "prompt" }];
    for (const f of fields)
      if (
        (!("required" in f) || f.required) &&
        !String(entry[f.key as keyof Entry] ?? "").trim()
      )
        errors[`${prefix}.${f.key}`] = required;
    if (
      kind === "DICTATION_LESSON" &&
      (!entry.audioObjectKey || !entry.audioDurationSeconds)
    )
      errors[`${prefix}.audioObjectKey`] = isVi
        ? "Thêm audio hợp lệ cho câu này."
        : "Add valid audio for this sentence.";
    if (kind !== "QUIZ") return;
    const fail = (key: string, vi: string, en: string) =>
      (errors[`${prefix}.${key}`] = isVi ? vi : en);
    if (!entry.points || entry.points < 1 || !Number.isInteger(entry.points))
      fail(
        "points",
        "Điểm phải là số nguyên dương.",
        "Points must be a positive integer.",
      );
    if (
      entry.questionType === "MULTIPLE_CHOICE" &&
      ((entry.options?.length ?? 0) < 2 ||
        !entry.options?.some((o) => o.correct) ||
        entry.options.some((o) => !o.content.trim()))
    )
      fail(
        "options",
        "Nhập ít nhất hai đáp án và chọn ít nhất một đáp án đúng.",
        "Enter at least two options and mark a correct answer.",
      );
    const listKey =
      entry.questionType === "FILL_BLANK"
        ? "acceptedAnswers"
        : entry.questionType === "REWRITE"
          ? "correctWords"
          : entry.questionType === "REORDER"
            ? "correctOrder"
            : null;
    if (
      listKey &&
      (!entry[listKey]?.length || entry[listKey]?.some((w) => !w.trim()))
    )
      fail(
        listKey,
        "Nhập các từ/đáp án hợp lệ, mỗi mục một dòng.",
        "Enter non-empty answer items, one per line.",
      );
    if (
      entry.questionType === "REWRITE" &&
      !String(entry.originalSentence ?? "").trim()
    )
      fail("originalSentence", "Nhập câu gốc.", "Enter the original sentence.");
    if (
      entry.questionType === "REWRITE" &&
      entry.wordBank?.length &&
      !includesWords(entry.wordBank, entry.correctWords ?? [])
    )
      fail(
        "wordBank",
        "Ngân hàng từ phải chứa đủ từ của đáp án, kể cả từ lặp.",
        "The word bank must contain every answer word, including repeated words.",
      );
    if (
      entry.questionType === "REORDER" &&
      entry.scrambledWords?.length &&
      (!includesWords(entry.scrambledWords, entry.correctOrder ?? []) ||
        entry.scrambledWords.length !== entry.correctOrder?.length)
    )
      fail(
        "scrambledWords",
        "Danh sách từ phải khớp với đáp án, kể cả số lần lặp.",
        "Scrambled words must match the answer, including repeated words.",
      );
    if (
      entry.questionType === "MATCHING" &&
      ((entry.pairs?.length ?? 0) < 2 ||
        entry.pairs?.some(
          (p) =>
            !p.leftText.trim() ||
            !p.rightText.trim() ||
            p.leftText.includes("|") ||
            p.rightText.includes("|"),
        ))
    )
      fail(
        "pairs",
        "Nhập ít nhất hai cặp đầy đủ; không dùng ký tự |.",
        "Enter at least two complete pairs without |.",
      );
  });
  if (kind === "EXAM")
    document.content?.sections?.forEach((section, si) =>
      section.parts.forEach((part, pi) => {
        const prefix = `content.sections[${si}].parts[${pi}]`;
        if (!part.title.trim()) errors[`${prefix}.title`] = required;
        part.questionSets.forEach((set, qi) =>
          set.questions.forEach((q, ji) => {
            const p = `${prefix}.questionSets[${qi}].questions[${ji}]`;
            if (!q.content.trim()) errors[`${p}.content`] = required;
            if (!Number.isFinite(q.maxRawScore) || q.maxRawScore <= 0)
              errors[`${p}.maxRawScore`] = isVi
                ? "Điểm phải lớn hơn 0."
                : "Points must be greater than zero.";
            const count = q.options.filter((o) => o.correct).length;
            if (
              q.options.length < 2 ||
              q.options.some((o) => !o.content.trim()) ||
              count === 0 ||
              (q.questionType === "SINGLE_CHOICE" && count !== 1)
            )
              errors[`${p}.options`] = isVi
                ? "Nhập đáp án và chọn đúng số đáp án đúng."
                : "Enter options and mark the correct answer(s).";
          }),
        );
      }),
    );
  return errors;
}

function includesWords(available: string[], required: string[]) {
  const counts = new Map<string, number>();
  available.forEach((w) =>
    counts.set(w.trim(), (counts.get(w.trim()) ?? 0) + 1),
  );
  return (
    required.every((w) => {
      const n = counts.get(w.trim()) ?? 0;
      if (n === 0) return false;
      counts.set(w.trim(), n - 1);
      return true;
    }) && !available.some((w) => !w.trim())
  );
}
