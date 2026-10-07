"use client";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Image,
  Loader,
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useRecoverableForm } from "@/shared/hooks/useRecoverableForm";
import { EditorFrame } from "@/shared/components/EditorFrame";
import { authoringRequest, AuthoringError } from "../../api/authoring";
import { isAuthoringDraft } from "../../types/authoringDraft";
import { validateAuthoring } from "../../api/authoringValidation";
import type {
  AuthoringDocument,
  AuthoringKind,
  Entry,
} from "../../types/authoring";
import {
  Fields,
  cardFields,
  sentenceFields,
  QuizFields,
  questionTypes,
} from "../blocks/AuthoringFields";
import { AuthoringMedia } from "../blocks/AuthoringMedia";
import { AuthoringReviewActions } from "../blocks/AuthoringReviewActions";
import { ExamTreeEditor } from "../blocks/ExamTreeEditor";

const names: Record<AuthoringKind, [string, string]> = {
  FLASHCARD_SET: ["Bộ từ vựng", "Vocabulary set"],
  QUIZ: ["Quiz", "Quiz"],
  DICTATION_LESSON: ["Bài nghe chép chính tả", "Dictation lesson"],
  SPEAKING_PROMPT: ["Bài phát âm — đọc theo mẫu", "Pronunciation — read aloud"],
  EXAM: ["Đề thi", "Exam"],
};
const makeEntry = (kind: AuthoringKind): Entry =>
  kind === "QUIZ"
    ? {
        questionType: "MULTIPLE_CHOICE",
        title: "",
        prompt: "",
        points: 1,
        explanation: "",
        options: [
          { label: "A", content: "", correct: false },
          { label: "B", content: "", correct: false },
        ],
        acceptedAnswers: [],
        correctWords: [],
        correctOrder: [],
        wordBank: [],
        scrambledWords: [],
        pairs: [
          { leftText: "", rightText: "" },
          { leftText: "", rightText: "" },
        ],
      }
    : kind === "DICTATION_LESSON"
      ? {
          text: "",
          translationVi: "",
          audioObjectKey: "",
          audioDurationSeconds: 1,
        }
      : {
          lemma: "",
          partOfSpeech: "",
          senseLabel: "",
          ipaUs: "",
          definitionEn: "",
          definitionVi: "",
          exampleSentence: "",
        };
function initialDocument(kind: AuthoringKind): AuthoringDocument {
  const metadata = {
    slug: "",
    title: "",
    name: "",
    description: "",
    topic: "",
    category: "",
    targetLevel: null,
    timeLimitSeconds: 600,
    passingScorePercent: 60,
    referenceText: "",
    ipaTranscript: "",
    translationVi: "",
    phonemeTarget: "",
    tips: [],
    examType: "MOCK",
    certificateType: null,
    certificateVariant: null,
    durationSeconds: 1800,
    maxRawScore: 1,
    passScore: null,
  };
  return {
    version: 0,
    metadata,
    content:
      kind === "FLASHCARD_SET"
        ? { cards: [makeEntry(kind)] }
        : kind === "QUIZ"
          ? { questions: [makeEntry(kind)] }
          : kind === "EXAM"
            ? { sections: [] }
            : undefined,
    sentences: kind === "DICTATION_LESSON" ? [makeEntry(kind)] : undefined,
  };
}
function editableDocument(
  kind: AuthoringKind,
  data: AuthoringDocument,
): AuthoringDocument {
  return {
    ...data,
    content:
      kind === "FLASHCARD_SET"
        ? { cards: data.cards ?? [] }
        : kind === "QUIZ"
          ? { questions: data.questions ?? [] }
          : data.content,
  };
}
export function ContentEditorView({
  kind,
  id,
}: {
  kind: AuthoringKind;
  id?: string;
}) {
  const { isVi } = useLanguage();
  const [data, setData] = useState<AuthoringDocument | null>(() =>
    id ? null : initialDocument(kind),
  );
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!id) return;
    let active = true;
    authoringRequest<AuthoringDocument>(`${kind}/${id}`)
      .then((d) => {
        if (active) {
          setData(editableDocument(kind, d));
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [kind, id, reload]);
  if (error)
    return (
      <Alert
        color="orange"
        m="lg"
        title={isVi ? "Không tải được nội dung" : "Could not load content"}
      >
        <Button
          mt="sm"
          onClick={() => {
            setError(false);
            setReload((v) => v + 1);
          }}
        >
          {isVi ? "Thử lại" : "Retry"}
        </Button>
      </Alert>
    );
  if (!data)
    return (
      <Group p="xl">
        <Loader />
        <Text>{isVi ? "Đang tải nội dung…" : "Loading content…"}</Text>
      </Group>
    );
  return (
    <Editor
      key={`${id ?? "new"}:${data.version}`}
      kind={kind}
      initial={data}
      saved={(d) => setData(editableDocument(kind, d))}
    />
  );
}
function Editor({
  kind,
  initial,
  saved,
}: {
  kind: AuthoringKind;
  initial: AuthoringDocument;
  saved: (d: AuthoringDocument) => void;
}) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const router = useRouter();
  const formInitial = { ...initial, media: undefined };
  const draft = useRecoverableForm(
    `content:${kind}:${initial.id ?? "new"}:${initial.version}`,
    formInitial,
    isAuthoringDraft,
  );
  const doc = { ...draft.value, media: initial.media };
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [tab, setTab] = useState<string | null>("edit");
  const [mediaPending, setMediaPending] = useState(0);
  const mediaBusy = (active: boolean) =>
    setMediaPending((n) => Math.max(0, n + (active ? 1 : -1)));
  useEffect(() => {
    if (mediaPending === 0) return;
    const protect = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const navigate = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? (event.target.closest("a[href]") as HTMLAnchorElement | null)
          : null;
      if (
        !link ||
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      notifications.show({
        color: "orange",
        message: isVi
          ? "Chờ media tải xong trước khi rời trang."
          : "Wait for the media upload before leaving.",
      });
    };
    window.addEventListener("beforeunload", protect);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", protect);
      document.removeEventListener("click", navigate, true);
    };
  }, [mediaPending, isVi]);
  const readonly =
    !!initial.status && !["DRAFT", "REJECTED"].includes(initial.status);
  const entries =
    kind === "FLASHCARD_SET"
      ? (doc.content?.cards ?? [])
      : kind === "QUIZ"
        ? (doc.content?.questions ?? [])
        : (doc.sentences ?? []);
  function setEntries(values: Entry[]) {
    draft.setValue((v) =>
      kind === "DICTATION_LESSON"
        ? { ...v, sentences: values }
        : {
            ...v,
            content:
              kind === "QUIZ" ? { questions: values } : { cards: values },
          },
    );
  }
  function entry(index: number, value: Entry) {
    setEntries(entries.map((e, i) => (i === index ? value : e)));
  }
  function meta<K extends keyof AuthoringDocument["metadata"]>(
    key: K,
    value: AuthoringDocument["metadata"][K],
  ) {
    draft.setValue((v) => ({
      ...v,
      metadata: { ...v.metadata, [key]: value },
    }));
  }
  const back = () =>
    router.push(
      kind === "EXAM" ? "/admin/exams" : `/admin/content?kind=${kind}`,
    );
  async function save() {
    if (lock.current || readonly || mediaPending > 0) return;
    const invalid = validateAuthoring(kind, doc, isVi);
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      setTab("edit");
      setFailure(
        t(
          "Kiểm tra các trường được đánh dấu trước khi lưu.",
          "Check the highlighted fields before saving.",
        ),
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    setFailure(null);
    try {
      const body = structuredClone(doc);
      body.metadata.slug ||= `lesson-${crypto.randomUUID()}`;
      // A zero-question exam can be saved as a draft; publication validates completeness.
      if (kind === "EXAM")
        body.metadata.maxRawScore = Math.max(
          1,
          body.content?.sections?.reduce((n, s) => n + s.maxRawScore, 0) ?? 0,
        );
      const result = await authoringRequest<AuthoringDocument>(
        `${kind}${initial.id ? `/${initial.id}` : ""}`,
        initial.id ? "PUT" : "POST",
        body,
      );
      draft.markSaved();
      notifications.show({
        color: "teal",
        message: t("Đã lưu nháp trên máy chủ.", "Draft saved to the server."),
      });
      if (!initial.id)
        router.replace(`/admin/content/editor/${kind}/${result.id}`);
      else saved(result);
    } catch (e) {
      if (e instanceof AuthoringError) {
        setErrors(e.fields);
        setFailure(
          ["CONTENT_CHANGED", "CONCURRENT_UPDATE"].includes(e.code)
            ? t(
                "Nội dung đã thay đổi ở phiên khác. Nháp của bạn vẫn được giữ; tải bản mới trước khi lưu lại.",
                "This item changed in another session. Your draft is retained; reload before saving again.",
              )
            : e.code === "UNAUTHENTICATED"
              ? t(
                  "Phiên đăng nhập đã hết. Đăng nhập lại rồi mở nháp.",
                  "Your session expired. Sign in and reopen the draft.",
                )
              : t(
                  "Chưa lưu được nội dung. Kiểm tra các trường và kết nối rồi thử lại.",
                  "Save failed. Check the fields and connection, then retry.",
                ),
        );
      } else
        setFailure(t("Chưa lưu được nội dung.", "Could not save content."));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function downloadDraft() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ ...doc, media: undefined }, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `englow-draft-${kind}-${initial.id ?? "new"}-v${initial.version}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  const name = names[kind][isVi ? 0 : 1];
  const disabled = busy || readonly || mediaPending > 0;
  const metadataFields =
    kind === "FLASHCARD_SET"
      ? [
          {
            key: "name" as const,
            vi: "Tên bộ thẻ",
            en: "Set name",
            required: true,
          },
          { key: "topic" as const, vi: "Chủ đề", en: "Topic", required: true },
          { key: "description" as const, vi: "Mô tả", en: "Description" },
        ]
      : [
          { key: "title" as const, vi: "Tiêu đề", en: "Title", required: true },
          ...(kind === "EXAM"
            ? []
            : [
                {
                  key: (kind === "QUIZ" || kind === "SPEAKING_PROMPT"
                    ? "category"
                    : "topic") as "category" | "topic",
                  vi: "Chủ đề",
                  en: "Topic",
                  required: true,
                },
              ]),
          ...(kind === "QUIZ" || kind === "EXAM"
            ? [
                {
                  key: "description" as const,
                  vi: "Mô tả",
                  en: "Description",
                  required: kind === "EXAM",
                },
              ]
            : []),
        ];
  return (
    <EditorFrame
      standalone
      title={`${readonly ? t("Xem trước", "Preview") : initial.id ? t("Sửa", "Edit") : t("Tạo", "Create")} · ${name}`}
      busy={busy || mediaPending > 0}
      onClose={() => draft.confirmClose(back)}
    >
      <Stack gap="lg">
        {mediaPending > 0 && (
          <Alert color="blue" role="status">
            {t(
              "Đang tải media. Chờ hoàn tất trước khi lưu hoặc rời trang.",
              "Media is uploading. Wait before saving or leaving.",
            )}
          </Alert>
        )}
        {initial.reviewNote && (
          <Alert color="orange" title={t("Lý do trả lại", "Review feedback")}>
            {initial.reviewNote}
          </Alert>
        )}
        {draft.restored && (
          <Alert color="blue">
            {t(
              "Đã khôi phục nháp trên thiết bị. Chưa lưu lên máy chủ.",
              "Local draft restored. Changes are not saved to the server.",
            )}
          </Alert>
        )}
        {draft.storageError && (
          <Alert color="orange">
            {t(
              "Không lưu được nháp trên thiết bị. Giữ trang mở cho đến khi lưu thành công.",
              "Local storage is unavailable. Keep this page open until saving succeeds.",
            )}
          </Alert>
        )}
        {readonly && (
          <Alert color="blue">
            {t(
              "Nội dung đang duyệt, đã xuất bản hoặc lưu trữ được khóa sửa. Lịch sử học được bảo toàn.",
              "Content under review, published or archived is read-only to preserve learner history.",
            )}
          </Alert>
        )}
        {failure && (
          <Alert color="orange" role="alert">
            {failure}
            <Group mt="sm">
              <Button variant="default" onClick={downloadDraft}>
                {t("Tải nháp xuống máy", "Download draft")}
              </Button>
              <Button
                variant="light"
                onClick={() => {
                  if (
                    window.confirm(
                      t(
                        "Tải bản mới sẽ thay nội dung đang hiển thị. Hãy tải nháp xuống trước để có thể đối chiếu lại. Tiếp tục?",
                        "Reload the current version? Download your draft first so you can compare your changes.",
                      ),
                    )
                  )
                    location.reload();
                }}
              >
                {t("Tải bản hiện hành", "Reload current version")}
              </Button>
            </Group>
          </Alert>
        )}
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            <Tabs.Tab value="edit">
              {t("Soạn nội dung", "Edit content")}
            </Tabs.Tab>
            <Tabs.Tab value="preview">
              {t("Xem trước và đáp án", "Preview and answer key")}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="edit" pt="lg">
            <Stack gap="lg">
              <Card withBorder>
                <Stack>
                  {metadataFields.map((f) => (
                    <TextInput
                      key={f.key}
                      label={isVi ? f.vi : f.en}
                      required={f.required}
                      maxLength={
                        kind === "EXAM" && f.key === "title"
                          ? 100
                          : f.key === "description"
                            ? 2000
                            : 200
                      }
                      value={String(doc.metadata[f.key] ?? "")}
                      disabled={disabled}
                      error={errors[`metadata.${f.key}`]}
                      onChange={(e) => meta(f.key, e.currentTarget.value)}
                    />
                  ))}
                  <Select
                    label={t(
                      "Trình độ CEFR (tùy chọn)",
                      "CEFR level (optional)",
                    )}
                    data={["A1", "A2", "B1", "B2", "C1", "C2"]}
                    clearable
                    value={doc.metadata.targetLevel ?? null}
                    disabled={disabled}
                    onChange={(v) => meta("targetLevel", v)}
                  />
                  {kind === "QUIZ" && (
                    <Group grow>
                      <NumberInput
                        label={t("Thời gian (giây)", "Time limit (seconds)")}
                        min={1}
                        max={7200}
                        allowDecimal={false}
                        error={errors["metadata.timeLimitSeconds"]}
                        value={doc.metadata.timeLimitSeconds}
                        disabled={disabled}
                        onChange={(v) => meta("timeLimitSeconds", Number(v))}
                      />
                      <NumberInput
                        label={t("Tỷ lệ đạt (%)", "Passing score (%)")}
                        min={1}
                        max={100}
                        allowDecimal={false}
                        error={errors["metadata.passingScorePercent"]}
                        value={doc.metadata.passingScorePercent}
                        disabled={disabled}
                        onChange={(v) => meta("passingScorePercent", Number(v))}
                      />
                    </Group>
                  )}
                  {kind === "EXAM" && (
                    <>
                      <Group grow>
                        <Select
                          label={t("Loại đề", "Exam type")}
                          data={[
                            { value: "MOCK", label: t("Thi thử", "Mock exam") },
                            {
                              value: "PLACEMENT",
                              label: t("Kiểm tra đầu vào", "Placement test"),
                            },
                          ]}
                          value={doc.metadata.examType}
                          disabled={disabled}
                          allowDeselect={false}
                          onChange={(v) => meta("examType", v ?? "MOCK")}
                        />
                        <NumberInput
                          label={t(
                            "Thời gian làm bài (giây)",
                            "Duration (seconds)",
                          )}
                          min={1}
                          allowDecimal={false}
                          error={errors["metadata.durationSeconds"]}
                          value={doc.metadata.durationSeconds}
                          disabled={disabled}
                          onChange={(v) => meta("durationSeconds", Number(v))}
                        />
                      </Group>
                      <Group grow>
                        <Select
                          label={t(
                            "Chứng chỉ (tùy chọn)",
                            "Certificate (optional)",
                          )}
                          data={["IELTS", "TOEIC"]}
                          clearable
                          value={doc.metadata.certificateType ?? null}
                          disabled={disabled}
                          onChange={(v) =>
                            draft.setValue((d) => ({
                              ...d,
                              metadata: {
                                ...d.metadata,
                                certificateType: v,
                                certificateVariant: null,
                              },
                            }))
                          }
                        />
                        <Select
                          label={t(
                            "Phiên bản chứng chỉ",
                            "Certificate variant",
                          )}
                          data={
                            doc.metadata.certificateType === "IELTS"
                              ? ["ACADEMIC", "GENERAL"]
                              : doc.metadata.certificateType === "TOEIC"
                                ? ["LR", "SW"]
                                : []
                          }
                          value={doc.metadata.certificateVariant ?? null}
                          disabled={disabled || !doc.metadata.certificateType}
                          error={errors["metadata.certificateVariant"]}
                          onChange={(v) => meta("certificateVariant", v)}
                        />
                        <NumberInput
                          label={t(
                            "Điểm đạt (tùy chọn)",
                            "Passing score (optional)",
                          )}
                          min={0}
                          value={doc.metadata.passScore ?? ""}
                          disabled={disabled}
                          error={errors["metadata.passScore"]}
                          onChange={(v) =>
                            meta("passScore", v === "" ? null : Number(v))
                          }
                        />
                      </Group>
                      <Text>
                        {t("Tổng điểm từ câu hỏi:", "Total question points:")}{" "}
                        {doc.content?.sections?.reduce(
                          (n, s) => n + s.maxRawScore,
                          0,
                        ) ?? 0}
                      </Text>
                    </>
                  )}
                  {kind === "SPEAKING_PROMPT" && (
                    <>
                      <Textarea
                        label={t(
                          "Câu tiếng Anh để đọc",
                          "English reference text",
                        )}
                        required
                        maxLength={2000}
                        autosize
                        minRows={3}
                        disabled={disabled}
                        value={doc.metadata.referenceText ?? ""}
                        error={errors["metadata.referenceText"]}
                        onChange={(e) =>
                          meta("referenceText", e.currentTarget.value)
                        }
                      />
                      <Textarea
                        label={t("Bản dịch", "Translation")}
                        disabled={disabled}
                        value={doc.metadata.translationVi ?? ""}
                        onChange={(e) =>
                          meta("translationVi", e.currentTarget.value)
                        }
                      />
                      <TextInput
                        label={t("Phiên âm IPA", "IPA transcript")}
                        disabled={disabled}
                        value={doc.metadata.ipaTranscript ?? ""}
                        onChange={(e) =>
                          meta("ipaTranscript", e.currentTarget.value)
                        }
                      />
                      <TextInput
                        label={t("Âm trọng tâm", "Target phoneme")}
                        disabled={disabled}
                        value={doc.metadata.phonemeTarget ?? ""}
                        onChange={(e) =>
                          meta("phonemeTarget", e.currentTarget.value)
                        }
                      />
                      <Textarea
                        label={t(
                          "Mẹo luyện (mỗi dòng một mẹo)",
                          "Coaching tips (one per line)",
                        )}
                        disabled={disabled}
                        value={doc.metadata.tips?.join("\n") ?? ""}
                        onChange={(e) =>
                          meta(
                            "tips",
                            e.currentTarget.value.split("\n").filter(Boolean),
                          )
                        }
                      />
                    </>
                  )}
                </Stack>
              </Card>
              {kind === "EXAM" ? (
                <ExamTreeEditor
                  onMediaBusy={mediaBusy}
                  media={initial.media}
                  id={initial.id}
                  disabled={disabled}
                  sections={doc.content?.sections ?? []}
                  errors={errors}
                  change={(sections) =>
                    draft.setValue((v) => ({ ...v, content: { sections } }))
                  }
                />
              ) : (
                kind !== "SPEAKING_PROMPT" && (
                  <>
                    <Accordion multiple defaultValue={["0"]}>
                      {entries.map((e, i) => {
                        const prefix =
                          kind === "DICTATION_LESSON"
                            ? `sentences[${i}]`
                            : `content.${kind === "QUIZ" ? "questions" : "cards"}[${i}]`;
                        return (
                          <Accordion.Item key={i} value={String(i)}>
                            <Accordion.Control>
                              {i + 1}.{" "}
                              {e.lemma ||
                                e.title ||
                                e.text ||
                                t("Nội dung mới", "New item")}
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Stack>
                                {kind === "QUIZ" ? (
                                  <QuizFields
                                    value={e}
                                    change={(v) => entry(i, v)}
                                    errors={errors}
                                    prefix={prefix}
                                    disabled={disabled}
                                  />
                                ) : (
                                  <Fields
                                    fields={
                                      kind === "FLASHCARD_SET"
                                        ? cardFields
                                        : sentenceFields
                                    }
                                    value={e}
                                    change={(v) => entry(i, v)}
                                    errors={errors}
                                    prefix={prefix}
                                    disabled={disabled}
                                  />
                                )}
                                {kind === "FLASHCARD_SET" && (
                                  <Select
                                    label={t(
                                      "Trình độ từ (tùy chọn)",
                                      "Word level (optional)",
                                    )}
                                    clearable
                                    data={["A1", "A2", "B1", "B2", "C1", "C2"]}
                                    value={e.cefrLevel ?? null}
                                    disabled={disabled}
                                    onChange={(v) =>
                                      entry(i, { ...e, cefrLevel: v })
                                    }
                                  />
                                )}
                                {kind === "FLASHCARD_SET" && (
                                  <Group grow align="flex-start">
                                    {(["Us", "Uk"] as const).map((accent) => (
                                      <AuthoringMedia
                                        onBusyChange={mediaBusy}
                                        key={accent}
                                        kind="FLASHCARD_SET"
                                        label={t(
                                          `Tải audio ${accent.toUpperCase()}`,
                                          `Upload ${accent.toUpperCase()} audio`,
                                        )}
                                        disabled={disabled}
                                        url={
                                          e[`audio${accent}Url`] ??
                                          doc.media?.[
                                            e[`audio${accent}ObjectKey`] ?? ""
                                          ]
                                        }
                                        onUploaded={(key, url) =>
                                          entry(i, {
                                            ...e,
                                            [`audio${accent}ObjectKey`]: key,
                                            [`audio${accent}Url`]: url,
                                          })
                                        }
                                      />
                                    ))}
                                  </Group>
                                )}
                                {kind === "DICTATION_LESSON" && (
                                  <>
                                    <AuthoringMedia
                                      onBusyChange={mediaBusy}
                                      kind="DICTATION_LESSON"
                                      disabled={disabled}
                                      url={
                                        e.audioUrl ??
                                        (e.audioObjectKey
                                          ? doc.media?.[e.audioObjectKey]
                                          : undefined)
                                      }
                                      onUploaded={(key, url, seconds) =>
                                        entry(i, {
                                          ...e,
                                          audioObjectKey: key,
                                          audioUrl: url,
                                          audioDurationSeconds: seconds ?? 1,
                                          audioStartMs: null,
                                          audioEndMs: null,
                                        })
                                      }
                                    />
                                    {errors[`${prefix}.audioObjectKey`] && (
                                      <Text c="red" role="alert">
                                        {errors[`${prefix}.audioObjectKey`]}
                                      </Text>
                                    )}
                                    {e.audioStartMs != null && (
                                      <Text c="dimmed">
                                        {t(
                                          "Đoạn audio được giữ:",
                                          "Preserved audio segment:",
                                        )}{" "}
                                        {e.audioStartMs / 1000}–
                                        {(e.audioEndMs ?? 0) / 1000}s
                                      </Text>
                                    )}
                                  </>
                                )}
                                <Button
                                  variant="subtle"
                                  color="red"
                                  disabled={disabled || entries.length === 1}
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        t("Xóa mục này?", "Remove this item?"),
                                      )
                                    )
                                      setEntries(
                                        entries.filter((_, j) => i !== j),
                                      );
                                  }}
                                >
                                  {t("Xóa mục", "Remove item")}
                                </Button>
                              </Stack>
                            </Accordion.Panel>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                    <Button
                      variant="light"
                      disabled={
                        disabled ||
                        entries.length >=
                          (kind === "QUIZ"
                            ? 100
                            : kind === "DICTATION_LESSON"
                              ? 200
                              : 500)
                      }
                      onClick={() => setEntries([...entries, makeEntry(kind)])}
                    >
                      {t("Thêm nội dung", "Add item")}
                    </Button>
                  </>
                )
              )}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="preview" pt="lg">
            <Stack>
              <ContentPreview kind={kind} doc={doc} />
              {initial.id && (
                <AuthoringReviewActions
                  key={initial.status}
                  kind={kind}
                  id={initial.id}
                  status={initial.status}
                  dirty={draft.dirty}
                  refresh={async () => {
                    const updated = await authoringRequest<AuthoringDocument>(
                      `${kind}/${initial.id}`,
                    );
                    saved(updated);
                  }}
                />
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
        <Group
          justify="space-between"
          style={{
            position: "sticky",
            bottom: 0,
            padding: "12px 0",
            background: "var(--mantine-color-body)",
            zIndex: 3,
          }}
        >
          <Text size="sm" aria-live="polite">
            {readonly
              ? t("Chỉ xem", "Read-only")
              : draft.dirty
                ? t("Có thay đổi chưa lưu lên máy chủ", "Unsaved changes")
                : t("Không có thay đổi chưa lưu", "No unsaved changes")}
          </Text>
          <Group>
            <Button
              variant="default"
              disabled={busy || mediaPending > 0}
              onClick={() => draft.confirmClose(back)}
            >
              {t("Về danh sách", "Back to list")}
            </Button>
            {!readonly && (
              <Button loading={busy} disabled={mediaPending > 0} onClick={save}>
                {t("Lưu nháp", "Save draft")}
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </EditorFrame>
  );
}
function ContentPreview({
  kind,
  doc,
}: {
  kind: AuthoringKind;
  doc: AuthoringDocument;
}) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const entries =
    kind === "FLASHCARD_SET"
      ? (doc.content?.cards ?? [])
      : kind === "QUIZ"
        ? (doc.content?.questions ?? [])
        : (doc.sentences ?? []);
  const block = (text?: string | null) =>
    text ? (
      <Text style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
        {text}
      </Text>
    ) : null;
  const media = (node: {
    audioObjectKey?: string | null;
    imageObjectKey?: string | null;
    audioUrl?: string;
    imageUrl?: string;
  }) => (
    <>
      {(node.audioUrl ||
        (node.audioObjectKey && doc.media?.[node.audioObjectKey])) && (
        <audio
          controls
          src={node.audioUrl ?? doc.media?.[node.audioObjectKey!]}
          style={{ width: "100%" }}
        />
      )}
      {(node.imageUrl ||
        (node.imageObjectKey && doc.media?.[node.imageObjectKey])) && (
        <Image
          alt={t("Ảnh trong đề", "Question image")}
          src={node.imageUrl ?? doc.media?.[node.imageObjectKey!]}
          fit="contain"
          mah={320}
        />
      )}
    </>
  );
  return (
    <Stack>
      <Card withBorder>
        <Text fw={700} size="xl">
          {doc.metadata.name || doc.metadata.title}
        </Text>
        {block(doc.metadata.description)}
        {kind === "SPEAKING_PROMPT" && (
          <>
            {block(doc.metadata.referenceText)}
            {block(doc.metadata.ipaTranscript)}
            {block(doc.metadata.translationVi)}
            {doc.metadata.tips?.map((tip, i) => (
              <Text key={i}>• {tip}</Text>
            ))}
          </>
        )}
      </Card>
      {entries.map((e, i) => (
        <Card key={i} withBorder>
          <Stack gap="sm">
            <Text fw={600}>
              {i + 1}. {e.lemma || e.title || e.text}
            </Text>
            {kind === "FLASHCARD_SET" ? (
              <>
                {block(e.ipaUs)}
                {block(e.ipaUk)}
                {(e.audioUsUrl ||
                  (e.audioUsObjectKey && doc.media?.[e.audioUsObjectKey])) && (
                  <Stack gap="xs">
                    <Text size="sm">US</Text>
                    <audio
                      controls
                      src={e.audioUsUrl ?? doc.media?.[e.audioUsObjectKey!]}
                      style={{ width: "100%" }}
                    />
                  </Stack>
                )}
                {(e.audioUkUrl ||
                  (e.audioUkObjectKey && doc.media?.[e.audioUkObjectKey])) && (
                  <Stack gap="xs">
                    <Text size="sm">UK</Text>
                    <audio
                      controls
                      src={e.audioUkUrl ?? doc.media?.[e.audioUkObjectKey!]}
                      style={{ width: "100%" }}
                    />
                  </Stack>
                )}
                {block(e.definitionEn)}
                {block(e.definitionVi)}
                {block(e.exampleSentence)}
                {block(e.exampleTranslationVi)}
                {block(e.mnemonicTipVi)}
              </>
            ) : kind === "DICTATION_LESSON" ? (
              <>
                {media(e)}
                {block(e.translationVi)}
              </>
            ) : (
              <>
                <Badge variant="light">
                  {
                    questionTypes.find((v) => v.value === e.questionType)?.[
                      isVi ? "vi" : "en"
                    ]
                  }
                </Badge>
                {block(e.prompt)}
                {block(e.originalSentence)}
                {block(e.beforeText)}
                {block(e.afterText)}
                {e.questionType === "MULTIPLE_CHOICE" &&
                  e.options?.map((o, j) => (
                    <Text key={j} c={o.correct ? "teal" : "dimmed"}>
                      {o.label}. {o.content} {o.correct ? "✓" : ""}
                    </Text>
                  ))}
                {e.questionType === "FILL_BLANK" &&
                  block(e.acceptedAnswers?.join(" / "))}
                {e.questionType === "REWRITE" &&
                  block(e.correctWords?.join(" "))}
                {e.questionType === "REORDER" &&
                  block(e.correctOrder?.join(" "))}
                {e.questionType === "MATCHING" &&
                  e.pairs?.map((p, j) => (
                    <Text key={j}>
                      {p.leftText} ↔ {p.rightText}
                    </Text>
                  ))}
                {block(e.explanation)}
              </>
            )}
          </Stack>
        </Card>
      ))}
      {kind === "EXAM" &&
        doc.content?.sections?.map((s, si) => (
          <Card key={si} withBorder>
            <Stack>
              <Text fw={700}>
                {s.sectionType} · {s.maxRawScore} {t("điểm", "points")}
              </Text>
              {s.parts.map((p, pi) => (
                <Stack key={pi}>
                  <Text fw={600}>{p.title}</Text>
                  {block(p.instruction)}
                  {block(p.content)}
                  {media(p)}
                  {p.questionSets.map((set, qi) => (
                    <Stack key={qi}>
                      <Text fw={600}>{set.title}</Text>
                      {block(set.instruction)}
                      {block(set.content)}
                      {media(set)}
                      {set.questions.map((q) => (
                        <Card key={q.orderNo} withBorder>
                          <Stack>
                            <Text fw={600}>
                              {q.orderNo}. {q.content}
                            </Text>
                            {q.options.map((o, oi) => (
                              <Text key={oi} c={o.correct ? "teal" : "dimmed"}>
                                {String.fromCharCode(65 + oi)}. {o.content}{" "}
                                {o.correct ? "✓" : ""}
                              </Text>
                            ))}
                            {block(q.explanation)}
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Card>
        ))}
    </Stack>
  );
}
