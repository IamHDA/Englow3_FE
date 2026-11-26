import { Stack, router, usePreventRemove } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { AuthoringError, authoringRequest } from "@/lib/authoring";
import { useDeviceDraft } from "@/lib/useDeviceDraft";
import { useRest } from "@/lib/useRest";
import { randomUUID } from "@/lib/uuid";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  ErrorState,
  LoadingState,
  Notice,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { spacing } from "@/ui/theme";

import { isAuthoringDraft } from "./authoringDraft";
import { PROMPT_CATEGORY_OPTIONS, QUIZ_CATEGORY_OPTIONS } from "./categories";
import {
  editableDocument,
  ENTRY_LIMITS,
  entriesOf,
  entryPrefix,
  initialDocument,
  KIND_NAMES,
  makeEntry,
  metadataFields,
  saveBody,
  withEntries,
} from "./document";
import { Fields, QuizFields } from "./EntryFields";
import { ExamTree } from "./ExamTree";
import { cardFields, sentenceFields } from "./fields";
import { MediaUpload } from "./MediaUpload";
import { ContentPreview } from "./Preview";
import { ReviewActions } from "./ReviewActions";
import type {
  AuthoringDocument,
  AuthoringKind,
  Entry,
  Metadata,
} from "./types";
import { validateAuthoring } from "./validation";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Writes or reviews one piece of learning content - a vocabulary set, quiz,
 * dictation lesson, pronunciation prompt or exam - as the web's
 * ContentEditorView. `id` is "new" for a draft not yet on the server.
 */
export function ContentEditor({
  kind,
  id,
}: {
  kind: AuthoringKind;
  id: string;
}) {
  const creating = id === "new";
  const loaded = useRest(`${kind}/${id}`, () =>
    creating
      ? Promise.resolve(initialDocument(kind))
      : authoringRequest<AuthoringDocument>(`${kind}/${id}`).then((doc) =>
          editableDocument(kind, doc),
        ),
  );

  if (loaded.error)
    return (
      <Screen>
        <Stack.Screen options={{ title: KIND_NAMES[kind] }} />
        <ErrorState
          message="Không tải được nội dung."
          onRetry={loaded.reload}
        />
      </Screen>
    );
  if (!loaded.data)
    return (
      <Screen>
        <Stack.Screen options={{ title: KIND_NAMES[kind] }} />
        <LoadingState label="Đang tải nội dung…" />
      </Screen>
    );
  return (
    <Editor
      key={`${loaded.data.id ?? "new"}:${loaded.data.version}:${loaded.data.status ?? ""}`}
      kind={kind}
      initial={loaded.data}
      saved={(doc) => loaded.setData(editableDocument(kind, doc))}
      reload={loaded.reload}
    />
  );
}

function Editor({
  kind,
  initial,
  saved,
  reload,
}: {
  kind: AuthoringKind;
  initial: AuthoringDocument;
  saved: (doc: AuthoringDocument) => void;
  reload: () => void;
}) {
  const { me } = useAuth();
  const draft = useDeviceDraft<AuthoringDocument>(
    me?.id,
    `content:${kind}:${initial.id ?? "new"}:${initial.version}`,
    { ...initial, media: undefined },
    isAuthoringDraft,
  );
  const doc: AuthoringDocument = { ...draft.value, media: initial.media };
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const [mediaPending, setMediaPending] = useState(0);
  const mediaBusy = (active: boolean) =>
    setMediaPending((count) => Math.max(0, count + (active ? 1 : -1)));

  const readonly =
    !!initial.status && !["DRAFT", "REJECTED"].includes(initial.status);
  const disabled = busy || readonly || mediaPending > 0;
  const entries = entriesOf(kind, doc);

  // Leaving with edits: they stay on the phone, but say so; never mid-upload.
  const uploading = mediaPending > 0;
  // The confirm callback needs the hook's own "stop preventing" function.
  const allowLeaveRef = useRef<() => void>(() => undefined);
  const allowLeave = usePreventRemove(
    uploading || (draft.dirty && !readonly),
    ({ repeat }) => {
      if (uploading) {
        Alert.alert(
          "Đang tải media",
          "Chờ media tải xong trước khi rời trang.",
        );
        return;
      }
      Alert.alert(
        "Rời trang?",
        "Thay đổi chưa lưu lên máy chủ vẫn được giữ trên máy này trong 24 giờ.",
        [
          { text: "Ở lại", style: "cancel" },
          {
            text: "Rời trang",
            onPress: () => {
              allowLeaveRef.current();
              repeat();
            },
          },
        ],
      );
    },
  );
  useEffect(() => {
    allowLeaveRef.current = allowLeave;
  });

  function update(next: (doc: AuthoringDocument) => AuthoringDocument) {
    setSavedNotice(false);
    draft.setValue(next);
  }
  function meta<K extends keyof Metadata>(key: K, value: Metadata[K]) {
    update((current) => ({
      ...current,
      metadata: { ...current.metadata, [key]: value },
    }));
  }
  function setEntries(next: Entry[]) {
    update((current) => withEntries(kind, current, next));
  }
  function entry(index: number, value: Entry) {
    setEntries(entries.map((item, i) => (i === index ? value : item)));
  }

  async function save() {
    if (lock.current || readonly || mediaPending > 0) return;
    const invalid = validateAuthoring(kind, doc, true);
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      setTab("edit");
      setFailure("Kiểm tra các trường được đánh dấu trước khi lưu.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setFailure(null);
    try {
      const result = await authoringRequest<AuthoringDocument>(
        `${kind}${initial.id ? `/${initial.id}` : ""}`,
        initial.id ? "PUT" : "POST",
        saveBody(kind, doc, randomUUID),
      );
      draft.markSaved();
      if (!initial.id && result.id) {
        allowLeave();
        router.replace({
          pathname: "/admin/content/editor/[kind]/[id]",
          params: { kind, id: result.id },
        });
        return;
      }
      setSavedNotice(true);
      saved(result);
    } catch (cause) {
      if (cause instanceof AuthoringError) {
        setErrors(cause.fields);
        setFailure(
          ["CONTENT_CHANGED", "CONCURRENT_UPDATE"].includes(cause.code)
            ? "Nội dung đã thay đổi ở phiên khác. Nháp của bạn vẫn được giữ trên máy; tải bản mới trước khi lưu lại."
            : cause.code === "EXAM_PRODUCTIVE_SECTION"
              ? "Đề thi thử không chứa được phần Writing/Speaking. Đổi phần đó sang Listening hoặc Reading; Writing/Speaking soạn ở Quản trị → Đề Nói & Viết."
              : cause.code === "UNAUTHENTICATED"
                ? "Phiên đăng nhập đã hết. Đăng nhập lại rồi mở nháp."
                : "Chưa lưu được nội dung. Kiểm tra các trường và kết nối rồi thử lại.",
        );
      } else setFailure("Chưa lưu được nội dung.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const title = `${readonly ? "Xem" : initial.id ? "Sửa" : "Tạo"} · ${KIND_NAMES[kind]}`;
  const limit = ENTRY_LIMITS[kind] ?? 0;

  return (
    <Screen>
      <Stack.Screen options={{ title }} />
      {initial.status ? (
        <Badge label={initial.status} tone={readonly ? "neutral" : "primary"} />
      ) : null}
      {mediaPending > 0 ? (
        <Notice
          tone="info"
          message="Đang tải media. Chờ hoàn tất trước khi lưu hoặc rời trang."
        />
      ) : null}
      {initial.reviewNote ? (
        <Notice message={`Lý do trả lại: ${initial.reviewNote}`} />
      ) : null}
      {draft.restored ? (
        <Card style={{ marginVertical: spacing.sm }}>
          <AppText>
            Đã khôi phục nháp trên thiết bị. Chưa lưu lên máy chủ.
          </AppText>
          <Button
            title="Bỏ nháp trên máy"
            size="sm"
            variant="ghost"
            onPress={draft.discard}
          />
        </Card>
      ) : null}
      {draft.storageError ? (
        <Notice message="Không lưu được nháp trên thiết bị. Giữ màn hình này mở cho đến khi lưu thành công." />
      ) : null}
      {readonly ? (
        <Notice
          tone="info"
          message="Nội dung đang duyệt, đã xuất bản hoặc lưu trữ được khóa sửa. Lịch sử học được bảo toàn."
        />
      ) : null}
      {failure ? (
        <Card style={{ marginVertical: spacing.sm }}>
          <Notice message={failure} />
          {initial.id ? (
            <Button
              title="Tải bản hiện hành"
              size="sm"
              variant="secondary"
              onPress={() =>
                Alert.alert(
                  "Tải bản hiện hành?",
                  "Nội dung đang hiển thị sẽ được thay bằng bản trên máy chủ.",
                  [
                    { text: "Huỷ", style: "cancel" },
                    {
                      text: "Tải lại",
                      style: "destructive",
                      onPress: () => {
                        draft.discard();
                        reload();
                      },
                    },
                  ],
                )
              }
            />
          ) : null}
        </Card>
      ) : null}
      {savedNotice ? (
        <Notice tone="success" message="Đã lưu nháp trên máy chủ." />
      ) : null}

      <ChipRow>
        <Chip
          label="Soạn nội dung"
          selected={tab === "edit"}
          onPress={() => setTab("edit")}
        />
        <Chip
          label="Xem trước và đáp án"
          selected={tab === "preview"}
          onPress={() => setTab("preview")}
        />
      </ChipRow>

      {tab === "edit" ? (
        <>
          <Card style={{ marginBottom: spacing.md }}>
            <MetadataForm
              kind={kind}
              doc={doc}
              errors={errors}
              disabled={disabled}
              meta={meta}
              update={update}
            />
          </Card>

          {kind === "EXAM" ? (
            <ExamTree
              id={initial.id}
              media={initial.media}
              onMediaBusy={mediaBusy}
              disabled={disabled}
              sections={doc.content?.sections ?? []}
              errors={errors}
              change={(sections) =>
                update((current) => ({ ...current, content: { sections } }))
              }
            />
          ) : kind !== "SPEAKING_PROMPT" ? (
            <>
              {entries.map((item, index) => {
                const prefix = entryPrefix(kind, index);
                const expanded = open.has(index);
                const failed = Object.keys(errors).some((key) =>
                  key.startsWith(`${prefix}.`),
                );
                return (
                  <Card key={index} style={{ marginBottom: spacing.sm }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                      onPress={() =>
                        setOpen((current) => {
                          const next = new Set(current);
                          if (expanded) next.delete(index);
                          else next.add(index);
                          return next;
                        })
                      }
                    >
                      <Row style={{ justifyContent: "space-between" }}>
                        <AppText
                          variant="label"
                          tone={failed ? "danger" : "default"}
                          style={{ flex: 1 }}
                          numberOfLines={1}
                        >
                          {index + 1}.{" "}
                          {item.lemma ||
                            item.title ||
                            item.text ||
                            "Nội dung mới"}
                        </AppText>
                        <AppText tone="primary">
                          {expanded ? "Thu gọn" : "Mở"}
                        </AppText>
                      </Row>
                    </Pressable>
                    {expanded ? (
                      <View style={{ marginTop: spacing.sm }}>
                        {kind === "QUIZ" ? (
                          <QuizFields
                            value={item}
                            change={(value) => entry(index, value)}
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
                            value={item}
                            change={(value) => entry(index, value)}
                            errors={errors}
                            prefix={prefix}
                            disabled={disabled}
                          />
                        )}
                        {kind === "FLASHCARD_SET" ? (
                          <>
                            <AppText variant="label">
                              Trình độ từ (tùy chọn)
                            </AppText>
                            <ChipRow>
                              <Chip
                                label="Không đặt"
                                selected={!item.cefrLevel}
                                onPress={() =>
                                  !disabled &&
                                  entry(index, { ...item, cefrLevel: null })
                                }
                              />
                              {LEVELS.map((level) => (
                                <Chip
                                  key={level}
                                  label={level}
                                  selected={item.cefrLevel === level}
                                  onPress={() =>
                                    !disabled &&
                                    entry(index, { ...item, cefrLevel: level })
                                  }
                                />
                              ))}
                            </ChipRow>
                            {(["Us", "Uk"] as const).map((accent) => (
                              <MediaUpload
                                key={accent}
                                kind="FLASHCARD_SET"
                                label={`Tải audio ${accent.toUpperCase()}`}
                                disabled={disabled}
                                onBusyChange={mediaBusy}
                                url={
                                  item[`audio${accent}Url`] ??
                                  doc.media?.[
                                    item[`audio${accent}ObjectKey`] ?? ""
                                  ]
                                }
                                onUploaded={(key, url) =>
                                  entry(index, {
                                    ...item,
                                    [`audio${accent}ObjectKey`]: key,
                                    [`audio${accent}Url`]: url,
                                  })
                                }
                              />
                            ))}
                          </>
                        ) : null}
                        {kind === "DICTATION_LESSON" ? (
                          <>
                            <MediaUpload
                              kind="DICTATION_LESSON"
                              disabled={disabled}
                              onBusyChange={mediaBusy}
                              url={
                                item.audioUrl ??
                                (item.audioObjectKey
                                  ? doc.media?.[item.audioObjectKey]
                                  : undefined)
                              }
                              onUploaded={(key, url, seconds) =>
                                entry(index, {
                                  ...item,
                                  audioObjectKey: key,
                                  audioUrl: url,
                                  audioDurationSeconds: seconds ?? 1,
                                  audioStartMs: null,
                                  audioEndMs: null,
                                })
                              }
                            />
                            {errors[`${prefix}.audioObjectKey`] ? (
                              <AppText variant="caption" tone="danger">
                                {errors[`${prefix}.audioObjectKey`]}
                              </AppText>
                            ) : null}
                            {item.audioStartMs != null ? (
                              <AppText variant="caption" tone="muted">
                                Đoạn audio được giữ: {item.audioStartMs / 1000}–
                                {(item.audioEndMs ?? 0) / 1000}s
                              </AppText>
                            ) : null}
                          </>
                        ) : null}
                        <Button
                          title="Xoá mục"
                          size="sm"
                          variant="ghost"
                          disabled={disabled || entries.length === 1}
                          onPress={() =>
                            Alert.alert("Xoá mục này?", undefined, [
                              { text: "Huỷ", style: "cancel" },
                              {
                                text: "Xoá",
                                style: "destructive",
                                onPress: () => {
                                  setEntries(
                                    entries.filter((_, j) => j !== index),
                                  );
                                  setOpen(new Set());
                                },
                              },
                            ])
                          }
                        />
                      </View>
                    ) : null}
                  </Card>
                );
              })}
              <Button
                title="Thêm nội dung"
                icon="add"
                variant="secondary"
                disabled={disabled || entries.length >= limit}
                onPress={() => {
                  setEntries([...entries, makeEntry(kind)]);
                  setOpen(new Set([entries.length]));
                }}
              />
            </>
          ) : null}
        </>
      ) : (
        <>
          <ContentPreview kind={kind} doc={doc} />
          {initial.id ? (
            <ReviewActions
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
          ) : (
            <AppText tone="muted">Lưu nháp trước khi gửi duyệt.</AppText>
          )}
        </>
      )}

      <View style={{ marginTop: spacing.lg }}>
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginBottom: spacing.xs }}
        >
          {readonly
            ? "Chỉ xem"
            : draft.dirty
              ? "Có thay đổi chưa lưu lên máy chủ"
              : "Không có thay đổi chưa lưu"}
        </AppText>
        {!readonly ? (
          <Button
            title="Lưu nháp"
            loading={busy}
            disabled={mediaPending > 0}
            onPress={() => void save()}
          />
        ) : null}
      </View>
    </Screen>
  );
}

function MetadataForm({
  kind,
  doc,
  errors,
  disabled,
  meta,
  update,
}: {
  kind: AuthoringKind;
  doc: AuthoringDocument;
  errors: Record<string, string>;
  disabled: boolean;
  meta: <K extends keyof Metadata>(key: K, value: Metadata[K]) => void;
  update: (next: (doc: AuthoringDocument) => AuthoringDocument) => void;
}) {
  const m = doc.metadata;
  const numberField = (
    key: "timeLimitSeconds" | "passingScorePercent" | "durationSeconds",
    label: string,
  ) => (
    <TextField
      label={label}
      value={m[key] == null || Number.isNaN(m[key]) ? "" : String(m[key])}
      keyboardType="number-pad"
      editable={!disabled}
      error={errors[`metadata.${key}`]}
      onChangeText={(text) => meta(key, Number(text.replace(/\D/g, "")))}
    />
  );

  return (
    <>
      {metadataFields(kind).map((field) => (
        <TextField
          key={field.key}
          label={`${field.label}${field.required ? " *" : ""}`}
          value={String(m[field.key] ?? "")}
          maxLength={field.maxLength}
          multiline={field.key === "description"}
          editable={!disabled}
          error={errors[`metadata.${field.key}`]}
          onChangeText={(text) => meta(field.key, text)}
        />
      ))}
      {kind === "QUIZ" || kind === "SPEAKING_PROMPT" ? (
        <>
          <AppText variant="label">Chủ đề *</AppText>
          <ChipRow>
            {(kind === "QUIZ"
              ? QUIZ_CATEGORY_OPTIONS
              : PROMPT_CATEGORY_OPTIONS
            ).map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={m.category === option.value}
                onPress={() => !disabled && meta("category", option.value)}
              />
            ))}
          </ChipRow>
          {errors["metadata.category"] ? (
            <AppText variant="caption" tone="danger">
              {errors["metadata.category"]}
            </AppText>
          ) : null}
        </>
      ) : null}

      <AppText variant="label" style={{ marginTop: spacing.sm }}>
        Trình độ CEFR (tùy chọn)
      </AppText>
      <ChipRow>
        <Chip
          label="Không đặt"
          selected={!m.targetLevel}
          onPress={() => !disabled && meta("targetLevel", null)}
        />
        {LEVELS.map((level) => (
          <Chip
            key={level}
            label={level}
            selected={m.targetLevel === level}
            onPress={() => !disabled && meta("targetLevel", level)}
          />
        ))}
      </ChipRow>

      {kind === "QUIZ" || kind === "DICTATION_LESSON" ? (
        <>
          <AppText variant="label" style={{ marginTop: spacing.sm }}>
            Chứng chỉ (tùy chọn)
          </AppText>
          <AppText variant="caption" tone="muted">
            Để trống nếu là bài luyện chung. Lộ trình chỉ đưa bài IELTS cho
            người luyện IELTS, bài TOEIC cho người luyện TOEIC.
          </AppText>
          <ChipRow>
            {[null, "IELTS", "TOEIC"].map((type) => (
              <Chip
                key={type ?? "none"}
                label={type ?? "Không"}
                selected={(m.certificateType ?? null) === type}
                onPress={() => !disabled && meta("certificateType", type)}
              />
            ))}
          </ChipRow>
        </>
      ) : null}

      {kind === "QUIZ" ? (
        <Row gap={spacing.sm} style={{ marginTop: spacing.sm }}>
          <View style={{ flex: 1 }}>
            {numberField("timeLimitSeconds", "Thời gian (giây)")}
          </View>
          <View style={{ flex: 1 }}>
            {numberField("passingScorePercent", "Tỷ lệ đạt (%)")}
          </View>
        </Row>
      ) : null}

      {kind === "EXAM" ? (
        <View style={{ marginTop: spacing.sm }}>
          <AppText variant="label">Loại đề</AppText>
          <ChipRow>
            {[
              ["MOCK", "Thi thử"],
              ["PLACEMENT", "Kiểm tra đầu vào"],
              ["LEVEL_CHECK", "Đo trình độ (từ vựng, ngữ pháp, nghe)"],
            ].map(([value, label]) => (
              <Chip
                key={value}
                label={label ?? ""}
                selected={m.examType === value}
                onPress={() => !disabled && meta("examType", value)}
              />
            ))}
          </ChipRow>
          {numberField("durationSeconds", "Thời gian làm bài (giây)")}
          <AppText variant="label">Chứng chỉ (tùy chọn)</AppText>
          <ChipRow>
            {[null, "IELTS", "TOEIC"].map((type) => (
              <Chip
                key={type ?? "none"}
                label={type ?? "Không"}
                selected={(m.certificateType ?? null) === type}
                onPress={() =>
                  !disabled &&
                  update((current) => ({
                    ...current,
                    metadata: {
                      ...current.metadata,
                      certificateType: type,
                      certificateVariant: null,
                    },
                  }))
                }
              />
            ))}
          </ChipRow>
          {m.certificateType ? (
            <>
              <AppText variant="label">Phiên bản chứng chỉ</AppText>
              <ChipRow>
                {(m.certificateType === "IELTS"
                  ? ["ACADEMIC", "GENERAL"]
                  : ["LR", "SW"]
                ).map((variant) => (
                  <Chip
                    key={variant}
                    label={variant}
                    selected={m.certificateVariant === variant}
                    onPress={() =>
                      !disabled && meta("certificateVariant", variant)
                    }
                  />
                ))}
              </ChipRow>
              {errors["metadata.certificateVariant"] ? (
                <AppText variant="caption" tone="danger">
                  {errors["metadata.certificateVariant"]}
                </AppText>
              ) : null}
            </>
          ) : null}
          <TextField
            label="Điểm đạt (tùy chọn)"
            value={m.passScore == null ? "" : String(m.passScore)}
            keyboardType="decimal-pad"
            editable={!disabled}
            error={errors["metadata.passScore"]}
            onChangeText={(text) => {
              const clean = text.replace(",", ".").replace(/[^\d.]/g, "");
              meta("passScore", clean === "" ? null : Number(clean));
            }}
          />
          <AppText>
            Tổng điểm từ câu hỏi:{" "}
            {doc.content?.sections?.reduce((n, s) => n + s.maxRawScore, 0) ?? 0}
          </AppText>
        </View>
      ) : null}

      {kind === "SPEAKING_PROMPT" ? (
        <View style={{ marginTop: spacing.sm }}>
          <TextField
            label="Câu tiếng Anh để đọc *"
            value={m.referenceText ?? ""}
            maxLength={2000}
            multiline
            editable={!disabled}
            error={errors["metadata.referenceText"]}
            onChangeText={(text) => meta("referenceText", text)}
          />
          <TextField
            label="Bản dịch"
            value={m.translationVi ?? ""}
            multiline
            editable={!disabled}
            onChangeText={(text) => meta("translationVi", text)}
          />
          <TextField
            label="Phiên âm IPA"
            value={m.ipaTranscript ?? ""}
            editable={!disabled}
            onChangeText={(text) => meta("ipaTranscript", text)}
          />
          <TextField
            label="Âm trọng tâm"
            value={m.phonemeTarget ?? ""}
            editable={!disabled}
            onChangeText={(text) => meta("phonemeTarget", text)}
          />
          <TextField
            label="Mẹo luyện (mỗi dòng một mẹo)"
            value={m.tips?.join("\n") ?? ""}
            multiline
            editable={!disabled}
            onChangeText={(text) =>
              meta("tips", text.split("\n").filter(Boolean))
            }
          />
        </View>
      ) : null}
    </>
  );
}
