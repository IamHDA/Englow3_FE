"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useApolloClient } from "@apollo/client/react";
import {
  IconArchive,
  IconArrowDown,
  IconCheck,
  IconDots,
  IconHistory,
  IconMessage,
  IconPencil,
  IconPlus,
  IconSearch,
  IconRestore,
} from "@tabler/icons-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isWellFormedId } from "@/shared/network/loadError";
import {
  useArchiveTutorConversationMutation,
  useRenameTutorConversationMutation,
  useRestoreTutorConversationMutation,
  useReportTutorMessageMutation,
  useTutorHistoryQuery,
  useTutorUsageQuery,
  useTutorReplyHistoryQuery,
  useSelectTutorReplyMutation,
} from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { TutorComposer } from "../../blocks/TutorComposer";
import { TutorVoiceInput } from "../../blocks/TutorVoiceInput";
import { TutorPracticeLinks } from "../../blocks/TutorPracticeLinks";
import { TutorMemoryControls } from "../../blocks/TutorMemoryControls";
import { TutorDataControls } from "../../blocks/TutorDataControls";
import { TutorMessageBubble } from "../../blocks/TutorMessageBubble";
import { TutorStarters } from "../../blocks/TutorStarters";
import { useTutorChat, type TutorMode } from "../../../hooks/useTutorChat";
import classes from "./AiTutorView.module.css";
import {
  parseTutorStudyContext,
  tutorContextParams,
  type TutorStudyContext,
} from "../../../hooks/tutorStudyContext";

export function AiTutorView() {
  const apollo = useApolloClient();
  const { isVi } = useLanguage();
  const { session } = useAuth();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const usage = useTutorUsageQuery({ fetchPolicy: "cache-and-network" });
  const chat = useTutorChat(
    undefined,
    session?.userId,
    usage.data?.tutorUsage.streaming ?? false,
  );
  const {
    conversationId,
    conversation,
    messages,
    waiting,
    sending,
    loading,
    error,
    updated,
    open,
    reset,
  } = chat;
  const [newMode, setNewMode] = useState<TutorMode>("GENERAL");
  const [learningPreference, setLearningPreference] = useState<{
    id?: string;
    value: boolean;
  } | null>(null);
  const mode =
    conversation &&
    ["GENERAL", "CORRECTION", "CONVERSATION", "PRACTICE"].includes(
      conversation.topic ?? "",
    )
      ? (conversation.topic as TutorMode)
      : newMode;
  const personalized =
    learningPreference && learningPreference.id === conversationId
      ? learningPreference.value
      : (conversation?.useLearningContext ?? true);
  const [search, setSearch] = useState("");
  const [query] = useDebouncedValue(search, 250);
  const [archived, setArchived] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [privacyEpoch, setPrivacyEpoch] = useState(0);
  const [selectedContext, setSelectedContext] = useState<
    TutorStudyContext | undefined
  >();
  const [actionError, setActionError] = useState<string | null>(null);
  const [rename, setRename] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>("INCORRECT");
  const [note, setNote] = useState("");
  const [answerHistory, setAnswerHistory] = useState<string | null>(null);
  const [branchQuestion, setBranchQuestion] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [branchText, setBranchText] = useState("");
  const selectionKeys = useRef(new Map<string, string>());
  const [selectAnswer] = useSelectTutorReplyMutation();
  const versions = useTutorReplyHistoryQuery({
    variables: {
      conversationId: conversationId ?? "",
      messageId: answerHistory ?? "",
    },
    skip: !conversationId || !answerHistory,
    fetchPolicy: "network-only",
  });
  const [actionBusy, setActionBusy] = useState(false);
  const guard = useRef(false);
  const [reportMessage] = useReportTutorMessageMutation();
  const [archiveConversation] = useArchiveTutorConversationMutation();
  const [restoreConversation] = useRestoreTutorConversationMutation();
  const [renameConversation] = useRenameTutorConversationMutation();
  const history = useTutorHistoryQuery({
    variables: { page: historyPage - 1, size: 15, search: query, archived },
    fetchPolicy: "cache-and-network",
  });

  const initialized = useRef<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const [unseen, setUnseen] = useState(false);
  const list = history.data?.tutorHistory;
  const quota = usage.data?.tutorUsage;
  const sendContext = conversationId ? undefined : selectedContext;
  const assessmentContext = conversation
    ? !!conversation.assessmentAttemptId
    : !!selectedContext?.assessmentAttemptId;
  const examContext = conversation
    ? !!conversation.examAttemptId
    : !!selectedContext?.examAttemptId;
  const hasStudyContext = conversation
    ? !!(
        conversation.quizAttemptId ||
        conversation.assessmentAttemptId ||
        conversation.examAttemptId
      )
    : !!selectedContext;
  const contextKind = assessmentContext
    ? "ASSESSMENT"
    : examContext
      ? "EXAM"
      : "QUIZ";
  const contextUnsupported =
    hasStudyContext &&
    (!quota || !quota.supportedContexts.includes(contextKind));
  const modeUnavailable = quota != null && !quota.allowedModes.includes(mode);

  useEffect(() => {
    if (!session?.userId || initialized.current === session.userId) return;
    initialized.current = session.userId;
    const params = new URL(window.location.href).searchParams;
    const id = params.get("conversation");
    const parsed = parseTutorStudyContext(params);
    const user = session.userId;
    queueMicrotask(() => {
      if (initialized.current === user) {
        setSelectedContext(parsed.context);
        setActionError(
          parsed.invalid
            ? "Liên kết ngữ cảnh không hợp lệ / Invalid study context link"
            : null,
        );
      }
    });
    if (id && isWellFormedId(id)) void open(id);
  }, [session?.userId, open]);
  useEffect(() => {
    const listener = () => {
      const params = new URL(window.location.href).searchParams;
      const id = params.get("conversation");
      const parsed = parseTutorStudyContext(params);
      setSelectedContext(parsed.context);
      setActionError(
        parsed.invalid
          ? "Liên kết ngữ cảnh không hợp lệ / Invalid study context link"
          : null,
      );
      if (id && isWellFormedId(id)) void open(id);
      else reset();
    };
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, [open, reset]);
  useEffect(() => {
    if (!conversationId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("conversation", conversationId);
    window.history.replaceState(null, "", url);
  }, [conversationId]);
  const { refetch: refetchHistory } = history;
  const { refetch: refetchUsage } = usage;
  useEffect(() => {
    void refetchHistory().catch(() => undefined);
    void refetchUsage().catch(() => undefined);
  }, [updated, refetchHistory, refetchUsage]);
  useEffect(() => {
    nearBottom.current = true;
  }, [conversationId]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (nearBottom.current) {
        bottom.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "nearest",
        });
        setUnseen(false);
      } else setUnseen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [messages.length, waiting, conversationId]);

  const choose = useCallback(
    (id: string) => {
      setDrawer(false);
      setSelectedContext(undefined);
      setActionError(null);
      const url = new URL(window.location.href);
      url.searchParams.set("conversation", id);
      for (const key of tutorContextParams) url.searchParams.delete(key);
      window.history.pushState(null, "", url);
      void open(id);
    },
    [open],
  );
  function newConversation() {
    reset();
    setActionError(null);
    setDrawer(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("conversation");
    for (const key of tutorContextParams) url.searchParams.delete(key);
    setSelectedContext(undefined);
    window.history.pushState(null, "", url);
  }
  async function action(task: () => Promise<unknown>) {
    if (guard.current) return false;
    guard.current = true;
    setActionBusy(true);
    setActionError(null);
    try {
      await task();
      await history.refetch();
      return true;
    } catch {
      setActionError(
        tr(
          "Chưa hoàn tất thao tác. Vui lòng thử lại.",
          "Could not finish this action. Please try again.",
        ),
      );
      return false;
    } finally {
      guard.current = false;
      setActionBusy(false);
    }
  }
  const historyContent = (
    <Stack gap="sm">
      <TextInput
        label={tr("Tìm cuộc trò chuyện", "Find a conversation")}
        placeholder={tr("Tìm theo tiêu đề", "Search by title")}
        leftSection={<IconSearch size={16} />}
        value={search}
        maxLength={200}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setHistoryPage(1);
        }}
      />
      <Checkbox
        checked={archived}
        label={tr("Xem mục đã lưu trữ", "Show archived")}
        onChange={(event) => {
          setArchived(event.currentTarget.checked);
          setHistoryPage(1);
        }}
      />
      {history.error && (
        <Alert color="orange">
          <Text size="sm">
            {tr("Không tải được lịch sử.", "Could not load history.")}
          </Text>
          <Button
            variant="subtle"
            onClick={() => void history.refetch().catch(() => undefined)}
          >
            {tr("Thử lại", "Try again")}
          </Button>
        </Alert>
      )}
      <ScrollArea.Autosize mah={460}>
        <Stack gap={4} aria-busy={history.loading}>
          {history.loading && !list && <Loader size="sm" />}
          {!history.loading && list?.items.length === 0 && (
            <Text size="sm" c="dimmed" py="lg">
              {query
                ? tr(
                    "Không có cuộc trò chuyện phù hợp.",
                    "No matching conversations.",
                  )
                : tr(
                    "Chưa có cuộc trò chuyện ở mục này.",
                    "No conversations in this view yet.",
                  )}
            </Text>
          )}
          {list?.items.map((thread) => (
            <UnstyledButton
              key={thread.id}
              className={classes.thread}
              data-active={conversationId === thread.id || undefined}
              onClick={() => choose(thread.id)}
            >
              <Group wrap="nowrap" align="flex-start">
                <IconMessage size={18} aria-hidden />
                <Stack gap={3} style={{ minWidth: 0 }}>
                  <Text
                    size="sm"
                    fw={conversationId === thread.id ? 700 : 500}
                    lineClamp={2}
                  >
                    {thread.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {thread.messageCount} {tr("tin nhắn", "messages")}
                  </Text>
                </Stack>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      </ScrollArea.Autosize>
      {list && list.totalPages > 1 && (
        <Pagination
          total={list.totalPages}
          value={historyPage}
          onChange={setHistoryPage}
          size="sm"
          siblings={0}
          boundaries={1}
        />
      )}
    </Stack>
  );

  return (
    <Page>
      <Stack gap="lg">
        <PageHeader
          title={tr("Gia sư AI", "AI Tutor")}
          actions={
            <Group gap="xs">
              <Button
                variant="default"
                className={classes.mobileHistory}
                hiddenFrom="md"
                leftSection={<IconHistory size={18} />}
                onClick={() => setDrawer(true)}
              >
                {tr("Lịch sử", "History")}
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={newConversation}
              >
                {tr("Cuộc trò chuyện mới", "New conversation")}
              </Button>
            </Group>
          }
        />
        <Button
          variant="subtle"
          size="compact-md"
          loading={usage.loading}
          onClick={() => void usage.refetch().catch(() => undefined)}
        >
          {tr("Cập nhật trạng thái Tutor", "Refresh Tutor availability")}
        </Button>
        <Group justify="space-between" gap="sm">
          <Text c="dimmed" size="sm">
            {tr(
              "Hỏi để hiểu, luyện để nhớ. Gia sư đồng hành cùng từng buổi học.",
              "Understand with explanations. Remember through practice.",
            )}
          </Text>
          {quota ? (
            <Badge
              variant="light"
              color={quota.remaining > 0 ? "brand" : "orange"}
              size="lg"
            >
              {tr("Còn", "Remaining")} {quota.remaining}/{quota.limit}{" "}
              {tr("lượt AI hôm nay", "AI requests today")}
            </Badge>
          ) : (
            <Button
              variant="subtle"
              size="compact-md"
              loading={usage.loading}
              onClick={() => void usage.refetch().catch(() => undefined)}
            >
              {tr("Kiểm tra hạn mức", "Check allowance")}
            </Button>
          )}
        </Group>
        {actionError && (
          <Alert color="orange" role="alert">
            {actionError}
          </Alert>
        )}
        {hasStudyContext && quota && contextUnsupported && (
          <Alert color="orange">
            {tr(
              "Môi trường này chưa hỗ trợ loại ngữ cảnh đã chọn. Hãy kiểm tra trạng thái hoặc quay lại sau khi hệ thống cập nhật; nội dung chưa được gửi AI.",
              "This environment does not support the selected study context yet. Refresh availability or return after the system is updated; no content has been sent to AI.",
            )}
          </Alert>
        )}
        {modeUnavailable && (
          <Alert color="orange">
            {tr(
              "Chế độ này đang tạm dừng. Hãy chọn chế độ khác khi tạo cuộc trò chuyện mới.",
              "This mode is paused. Choose another mode for a new conversation.",
            )}
          </Alert>
        )}
        {quota && !quota.enabled && (
          <Alert color="orange">
            {tr(
              "Gia sư đang tạm ngừng nhận câu hỏi mới. Bạn vẫn có thể xem lịch sử.",
              "The tutor is temporarily unavailable. Your conversation history is still accessible.",
            )}
            <Button
              variant="subtle"
              loading={usage.loading}
              onClick={() => void usage.refetch().catch(() => undefined)}
            >
              {tr("Kiểm tra lại trạng thái", "Check availability")}
            </Button>
          </Alert>
        )}
        <div className={classes.layout}>
          <Card
            withBorder
            radius="lg"
            p="md"
            className={classes.desktopHistory}
            visibleFrom="md"
          >
            <Stack gap="md">
              <Text fw={700}>
                {tr("Cuộc trò chuyện của bạn", "Your conversations")}
              </Text>
              {historyContent}
            </Stack>
          </Card>
          <Card
            withBorder
            radius="lg"
            p={{ base: "sm", sm: "lg" }}
            className={classes.chat}
          >
            <Stack gap="md">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text fw={700} lineClamp={1}>
                    {conversation?.title ??
                      tr(
                        "Bắt đầu một điều bạn muốn hiểu",
                        "Start with something you want to understand",
                      )}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {conversation?.archivedAt
                      ? tr(
                          "Đã lưu trữ · Khôi phục để hỏi tiếp",
                          "Archived · Restore to continue",
                        )
                      : tr(
                          "Câu hỏi được lưu trước khi AI trả lời",
                          "Your question is saved before the tutor answers",
                        )}
                  </Text>
                </Stack>
                {conversationId && conversation && (
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        size={44}
                        aria-label={tr(
                          "Quản lý cuộc trò chuyện",
                          "Manage conversation",
                        )}
                      >
                        <IconDots size={20} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconPencil size={16} />}
                        onClick={() => {
                          setTitle(conversation.title);
                          setRename(conversationId);
                        }}
                      >
                        {tr("Đổi tên", "Rename")}
                      </Menu.Item>
                      {conversation.archivedAt ? (
                        <Menu.Item
                          leftSection={<IconRestore size={16} />}
                          disabled={actionBusy}
                          onClick={() =>
                            void action(async () => {
                              await restoreConversation({
                                variables: { id: conversationId },
                              });
                              await open(conversationId);
                            })
                          }
                        >
                          {tr("Khôi phục", "Restore")}
                        </Menu.Item>
                      ) : (
                        <Menu.Item
                          leftSection={<IconArchive size={16} />}
                          disabled={actionBusy}
                          onClick={() =>
                            void action(async () => {
                              await archiveConversation({
                                variables: { id: conversationId },
                              });
                              newConversation();
                            })
                          }
                        >
                          {tr("Lưu trữ", "Archive")}
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>
              <ScrollArea.Autosize
                mah={560}
                mih={300}
                styles={{
                  content: { display: "block", width: "100%", minWidth: 0 },
                }}
                viewportRef={viewport}
                onScrollPositionChange={() => {
                  const node = viewport.current;
                  if (!node) return;
                  nearBottom.current =
                    node.scrollHeight - node.scrollTop - node.clientHeight < 80;
                  if (nearBottom.current) setUnseen(false);
                }}
              >
                <Stack gap="lg" p={{ base: 0, sm: "xs" }}>
                  {chat.hasOlder && (
                    <Button
                      variant="subtle"
                      loading={loading}
                      onClick={async () => {
                        const node = viewport.current;
                        const previous = node?.scrollHeight ?? 0;
                        await chat.loadOlder();
                        requestAnimationFrame(() => {
                          if (node)
                            node.scrollTop += node.scrollHeight - previous;
                        });
                      }}
                    >
                      {tr("Xem tin nhắn trước", "Load earlier messages")}
                    </Button>
                  )}
                  {loading && messages.length === 0 && (
                    <Group py="xl" justify="center" role="status">
                      <Loader size="sm" />
                      <Text>
                        {tr(
                          "Đang mở cuộc trò chuyện…",
                          "Opening conversation…",
                        )}
                      </Text>
                    </Group>
                  )}
                  {!loading && messages.length === 0 && !conversationId && (
                    <Stack py="xl" gap="lg">
                      <Text fw={600} size="lg">
                        {tr(
                          "Hôm nay mình cùng luyện gì?",
                          "What would you like to practise?",
                        )}
                      </Text>
                      <TutorStarters
                        disabled={
                          sending ||
                          chat.unconfirmed ||
                          contextUnsupported ||
                          modeUnavailable ||
                          quota?.enabled === false ||
                          quota?.remaining === 0
                        }
                        onPick={(text) =>
                          void chat.send(text, mode, personalized, sendContext)
                        }
                      />
                    </Stack>
                  )}
                  {messages.map((message, index) => (
                    <TutorMessageBubble
                      key={message.id}
                      message={message}
                      last={
                        index === messages.length - 1 &&
                        !conversation?.archivedAt
                      }
                      disabled={sending || actionBusy}
                      onHistory={setAnswerHistory}
                      onBranch={
                        contextUnsupported
                          ? undefined
                          : (id, text) => {
                              setBranchQuestion({ id, text });
                              setBranchText(text);
                            }
                      }
                      onReport={(id) => {
                        setReport(id);
                        setNote("");
                        setReason("INCORRECT");
                      }}
                      onRetry={
                        contextUnsupported
                          ? undefined
                          : (id) => void chat.restart(id)
                      }
                      onRegenerate={
                        contextUnsupported
                          ? undefined
                          : (id) => void chat.restart(id, true)
                      }
                      onCancel={(id) => void chat.cancel(id)}
                    />
                  ))}
                  <div ref={bottom} />
                </Stack>
              </ScrollArea.Autosize>
              {unseen && (
                <Button
                  variant="light"
                  leftSection={<IconArrowDown size={16} />}
                  onClick={() => {
                    nearBottom.current = true;
                    setUnseen(false);
                    bottom.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }}
                >
                  {tr(
                    "Có câu trả lời mới · Xuống cuối",
                    "New reply · Scroll down",
                  )}
                </Button>
              )}
              {(error || chat.unconfirmed) && (
                <Alert color="orange" role="alert">
                  <Stack gap="xs">
                    <Text size="sm">
                      {error ??
                        tr(
                          "Có yêu cầu chưa xác nhận giao nhận.",
                          "A request is awaiting delivery confirmation.",
                        )}
                    </Text>
                    <Group>
                      {chat.unconfirmed ? (
                        <Button
                          variant="light"
                          loading={sending}
                          onClick={() => void chat.recover()}
                        >
                          {tr("Kiểm tra giao nhận", "Check delivery")}
                        </Button>
                      ) : (
                        conversationId && (
                          <Button
                            variant="light"
                            disabled={sending}
                            onClick={() => void open(conversationId)}
                          >
                            {tr("Kiểm tra câu trả lời", "Check reply")}
                          </Button>
                        )
                      )}
                    </Group>
                  </Stack>
                </Alert>
              )}
              {!conversation?.archivedAt && (
                <Stack gap="sm">
                  <Group align="flex-end">
                    <Select
                      label={tr("Cách học", "Learning mode")}
                      value={mode}
                      allowDeselect={false}
                      onChange={(value) => setNewMode(value as TutorMode)}
                      disabled={waiting || sending || !!conversationId}
                      data={[
                        {
                          value: "GENERAL",
                          disabled:
                            quota != null &&
                            !quota.allowedModes.includes("GENERAL"),
                          label: tr("Hỏi và giải thích", "Ask and explain"),
                        },
                        {
                          value: "CORRECTION",
                          disabled:
                            quota != null &&
                            !quota.allowedModes.includes("CORRECTION"),
                          label: tr("Sửa câu / đoạn văn", "Correct my writing"),
                        },
                        {
                          value: "CONVERSATION",
                          disabled:
                            quota != null &&
                            !quota.allowedModes.includes("CONVERSATION"),
                          label: tr("Luyện hội thoại", "Conversation practice"),
                        },
                        {
                          value: "PRACTICE",
                          disabled:
                            quota != null &&
                            !quota.allowedModes.includes("PRACTICE"),
                          label: tr("Bài tập ngắn", "Quick practice"),
                        },
                      ]}
                      style={{ minWidth: 180 }}
                    />
                    <Checkbox
                      checked={personalized}
                      onChange={(event) =>
                        setLearningPreference({
                          id: conversationId,
                          value: event.currentTarget.checked,
                        })
                      }
                      label={tr(
                        "Dùng trình độ và mục tiêu học",
                        "Use my level and learning goal",
                      )}
                      disabled={sending || waiting}
                    />
                  </Group>
                  {hasStudyContext && (
                    <Card withBorder radius="md" bg="brand.0">
                      <Stack gap="xs">
                        <Text size="sm" fw={600}>
                          {tr(
                            assessmentContext
                              ? "Ngữ cảnh: bài Viết/Nói đã chấm"
                              : examContext
                                ? "Ngữ cảnh: câu thi đã chấm"
                                : "Ngữ cảnh: một câu Quiz đã nộp",
                            assessmentContext
                              ? "Context: an assessed Writing/Speaking submission"
                              : examContext
                                ? "Context: a scored exam question"
                                : "Context: a submitted quiz question",
                          )}
                        </Text>
                        <Text size="sm">
                          {tr(
                            "Nhập điều bạn chưa hiểu, hoặc nhờ Tutor giải thích câu này.",
                            "Ask about the part you do not understand, or request an explanation.",
                          )}
                        </Text>
                        {selectedContext && !conversationId && (
                          <Button
                            variant="light"
                            disabled={
                              waiting ||
                              sending ||
                              chat.unconfirmed ||
                              contextUnsupported ||
                              modeUnavailable ||
                              quota?.enabled === false ||
                              quota?.remaining === 0
                            }
                            onClick={() =>
                              void chat.send(
                                tr(
                                  assessmentContext
                                    ? "Giải thích phản hồi cho bài đã chấm này và hướng dẫn tôi cải thiện."
                                    : "Giải thích câu đã chấm này và lý do của đáp án.",
                                  assessmentContext
                                    ? "Explain the feedback for this assessed submission and help me improve."
                                    : "Explain this completed question and the reason for its answer.",
                                ),
                                mode,
                                personalized,
                                sendContext,
                              )
                            }
                          >
                            {tr(
                              assessmentContext
                                ? "Giải thích phản hồi"
                                : "Giải thích câu này",
                              assessmentContext
                                ? "Explain the feedback"
                                : "Explain this question",
                            )}
                          </Button>
                        )}
                      </Stack>
                    </Card>
                  )}
                  {mode === "PRACTICE" && <TutorPracticeLinks />}
                  <TutorComposer
                    key={`${session?.userId}:${conversationId ?? "new"}:${privacyEpoch}`}
                    draftKey={
                      session?.userId
                        ? `englow:tutor:draft:${session.userId}:${conversationId ?? "new"}`
                        : undefined
                    }
                    onSend={(text) =>
                      chat.send(text, mode, personalized, sendContext)
                    }
                    disabled={
                      sending ||
                      waiting ||
                      loading ||
                      chat.unconfirmed ||
                      contextUnsupported ||
                      modeUnavailable ||
                      quota?.enabled === false ||
                      quota?.remaining === 0
                    }
                  />
                  {quota?.voice && session?.userId && (
                    <TutorVoiceInput
                      key={`${session.userId}:${privacyEpoch}`}
                      account={session.userId}
                      acceptedDelivery={chat.acceptedDelivery}
                      disabled={
                        sending ||
                        waiting ||
                        loading ||
                        chat.unconfirmed ||
                        contextUnsupported ||
                        modeUnavailable ||
                        quota.remaining === 0
                      }
                      onConfirm={(text) =>
                        chat.send(text, mode, personalized, sendContext)
                      }
                    />
                  )}
                  <Text size="xs" c="dimmed">
                    {tr(
                      "AI có thể mắc lỗi. Hạn mức dùng chung với chấm Viết và Nói; bấm báo cáo nếu câu trả lời chưa đúng.",
                      "AI can make mistakes. Your allowance is shared with Writing and Speaking; report answers that need correction.",
                    )}
                  </Text>
                </Stack>
              )}
            </Stack>
          </Card>
        </div>
        {conversationId && quota?.memorySupported && (
          <TutorMemoryControls
            key={`${session?.userId}:${conversationId}`}
            conversationId={conversationId}
            busy={sending || waiting || loading || chat.unconfirmed}
            updated={updated}
            archived={!!conversation?.archivedAt}
            canSummarize={
              quota.remaining > 0 && !contextUnsupported && !modeUnavailable
            }
            onSummarize={chat.summarize}
          />
        )}
        {session?.userId && (
          <TutorDataControls
            key={session.userId}
            account={session.userId}
            includeMemory={quota?.memorySupported ?? false}
            disabled={sending || loading || !quota}
            onPurged={() => {
              chat.forget();
              setPrivacyEpoch((value) => value + 1);
              newConversation();
              void apollo
                .clearStore()
                .then(() => Promise.all([history.refetch(), usage.refetch()]))
                .catch(() => undefined);
            }}
          />
        )}
        <Modal
          opened={!!branchQuestion}
          onClose={() => !sending && setBranchQuestion(null)}
          title={tr(
            "Sửa câu hỏi trong cuộc trò chuyện mới",
            "Edit question in a new conversation",
          )}
        >
          <Stack>
            <Text size="sm">
              {tr(
                "Giữ nguyên cuộc trò chuyện gốc và mang theo tối đa 10 tin nhắn trước câu hỏi này. Một lượt AI mới sẽ được dùng.",
                "Your original conversation is preserved. Up to ten earlier messages are copied into a new conversation. Uses one AI request.",
              )}
            </Text>
            <Textarea
              label={tr("Câu hỏi đã sửa", "Edited question")}
              value={branchText}
              maxLength={4000}
              onChange={(event) => setBranchText(event.currentTarget.value)}
              autosize
              minRows={3}
            />
            {error && <Alert color="orange">{error}</Alert>}
            <Button
              loading={sending}
              disabled={!branchText.trim() || chat.unconfirmed || waiting}
              onClick={async () => {
                if (
                  branchQuestion &&
                  (await chat.branch(
                    branchQuestion.id,
                    branchText,
                    personalized,
                  ))
                )
                  setBranchQuestion(null);
              }}
            >
              {tr("Tạo nhánh và hỏi Tutor", "Create branch and ask Tutor")}
            </Button>
          </Stack>
        </Modal>
        <Modal
          opened={!!answerHistory}
          onClose={() => !actionBusy && setAnswerHistory(null)}
          title={tr("Lịch sử đáp án", "Answer history")}
          size="lg"
        >
          <Stack>
            {versions.loading && <Loader size="sm" />}
            {versions.error && (
              <Alert color="orange">
                {tr(
                  "Không tải được lịch sử đáp án.",
                  "Could not load answer history.",
                )}
                <Button
                  variant="subtle"
                  onClick={() => void versions.refetch().catch(() => undefined)}
                >
                  {tr("Thử lại", "Retry")}
                </Button>
              </Alert>
            )}
            {actionError && <Alert color="orange">{actionError}</Alert>}
            {versions.data?.tutorReplyHistory.items.map((version) => (
              <Card key={version.revision} withBorder radius="md">
                <Stack gap="xs">
                  <Text fw={600}>
                    {tr("Phiên bản", "Version")} {version.revision + 1}
                    {version.revision ===
                    versions.data?.tutorReplyHistory.currentRevision
                      ? tr(" · đang dùng", " · selected")
                      : ""}
                  </Text>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {version.content ||
                      tr(
                        "Phiên bản này chưa có câu trả lời hoàn chỉnh.",
                        "This version has no complete answer.",
                      )}
                  </Text>
                  {version.correction && (
                    <Alert
                      color="brand"
                      title={tr(
                        "Đính chính đã được duyệt",
                        "Approved correction",
                      )}
                    >
                      <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                        {version.correction}
                      </Text>
                    </Alert>
                  )}
                  {versions.data?.tutorReplyHistory.canSelect &&
                    version.status === "READY" &&
                    version.revision !==
                      versions.data.tutorReplyHistory.currentRevision && (
                      <Button
                        variant="light"
                        loading={actionBusy}
                        onClick={() =>
                          void action(async () => {
                            if (!conversationId || !answerHistory) return;
                            const key = `${answerHistory}:${versions.data?.tutorReplyHistory.currentRevision}:${version.revision}`;
                            if (!selectionKeys.current.has(key))
                              selectionKeys.current.set(
                                key,
                                crypto.randomUUID(),
                              );
                            await selectAnswer({
                              variables: {
                                conversationId,
                                messageId: answerHistory,
                                revision: version.revision,
                                clientMessageId:
                                  selectionKeys.current.get(key)!,
                              },
                            });
                            await open(conversationId);
                            setAnswerHistory(null);
                          })
                        }
                      >
                        {tr(
                          "Dùng đáp án này · không gọi AI",
                          "Use this answer · no AI request",
                        )}
                      </Button>
                    )}
                </Stack>
              </Card>
            ))}
            {versions.data && !versions.data.tutorReplyHistory.canSelect && (
              <Text size="sm" c="dimmed">
                {tr(
                  "Đáp án đã có lượt tiếp theo chỉ được xem lại để giữ nguyên ngữ cảnh. Có thể sửa câu hỏi để tạo nhánh mới.",
                  "Earlier answers are read-only once the conversation continues. Edit a question to create a new branch.",
                )}
              </Text>
            )}
          </Stack>
        </Modal>
        <Drawer
          opened={drawer}
          onClose={() => setDrawer(false)}
          title={tr("Lịch sử trò chuyện", "Conversation history")}
          size="sm"
        >
          {historyContent}
        </Drawer>
        <Modal
          opened={rename !== null}
          onClose={() => !actionBusy && setRename(null)}
          title={tr("Đổi tên cuộc trò chuyện", "Rename conversation")}
        >
          <Stack>
            <TextInput
              label={tr("Tên cuộc trò chuyện", "Conversation title")}
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              data-autofocus
            />
            <Button
              loading={actionBusy}
              disabled={!title.trim()}
              onClick={() => {
                if (rename)
                  void action(async () => {
                    await renameConversation({
                      variables: { id: rename, title: title.trim() },
                    });
                    setRename(null);
                    if (conversationId === rename) await open(rename);
                  });
              }}
            >
              {tr("Lưu tên", "Save title")}
            </Button>
          </Stack>
        </Modal>
        <Modal
          opened={report !== null}
          onClose={() => !actionBusy && setReport(null)}
          title={tr("Báo cáo câu trả lời", "Report answer")}
        >
          <Stack>
            <Select
              label={tr("Lý do", "Reason")}
              allowDeselect={false}
              value={reason}
              onChange={setReason}
              data={[
                {
                  value: "INCORRECT",
                  label: tr("Kiến thức chưa đúng", "Incorrect explanation"),
                },
                {
                  value: "UNSUITABLE",
                  label: tr("Không phù hợp", "Inappropriate"),
                },
                { value: "OTHER", label: tr("Vấn đề khác", "Other issue") },
              ]}
            />
            <Textarea
              label={tr("Ghi chú (không bắt buộc)", "Note (optional)")}
              maxLength={800}
              value={note}
              onChange={(event) => setNote(event.currentTarget.value)}
            />
            <Text size="xs" c="dimmed">
              {tr(
                "Người phụ trách sẽ xem câu trả lời và phần ngữ cảnh cần thiết để xử lý báo cáo.",
                "A reviewer will see this reply and the context needed to investigate.",
              )}
            </Text>
            <Button
              loading={actionBusy}
              leftSection={<IconCheck size={16} />}
              onClick={() => {
                if (conversationId && report)
                  void action(async () => {
                    await reportMessage({
                      variables: {
                        conversationId,
                        messageId: report,
                        note: `${reason}: ${note}`,
                      },
                    });
                    setReport(null);
                    await open(conversationId);
                  });
              }}
            >
              {tr("Gửi báo cáo", "Send report")}
            </Button>
          </Stack>
        </Modal>
      </Stack>
    </Page>
  );
}
