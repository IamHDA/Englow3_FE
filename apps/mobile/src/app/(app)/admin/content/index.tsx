import { Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { CONTENT_ERRORS } from "@/features/content/errors";
import { ImportPanel } from "@/features/content/ImportPanel";
import { useAuth } from "@/features/auth/AuthProvider";
import { formatDateTime } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  ContentKind,
  ContentStatus,
  useAdminContentQuery,
  useApproveContentMutation,
  useArchiveContentMutation,
  usePublishContentMutation,
  useRejectContentMutation,
  useRestoreContentMutation,
  useSubmitContentForReviewMutation,
  type ContentReviewFieldsFragment,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Notice,
  Pager,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { OptionPicker } from "@/ui/OptionPicker";
import { QueryView } from "@/ui/QueryView";
import { usePrompt } from "@/ui/usePrompt";
import { spacing } from "@/ui/theme";

const KINDS: [ContentKind, string][] = [
  [ContentKind.FLASHCARD_SET, "Thẻ từ"],
  [ContentKind.QUIZ, "Quiz"],
  [ContentKind.DICTATION_LESSON, "Nghe chép"],
  [ContentKind.SPEAKING_PROMPT, "Phát âm"],
  [ContentKind.TRANSLATION_SET, "Dịch"],
];

const STATUS_LABELS: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: "Nháp",
  [ContentStatus.PENDING_REVIEW]: "Chờ duyệt",
  [ContentStatus.REJECTED]: "Bị trả lại",
  [ContentStatus.PUBLISHED]: "Đã xuất bản",
  [ContentStatus.ARCHIVED]: "Lưu trữ",
};

/**
 * Which steps each status allows, as the web's CONTENT_ACTIONS_BY_STATUS.
 * Only hides buttons; the backend decides.
 */
const ACTIONS: Record<
  ContentStatus,
  {
    submit: boolean;
    approve: boolean;
    reject: boolean;
    publish: boolean;
    archive: boolean;
    restore?: boolean;
  }
> = {
  [ContentStatus.DRAFT]: {
    submit: true,
    approve: false,
    reject: false,
    publish: true,
    archive: true,
  },
  [ContentStatus.PENDING_REVIEW]: {
    submit: false,
    approve: true,
    reject: true,
    publish: false,
    archive: true,
  },
  [ContentStatus.REJECTED]: {
    submit: true,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ContentStatus.PUBLISHED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ContentStatus.ARCHIVED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: false,
    restore: true,
  },
};

/** Learning content of every kind: write, submit, review, publish. As the web's AdminContentView. */
export default function AdminContentScreen() {
  const { me } = useAuth();
  const canReview = me?.role === "ADMIN";
  const [kind, setKind] = useState<ContentKind>(ContentKind.FLASHCARD_SET);
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importInto, setImportInto] = useState("");
  const [notice, setNotice] = useState<{
    text: string;
    tone: "success" | "danger";
  } | null>(null);
  const pending = useRef(false);
  const prompt = usePrompt();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const content = useAdminContentQuery({
    variables: { kind, status, title: title || null, page, size: 20 },
    fetchPolicy: "cache-and-network",
  });
  const [submit] = useSubmitContentForReviewMutation();
  const [approve] = useApproveContentMutation();
  const [reject] = useRejectContentMutation();
  const [publish] = usePublishContentMutation();
  const [archive] = useArchiveContentMutation();
  const [restore] = useRestoreContentMutation();

  async function run(id: string, action: () => Promise<unknown>, done: string) {
    if (pending.current) return;
    pending.current = true;
    setBusyId(id);
    setNotice(null);
    try {
      await action();
      setNotice({ text: done, tone: "success" });
      await content.refetch().catch(() => undefined);
    } catch (failure) {
      setNotice({
        text: errorMessage(failure, CONTENT_ERRORS),
        tone: "danger",
      });
    } finally {
      pending.current = false;
      setBusyId(null);
    }
  }

  async function rejectWithNote(item: ContentReviewFieldsFragment) {
    const note = await prompt.ask({
      title: "Trả lại nội dung",
      message: "Tác giả sẽ thấy lý do này.",
      multiline: true,
      confirmLabel: "Trả lại",
    });
    if (note)
      await run(
        item.id,
        () => reject({ variables: { kind, id: item.id, note } }),
        "Đã trả lại.",
      );
  }

  function confirmArchive(item: ContentReviewFieldsFragment) {
    Alert.alert(
      "Lưu trữ nội dung?",
      "Nội dung sẽ ẩn khỏi thư viện; lịch sử học được giữ.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Lưu trữ",
          style: "destructive",
          onPress: () =>
            void run(
              item.id,
              () => archive({ variables: { kind, id: item.id } }),
              "Đã lưu trữ.",
            ),
        },
      ],
    );
  }

  const items = content.data?.adminContent.items ?? [];
  const draftSets = items.filter((item) => item.status === ContentStatus.DRAFT);

  return (
    <Screen
      refreshing={content.loading && Boolean(content.data)}
      onRefresh={() => void content.refetch()}
    >
      {prompt.element}
      <Stack.Screen options={{ title: "Nội dung học" }} />
      <Button
        title="Tạo mới"
        icon="add"
        onPress={() =>
          router.push({
            pathname: "/admin/content/editor/[kind]/[id]",
            params: { kind, id: "new" },
          })
        }
        style={{ marginBottom: spacing.sm }}
      />
      <ChipRow>
        {KINDS.map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            selected={kind === value}
            onPress={() => {
              setKind(value);
              setPage(0);
              setImportInto("");
            }}
          />
        ))}
      </ChipRow>
      <ChipRow>
        <Chip
          label="Tất cả"
          selected={status === null}
          onPress={() => {
            setStatus(null);
            setPage(0);
          }}
        />
        {(Object.keys(STATUS_LABELS) as ContentStatus[]).map((value) => (
          <Chip
            key={value}
            label={STATUS_LABELS[value]}
            selected={status === value}
            onPress={() => {
              setStatus(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <TextField
        placeholder="Tìm theo tiêu đề"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />

      {kind === ContentKind.DICTATION_LESSON ? (
        <ImportPanel kind="dictation" />
      ) : null}
      {kind === ContentKind.FLASHCARD_SET && draftSets.length > 0 ? (
        <>
          <OptionPicker
            label="Nhập thẻ vào bộ nháp"
            placeholder="Chọn một bộ còn nháp"
            value={importInto}
            options={draftSets.map((set) => ({
              value: set.id,
              label: set.title,
            }))}
            onChange={setImportInto}
          />
          {importInto ? (
            <ImportPanel
              key={importInto}
              kind="flashcards"
              setId={importInto}
            />
          ) : null}
        </>
      ) : null}

      <Notice message={notice?.text} tone={notice?.tone} />
      <QueryView
        loading={content.loading}
        error={content.error}
        data={content.data?.adminContent}
        onRetry={() => void content.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState icon="library-outline" title="Không có nội dung nào" />
        }
      >
        {(data) => (
          <>
            {data.items.map((item) => {
              const actions = ACTIONS[item.status];
              const busy = busyId === item.id;
              const editable =
                item.status === ContentStatus.DRAFT ||
                item.status === ContentStatus.REJECTED;
              return (
                <Card key={item.id} style={{ marginBottom: spacing.sm }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <AppText variant="label" style={{ flex: 1 }}>
                      {item.title}
                    </AppText>
                    <Badge label={STATUS_LABELS[item.status]} tone="neutral" />
                  </Row>
                  <AppText variant="caption" tone="muted">
                    {item.itemCount} mục ·{" "}
                    {item.submittedForReviewAt
                      ? `gửi duyệt ${formatDateTime(item.submittedForReviewAt)}`
                      : `tạo ${formatDateTime(item.createdAt)}`}
                  </AppText>
                  {item.reviewNote ? (
                    <AppText variant="caption" tone="danger">
                      Lý do trả lại: {item.reviewNote}
                    </AppText>
                  ) : null}
                  <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
                    <Button
                      title={editable ? "Soạn / xem trước" : "Xem nội dung"}
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        router.push({
                          pathname: "/admin/content/editor/[kind]/[id]",
                          params: { kind, id: item.id },
                        })
                      }
                    />
                    {actions.submit ? (
                      <Button
                        title="Gửi duyệt"
                        size="sm"
                        variant="secondary"
                        loading={busy}
                        onPress={() =>
                          void run(
                            item.id,
                            () => submit({ variables: { kind, id: item.id } }),
                            "Đã gửi duyệt.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.approve ? (
                      <Button
                        title="Duyệt"
                        size="sm"
                        loading={busy}
                        onPress={() =>
                          void run(
                            item.id,
                            () => approve({ variables: { kind, id: item.id } }),
                            "Đã duyệt và xuất bản.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.reject ? (
                      <Button
                        title="Trả lại"
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onPress={() => void rejectWithNote(item)}
                      />
                    ) : null}
                    {canReview && actions.publish ? (
                      <Button
                        title="Xuất bản"
                        size="sm"
                        loading={busy}
                        onPress={() =>
                          void run(
                            item.id,
                            () => publish({ variables: { kind, id: item.id } }),
                            "Đã xuất bản.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.restore ? (
                      <Button
                        title="Khôi phục"
                        size="sm"
                        variant="secondary"
                        loading={busy}
                        onPress={() =>
                          void run(
                            item.id,
                            () => restore({ variables: { kind, id: item.id } }),
                            "Đã khôi phục.",
                          )
                        }
                      />
                    ) : null}
                    {canReview && actions.archive ? (
                      <Button
                        title="Lưu trữ"
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onPress={() => confirmArchive(item)}
                      />
                    ) : null}
                  </Row>
                </Card>
              );
            })}
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
            />
          </>
        )}
      </QueryView>
    </Screen>
  );
}
