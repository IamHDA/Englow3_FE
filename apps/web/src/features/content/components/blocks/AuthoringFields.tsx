"use client";
import {
  Checkbox,
  Group,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { Entry, Option } from "../../types/authoring";
export type Field = {
  key: keyof Entry;
  vi: string;
  en: string;
  required?: boolean;
  multiline?: boolean;
  list?: boolean;
};
export const cardFields: Field[] = [
  { key: "lemma", vi: "Từ vựng", en: "Word", required: true },
  { key: "partOfSpeech", vi: "Từ loại", en: "Part of speech", required: true },
  { key: "senseLabel", vi: "Nghĩa đang học", en: "Sense", required: true },
  { key: "ipaUs", vi: "Phiên âm US", en: "US pronunciation", required: true },
  { key: "ipaUk", vi: "Phiên âm UK", en: "UK pronunciation" },
  {
    key: "definitionEn",
    vi: "Định nghĩa tiếng Anh",
    en: "English definition",
    required: true,
    multiline: true,
  },
  {
    key: "definitionVi",
    vi: "Nghĩa tiếng Việt",
    en: "Vietnamese meaning",
    required: true,
    multiline: true,
  },
  {
    key: "exampleSentence",
    vi: "Câu ví dụ",
    en: "Example sentence",
    required: true,
    multiline: true,
  },
  {
    key: "exampleTranslationVi",
    vi: "Dịch câu ví dụ",
    en: "Example translation",
    multiline: true,
  },
  {
    key: "mnemonicTipVi",
    vi: "Mẹo ghi nhớ",
    en: "Memory tip",
    multiline: true,
  },
];
export const sentenceFields: Field[] = [
  {
    key: "text",
    vi: "Câu đúng để đối chiếu",
    en: "Answer transcript",
    required: true,
    multiline: true,
  },
  { key: "translationVi", vi: "Bản dịch", en: "Translation", multiline: true },
  { key: "hintFirstLetters", vi: "Gợi ý chữ đầu", en: "First-letter hint" },
  { key: "hintRevealWord", vi: "Từ gợi ý", en: "Revealed word" },
  {
    key: "hintPartialTranscript",
    vi: "Gợi ý một phần câu",
    en: "Partial transcript",
    multiline: true,
  },
];
export const questionTypes = [
  { value: "MULTIPLE_CHOICE", vi: "Chọn đáp án", en: "Multiple choice" },
  { value: "FILL_BLANK", vi: "Điền chỗ trống", en: "Fill in the blank" },
  { value: "REWRITE", vi: "Viết lại câu", en: "Rewrite" },
  { value: "REORDER", vi: "Sắp xếp từ", en: "Reorder" },
  { value: "MATCHING", vi: "Ghép cặp", en: "Matching" },
];
export function Fields({
  fields,
  value,
  change,
  errors,
  prefix,
  disabled,
}: {
  fields: Field[];
  value: Entry;
  change: (value: Entry) => void;
  errors: Record<string, string>;
  prefix: string;
  disabled?: boolean;
}) {
  const { isVi } = useLanguage();
  return (
    <Stack>
      {fields.map((f) => {
        const raw = value[f.key];
        const props = {
          label: isVi ? f.vi : f.en,
          required: f.required,
          disabled,
          error: errors[`${prefix}.${f.key}`],
          value: Array.isArray(raw)
            ? raw.join("\n")
            : typeof raw === "string"
              ? raw
              : "",
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) =>
            change({
              ...value,
              [f.key]: f.list
                ? e.currentTarget.value.split("\n")
                : e.currentTarget.value,
            }),
        };
        return f.multiline || f.list ? (
          <Textarea
            key={f.key}
            {...props}
            autosize
            minRows={2}
            description={
              f.list
                ? isVi
                  ? "Mỗi mục trên một dòng."
                  : "One item per line."
                : undefined
            }
          />
        ) : (
          <TextInput key={f.key} {...props} />
        );
      })}
    </Stack>
  );
}
export function OptionsEditor({
  options,
  change,
  error,
  disabled,
  single,
}: {
  options: Option[];
  change: (v: Option[]) => void;
  error?: string;
  disabled?: boolean;
  single?: boolean;
}) {
  const { isVi } = useLanguage();
  return (
    <Stack>
      {options.map((o, i) => (
        <Group key={i} align="flex-start" wrap="wrap">
          <TextInput
            label={`${isVi ? "Đáp án" : "Option"} ${i + 1}`}
            value={o.content}
            required
            disabled={disabled}
            error={error}
            style={{ flex: 1, minWidth: 170 }}
            onChange={(e) =>
              change(
                options.map((v, j) =>
                  j === i ? { ...v, content: e.currentTarget.value } : v,
                ),
              )
            }
          />
          <Checkbox
            mt={38}
            label={isVi ? "Đúng" : "Correct"}
            checked={o.correct}
            disabled={disabled}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              change(
                options.map((v, j) =>
                  j === i
                    ? { ...v, correct: checked }
                    : single && checked
                      ? { ...v, correct: false }
                      : v,
                ),
              );
            }}
          />
        </Group>
      ))}
    </Stack>
  );
}
export function QuizFields({
  value,
  change,
  errors,
  prefix,
  disabled,
}: {
  value: Entry;
  change: (v: Entry) => void;
  errors: Record<string, string>;
  prefix: string;
  disabled?: boolean;
}) {
  const { isVi } = useLanguage();
  const type = value.questionType;
  const shape: Field[] =
    type === "FILL_BLANK"
      ? [
          { key: "beforeText", vi: "Phần trước chỗ trống", en: "Before blank" },
          { key: "afterText", vi: "Phần sau chỗ trống", en: "After blank" },
          {
            key: "acceptedAnswers",
            vi: "Các đáp án được chấp nhận",
            en: "Accepted answers",
            required: true,
            list: true,
          },
        ]
      : type === "REWRITE"
        ? [
            {
              key: "originalSentence",
              vi: "Câu gốc",
              en: "Original sentence",
              required: true,
            },
            { key: "rewriteKeyword", vi: "Từ khóa cần dùng", en: "Keyword" },
            {
              key: "correctWords",
              vi: "Từng từ của đáp án, đúng thứ tự",
              en: "Answer words in order",
              required: true,
              list: true,
            },
            {
              key: "wordBank",
              vi: "Ngân hàng từ (có thể để trống để dùng đáp án)",
              en: "Word bank (optional)",
              list: true,
            },
          ]
        : type === "REORDER"
          ? [
              {
                key: "correctOrder",
                vi: "Từng từ theo thứ tự đúng",
                en: "Words in correct order",
                required: true,
                list: true,
              },
              {
                key: "scrambledWords",
                vi: "Từng từ đưa cho người học (có thể để trống)",
                en: "Scrambled words (optional)",
                list: true,
              },
            ]
          : [];
  return (
    <Stack>
      <Select
        label={isVi ? "Dạng câu hỏi" : "Question type"}
        value={type}
        data={questionTypes.map((t) => ({
          value: t.value,
          label: isVi ? t.vi : t.en,
        }))}
        disabled={disabled}
        allowDeselect={false}
        onChange={(v) =>
          change({ ...value, questionType: v ?? "MULTIPLE_CHOICE" })
        }
      />
      <Fields
        fields={[
          {
            key: "title",
            vi: "Tên câu hỏi",
            en: "Question title",
            required: true,
          },
          {
            key: "prompt",
            vi: "Yêu cầu",
            en: "Prompt",
            required: true,
            multiline: true,
          },
          {
            key: "explanation",
            vi: "Giải thích sau khi làm",
            en: "Answer explanation",
            multiline: true,
          },
          ...shape,
        ]}
        value={value}
        change={change}
        errors={errors}
        prefix={prefix}
        disabled={disabled}
      />
      <NumberInput
        label={isVi ? "Điểm" : "Points"}
        min={1}
        max={100}
        allowDecimal={false}
        error={errors[`${prefix}.points`]}
        value={value.points ?? 1}
        disabled={disabled}
        onChange={(v) => change({ ...value, points: Number(v) })}
      />
      {type === "MULTIPLE_CHOICE" && (
        <>
          <NumberInput
            label={isVi ? "Số đáp án" : "Number of options"}
            min={2}
            max={10}
            allowDecimal={false}
            disabled={disabled}
            value={value.options?.length ?? 2}
            onChange={(v) => {
              const count = Number(v);
              if (count >= 2 && count <= 10)
                change({
                  ...value,
                  options: Array.from(
                    { length: count },
                    (_, i) =>
                      value.options?.[i] ?? {
                        label: String.fromCharCode(65 + i),
                        content: "",
                        correct: false,
                      },
                  ),
                });
            }}
          />
          <OptionsEditor
            disabled={disabled}
            options={value.options ?? []}
            change={(options) => change({ ...value, options })}
            error={errors[`${prefix}.options`]}
          />
        </>
      )}
      {type === "MATCHING" && (
        <>
          <NumberInput
            label={isVi ? "Số cặp" : "Number of pairs"}
            min={2}
            max={10}
            allowDecimal={false}
            disabled={disabled}
            value={value.pairs?.length ?? 2}
            onChange={(v) => {
              const count = Number(v);
              if (count >= 2 && count <= 10)
                change({
                  ...value,
                  pairs: Array.from(
                    { length: count },
                    (_, i) =>
                      value.pairs?.[i] ?? { leftText: "", rightText: "" },
                  ),
                });
            }}
          />
          {(value.pairs ?? []).map((p, i) => (
            <Group key={i} grow>
              <TextInput
                label={`${isVi ? "Vế trái" : "Left"} ${i + 1}`}
                required
                disabled={disabled}
                error={errors[`${prefix}.pairs`]}
                value={p.leftText}
                onChange={(e) =>
                  change({
                    ...value,
                    pairs: value.pairs!.map((v, j) =>
                      j === i ? { ...v, leftText: e.currentTarget.value } : v,
                    ),
                  })
                }
              />
              <TextInput
                label={`${isVi ? "Vế phải" : "Right"} ${i + 1}`}
                required
                disabled={disabled}
                value={p.rightText}
                onChange={(e) =>
                  change({
                    ...value,
                    pairs: value.pairs!.map((v, j) =>
                      j === i ? { ...v, rightText: e.currentTarget.value } : v,
                    ),
                  })
                }
              />
            </Group>
          ))}
        </>
      )}
    </Stack>
  );
}
