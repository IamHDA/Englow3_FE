import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { transcribe } from "@/features/tutor/voice";
import { errorMessage } from "@/lib/errors";
import {
  TutorMessageRole,
  TutorMessageStatus,
  useArchiveTutorConversationMutation,
  useCancelTutorReplyMutation,
  useRegenerateTutorReplyMutation,
  useRenameTutorConversationMutation,
  useReportTutorMessageMutation,
  useRetryTutorReplyMutation,
  useSendTutorMessageMutation,
  useTutorConversationQuery,
  useTutorUsageQuery,
  type TutorMessageFieldsFragment,
} from "@/lib/graphql/generated";
import { randomUUID } from "@/lib/uuid";
import { useRecorder } from "@/ui/audio";
import { usePrompt } from "@/ui/usePrompt";
import {
  AppText,
  Chip,
  ChipRow,
  ErrorState,
  LoadingState,
  Notice,
} from "@/ui/components";
import { colors, fontSize, radius, spacing } from "@/ui/theme";

const MODES: { value: string; label: string }[] = [
  { value: "GENERAL", label: "Hỏi đáp" },
  { value: "CORRECTION", label: "Sửa lỗi" },
  { value: "CONVERSATION", label: "Hội thoại" },
  { value: "PRACTICE", label: "Luyện tập" },
];

const TUTOR_ERRORS: Record<string, string> = {
  TUTOR_DISABLED: "Gia sư AI đang tạm tắt.",
  TUTOR_QUOTA_EXCEEDED: "Bạn đã dùng hết lượt hỏi hôm nay.",
  TUTOR_MESSAGE_TOO_LONG: "Tin nhắn quá dài.",
};

export default function TutorChatScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [conversationId, setConversationId] = useState<string | null>(
    params.id === "new" ? null : params.id,
  );
  const conversation = useTutorConversationQuery({
    variables: { id: conversationId ?? "" },
    skip: conversationId === null,
    fetchPolicy: "cache-and-network",
  });
  const usage = useTutorUsageQuery({ fetchPolicy: "cache-and-network" });
  const [send, sendState] = useSendTutorMessageMutation();
  const [cancel] = useCancelTutorReplyMutation();
  const [retry] = useRetryTutorReplyMutation();
  const [regenerate] = useRegenerateTutorReplyMutation();
  const [report] = useReportTutorMessageMutation();
  const [archive] = useArchiveTutorConversationMutation();
  const [rename] = useRenameTutorConversationMutation();
  const [text, setText] = useState("");
  const [mode, setMode] = useState("GENERAL");
  const [error, setError] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useRecorder(120);
  const list = useRef<FlatList<TutorMessageFieldsFragment>>(null);
  const prompt = usePrompt();

  const quota = usage.data?.tutorUsage;
  const allowedModes = MODES.filter(
    (item) => !quota || quota.allowedModes.includes(item.value),
  );
  const messages = [
    ...(conversation.data?.tutorConversation.conversation
      ? conversation.data.tutorConversation.messages
      : []),
  ].sort((a, b) => a.orderNo - b.orderNo);
  const pending = messages.some(
    (message) => message.status === TutorMessageStatus.PENDING,
  );
  const title =
    conversation.data?.tutorConversation.conversation.title || "Gia sư AI";
  const { startPolling, stopPolling } = conversation;

  // While a reply is being written, re-read the conversation; the BFF also
  // streams, but a short poll works on every network and needs no extra client.
  useEffect(() => {
    if (!pending) return;
    startPolling(1500);
    return () => stopPolling();
  }, [pending, startPolling, stopPolling]);

  // Follow the newest message, including a reply that is still growing.
  const lastContent = messages[messages.length - 1]?.content;
  useEffect(() => {
    if (messages.length)
      setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length, lastContent]);

  async function submit() {
    const message = text.trim();
    if (!message || sendState.loading) return;
    setError(null);
    try {
      const { data } = await send({
        variables: {
          conversationId,
          message,
          clientMessageId: randomUUID(),
          mode,
        },
      });
      if (data) {
        setText("");
        const id = data.sendTutorMessage.conversation.id;
        if (!conversationId) {
          setConversationId(id);
          router.setParams({ id });
        } else {
          void conversation.refetch();
        }
        void usage.refetch();
      }
    } catch (failure) {
      setError(errorMessage(failure, TUTOR_ERRORS));
    }
  }

  async function toggleVoice() {
    if (recorder.isRecording) {
      const recording = await recorder.stop();
      if (!recording) return;
      setTranscribing(true);
      setError(null);
      try {
        const transcript = await transcribe(recording, randomUUID());
        setText((current) =>
          current ? `${current} ${transcript}` : transcript,
        );
      } catch {
        setError(
          "Chưa nhận dạng được giọng nói. Hãy thử lại hoặc gõ tin nhắn.",
        );
      } finally {
        setTranscribing(false);
      }
    } else {
      await recorder.start();
    }
  }

  function messageActions(message: TutorMessageFieldsFragment) {
    if (!conversationId || message.role !== TutorMessageRole.ASSISTANT) return;
    const options: {
      text: string;
      onPress: () => void;
      style?: "destructive" | "cancel";
    }[] = [];
    if (message.status === TutorMessageStatus.READY) {
      options.push({
        text: "Tạo câu trả lời khác",
        onPress: () =>
          void regenerate({
            variables: {
              conversationId,
              messageId: message.id,
              clientMessageId: randomUUID(),
            },
          })
            .then(() => conversation.refetch())
            .catch((failure) => setError(errorMessage(failure, TUTOR_ERRORS))),
      });
      if (!message.reported) {
        options.push({
          text: "Báo cáo câu trả lời",
          style: "destructive",
          onPress: () =>
            void report({
              variables: { conversationId, messageId: message.id },
            })
              .then(() =>
                Alert.alert(
                  "Đã gửi báo cáo",
                  "Cảm ơn bạn. Nhân viên sẽ xem lại câu trả lời này.",
                ),
              )
              .catch((failure) => setError(errorMessage(failure))),
        });
      }
    }
    options.push({ text: "Đóng", onPress: () => undefined, style: "cancel" });
    Alert.alert("Câu trả lời", undefined, options);
  }

  function headerMenu() {
    if (!conversationId) return;
    Alert.alert(title, undefined, [
      {
        text: "Đổi tên",
        onPress: () =>
          void prompt
            .ask({
              title: "Đổi tên cuộc trò chuyện",
              initial: title,
              confirmLabel: "Lưu",
            })
            .then((value) => {
              if (value)
                void rename({
                  variables: { id: conversationId, title: value },
                });
            }),
      },
      {
        text: "Lưu trữ",
        style: "destructive",
        onPress: () =>
          void archive({ variables: { id: conversationId } }).then(() =>
            router.back(),
          ),
      },
      { text: "Đóng", style: "cancel" },
    ]);
  }

  const disabled = Boolean(quota && (!quota.enabled || quota.remaining <= 0));

  return (
    <SafeAreaView style={styles.flex} edges={["bottom", "left", "right"]}>
      {prompt.element}
      <Stack.Screen
        options={{
          title,
          headerRight: () =>
            conversationId ? (
              <Pressable
                onPress={headerMenu}
                accessibilityLabel="Tuỳ chọn cuộc trò chuyện"
                hitSlop={8}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color={colors.primary}
                />
              </Pressable>
            ) : null,
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {conversationId && conversation.loading && !conversation.data ? (
          <LoadingState />
        ) : conversationId && conversation.error && !conversation.data ? (
          <ErrorState
            message={errorMessage(conversation.error)}
            onRetry={() => void conversation.refetch()}
          />
        ) : (
          <FlatList
            ref={list}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding: spacing.lg,
              gap: spacing.md,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="sparkles" size={36} color={colors.primary} />
                <AppText variant="heading">Bạn muốn hỏi gì?</AppText>
                <AppText tone="muted" style={{ textAlign: "center" }}>
                  Ví dụ: “Khi nào dùng present perfect?”, “Sửa giúp tôi câu
                  này”, “Luyện phỏng vấn xin việc bằng tiếng Anh”.
                </AppText>
              </View>
            }
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onLongPress={() => messageActions(item)}
                onCancel={() =>
                  conversationId &&
                  void cancel({
                    variables: { conversationId, messageId: item.id },
                  }).then(() => conversation.refetch())
                }
                onRetry={() =>
                  conversationId &&
                  void retry({
                    variables: {
                      conversationId,
                      messageId: item.id,
                      clientMessageId: randomUUID(),
                    },
                  })
                    .then(() => conversation.refetch())
                    .catch((failure) =>
                      setError(errorMessage(failure, TUTOR_ERRORS)),
                    )
                }
              />
            )}
          />
        )}

        <View style={styles.composer}>
          <Notice message={error ?? recorder.error} />
          {disabled ? (
            <Notice
              tone="info"
              message={
                quota?.enabled
                  ? "Bạn đã dùng hết lượt hỏi hôm nay."
                  : "Gia sư AI đang tạm tắt."
              }
            />
          ) : null}
          <ChipRow>
            {allowedModes.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                selected={mode === item.value}
                onPress={() => setMode(item.value)}
              />
            ))}
          </ChipRow>
          <View style={styles.inputRow}>
            {quota?.voice !== false ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  recorder.isRecording ? "Dừng ghi âm" : "Nói thay vì gõ"
                }
                onPress={() => void toggleVoice()}
                disabled={disabled || transcribing}
                style={[
                  styles.iconButton,
                  recorder.isRecording && { backgroundColor: colors.danger },
                ]}
              >
                {transcribing ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Ionicons
                    name={recorder.isRecording ? "stop" : "mic-outline"}
                    size={20}
                    color={recorder.isRecording ? colors.white : colors.primary}
                  />
                )}
              </Pressable>
            ) : null}
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={
                recorder.isRecording
                  ? `Đang nghe… ${recorder.seconds}s`
                  : "Nhắn cho gia sư…"
              }
              placeholderTextColor={colors.textFaint}
              multiline
              maxLength={quota?.maxMessageLength ?? 4000}
              editable={!disabled}
              style={styles.input}
              accessibilityLabel="Tin nhắn"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi"
              onPress={() => void submit()}
              disabled={!text.trim() || sendState.loading || disabled}
              style={[
                styles.send,
                (!text.trim() || disabled) && { opacity: 0.4 },
              ]}
            >
              {sendState.loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Ionicons name="arrow-up" size={20} color={colors.white} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({
  message,
  onLongPress,
  onCancel,
  onRetry,
}: {
  message: TutorMessageFieldsFragment;
  onLongPress: () => void;
  onCancel: () => void;
  onRetry: () => void;
}) {
  const mine = message.role === TutorMessageRole.USER;
  const pending = message.status === TutorMessageStatus.PENDING;
  const failed =
    message.status === TutorMessageStatus.FAILED ||
    message.status === TutorMessageStatus.CANCELLED;
  return (
    <Pressable
      onLongPress={onLongPress}
      style={[styles.bubble, mine ? styles.mine : styles.theirs]}
    >
      {message.content ? (
        <AppText tone={mine ? "inverse" : "default"} selectable>
          {message.content}
        </AppText>
      ) : null}
      {message.correction ? (
        <View style={styles.correction}>
          <AppText variant="caption" tone="success">
            Gợi ý sửa: {message.correction}
          </AppText>
        </View>
      ) : null}
      {pending ? (
        <View style={styles.pendingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" tone="muted">
            Gia sư đang trả lời…
          </AppText>
          <Pressable onPress={onCancel} accessibilityRole="button" hitSlop={6}>
            <AppText variant="caption" tone="danger">
              Dừng
            </AppText>
          </Pressable>
        </View>
      ) : null}
      {failed && !mine ? (
        <View style={styles.pendingRow}>
          <AppText variant="caption" tone="danger">
            {message.status === TutorMessageStatus.CANCELLED
              ? "Đã dừng."
              : "Chưa trả lời được."}
          </AppText>
          <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={6}>
            <AppText variant="caption" tone="primary">
              Thử lại
            </AppText>
          </Pressable>
        </View>
      ) : null}
      {message.sources.length > 0 ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginTop: spacing.xs }}
        >
          Nguồn:{" "}
          {message.sources
            .map((source) => source.title || source.label)
            .join(", ")}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },
  bubble: { maxWidth: "88%", borderRadius: radius.lg, padding: spacing.md },
  mine: { alignSelf: "flex-end", backgroundColor: colors.primary },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  correction: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
