import { Ionicons } from "@expo/vector-icons";
import { useApolloClient } from "@apollo/client/react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BACKEND_CODES,
  CONVERSATION_LOCKING_CODES,
  IMAGE_MAX_BYTES,
  MARK_READ_DEBOUNCE_MS,
  MAX_MESSAGE_LENGTH,
  MESSAGE_PAGE_SIZE,
  NON_RETRYABLE_SEND_CODES,
  TYPING_EXPIRE_MS,
  TYPING_SEND_INTERVAL_MS,
} from "@/features/chat/constants";
import { FRAME_TYPE } from "@/features/chat/realtime/frames";
import {
  DELIVERY,
  applyRecall,
  entryFromMessage,
  highestSeq,
  lowestSeq,
  markFailed,
  markSending,
  mergeEntries,
  optimisticEntry,
  removeEntry,
  sortEntries,
  type ChatMessageEntry,
} from "@/features/chat/realtime/messageList";
import { useChatSocket } from "@/features/chat/useChatSocket";
import { useAuth } from "@/features/auth/AuthProvider";
import { Avatar } from "@/features/shared/Avatar";
import { formatDateTime } from "@/features/shared/labels";
import { backendCodeOf, errorMessage } from "@/lib/errors";
import {
  ChatMessagesDocument,
  type ChatMessagesQuery,
  useChatConversationQuery,
  useMarkChatReadMutation,
  useRecallChatMessageMutation,
  useSendChatMessageMutation,
  useStartChatImageUploadMutation,
} from "@/lib/graphql/generated";
import { pickImage } from "@/lib/pickImage";
import { uploadToSignedUrl } from "@/lib/upload";
import { randomUUID } from "@/lib/uuid";
import { AppText, ErrorState, LoadingState, Notice } from "@/ui/components";
import { colors, fontSize, radius, spacing } from "@/ui/theme";

const CHAT_ERRORS: Record<string, string> = {
  [BACKEND_CODES.notFriends]:
    "Hai bạn không còn là bạn bè nên không nhắn được nữa.",
  [BACKEND_CODES.partnerGone]: "Người này đã rời Englow3.",
  [BACKEND_CODES.messageTooLong]: "Tin nhắn quá dài.",
  [BACKEND_CODES.imageTooLarge]: "Ảnh quá lớn (tối đa 5 MB).",
  [BACKEND_CODES.imageTypeNotAllowed]: "Chỉ gửi được ảnh JPEG, PNG hoặc WebP.",
  [BACKEND_CODES.learnersOnly]: "Chỉ học viên mới nhắn tin với nhau được.",
  [BACKEND_CODES.alreadyRecalled]: "Tin nhắn đã được thu hồi.",
};

export default function ChatConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const client = useApolloClient();
  const { me } = useAuth();
  const conversation = useChatConversationQuery({
    variables: { id: conversationId },
    fetchPolicy: "cache-and-network",
  });
  const [sendMessage] = useSendChatMessageMutation();
  const [recall] = useRecallChatMessageMutation();
  const [markRead] = useMarkChatReadMutation();
  const [startUpload] = useStartChatImageUploadMutation();
  const [entries, setEntries] = useState<ChatMessageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [olderDone, setOlderDone] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const lastTypingSent = useRef(0);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const info = conversation.data?.chatConversation;
  const partner = info?.otherUser;
  const canSend = info?.canSend !== false && !locked;

  const fetchMessages = useCallback(
    async (variables: {
      afterSeq?: number | null;
      beforeSeq?: number | null;
      limit: number;
    }) => {
      const { data } = await client.query<ChatMessagesQuery>({
        query: ChatMessagesDocument,
        variables: { conversationId, ...variables },
        fetchPolicy: "network-only",
      });
      return (data?.chatMessages ?? []).map(entryFromMessage);
    },
    [client, conversationId],
  );

  const catchUp = useCallback(async () => {
    try {
      const after = highestSeq(entriesRef.current);
      const fresh = await fetchMessages(
        after === null
          ? { limit: MESSAGE_PAGE_SIZE }
          : { afterSeq: after, limit: 100 },
      );
      setEntries((current) => sortEntries(mergeEntries(current, fresh)));
      setLoadError(null);
    } catch (failure) {
      if (entriesRef.current.length === 0) setLoadError(failure);
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  useEffect(() => {
    void catchUp();
  }, [catchUp]);

  const socket = useChatSocket(
    (frame) => {
      if (
        !("conversationId" in frame
          ? frame.conversationId === conversationId
          : frame.message.conversationId === conversationId)
      )
        return;
      if (frame.type === FRAME_TYPE.message) {
        setEntries((current) =>
          sortEntries(mergeEntries(current, [entryFromMessage(frame.message)])),
        );
        setPartnerTyping(false);
      } else if (frame.type === FRAME_TYPE.recalled) {
        setEntries((current) => applyRecall(current, frame.messageId));
      } else if (frame.type === FRAME_TYPE.typing && frame.userId !== me?.id) {
        setPartnerTyping(frame.active);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        if (frame.active)
          typingTimer.current = setTimeout(
            () => setPartnerTyping(false),
            TYPING_EXPIRE_MS,
          );
      }
    },
    () => void catchUp(),
  );

  // Without the socket, poll for new messages while the screen is open.
  useEffect(() => {
    if (socket.live) return;
    const timer = setInterval(() => void catchUp(), 4000);
    return () => clearInterval(timer);
  }, [socket.live, catchUp]);

  // Mark what is on screen as read, a second after it arrives.
  const top = highestSeq(entries);
  useEffect(() => {
    if (top === null) return;
    if (readTimer.current) clearTimeout(readTimer.current);
    readTimer.current = setTimeout(() => {
      void markRead({ variables: { conversationId, upToSeq: top } }).catch(
        () => undefined,
      );
    }, MARK_READ_DEBOUNCE_MS);
    return () => {
      if (readTimer.current) clearTimeout(readTimer.current);
    };
  }, [top, conversationId, markRead]);

  async function loadOlder() {
    const before = lowestSeq(entries);
    if (before === null || olderDone || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const older = await fetchMessages({
        beforeSeq: before,
        limit: MESSAGE_PAGE_SIZE,
      });
      if (older.length < MESSAGE_PAGE_SIZE) setOlderDone(true);
      setEntries((current) => sortEntries(mergeEntries(current, older)));
    } catch {
      // try again on the next scroll
    } finally {
      setLoadingOlder(false);
    }
  }

  async function deliver(
    clientId: string,
    body: string | null,
    imageUploadId: string | null,
  ) {
    setEntries((current) => markSending(current, clientId));
    try {
      const { data } = await sendMessage({
        variables: { conversationId, clientId, body, imageUploadId },
      });
      if (data)
        setEntries((current) =>
          sortEntries(
            mergeEntries(current, [entryFromMessage(data.sendChatMessage)]),
          ),
        );
    } catch (failure) {
      const code = backendCodeOf(failure);
      if (code && CONVERSATION_LOCKING_CODES.has(code))
        setLocked(CHAT_ERRORS[code] ?? errorMessage(failure));
      setEntries((current) =>
        markFailed(current, clientId, {
          code,
          retryable: !(code && NON_RETRYABLE_SEND_CODES.has(code)),
        }),
      );
      if (code && !CONVERSATION_LOCKING_CODES.has(code))
        setNotice(errorMessage(failure, CHAT_ERRORS));
    }
  }

  function submit() {
    const body = text.trim();
    if (!body || !canSend) return;
    const clientId = randomUUID();
    setEntries((current) => [
      ...current,
      optimisticEntry({
        clientId,
        body,
        imageUrl: null,
        sentAt: new Date().toISOString(),
      }),
    ]);
    setText("");
    socket.sendTyping(conversationId, false);
    void deliver(clientId, body, null);
  }

  async function sendImage() {
    if (!canSend) return;
    setNotice(null);
    const picked = await pickImage({ maxBytes: IMAGE_MAX_BYTES });
    if (!picked) return;
    if ("error" in picked) {
      setNotice(picked.error);
      return;
    }
    const clientId = randomUUID();
    setEntries((current) => [
      ...current,
      optimisticEntry({
        clientId,
        body: null,
        imageUrl: picked.uri,
        sentAt: new Date().toISOString(),
      }),
    ]);
    setUploading(true);
    try {
      const { data } = await startUpload({
        variables: {
          conversationId,
          contentType: picked.contentType,
          contentLength: picked.bytes.byteLength,
        },
      });
      if (!data) throw new Error("No upload ticket");
      await uploadToSignedUrl(
        data.startChatImageUpload.uploadUrl,
        data.startChatImageUpload.contentType,
        picked.bytes,
      );
      await deliver(clientId, null, data.startChatImageUpload.uploadId);
    } catch (failure) {
      setEntries((current) =>
        markFailed(current, clientId, {
          code: backendCodeOf(failure),
          retryable: false,
        }),
      );
      setNotice(errorMessage(failure, CHAT_ERRORS));
    } finally {
      setUploading(false);
    }
  }

  function onType(value: string) {
    setText(value);
    const now = Date.now();
    if (value && now - lastTypingSent.current > TYPING_SEND_INTERVAL_MS) {
      lastTypingSent.current = now;
      socket.sendTyping(conversationId, true);
    }
  }

  function messageMenu(entry: ChatMessageEntry, mine: boolean) {
    if (entry.delivery === DELIVERY.failed && entry.clientId) {
      Alert.alert("Tin nhắn chưa gửi được", undefined, [
        {
          text: "Gửi lại",
          onPress: () =>
            entry.clientId && void deliver(entry.clientId, entry.body, null),
        },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () =>
            setEntries((current) => removeEntry(current, entry.key)),
        },
        { text: "Đóng", style: "cancel" },
      ]);
      return;
    }
    if (!mine || !entry.id || entry.recalled) return;
    const messageId = entry.id;
    Alert.alert(
      "Thu hồi tin nhắn?",
      "Người nhận sẽ không còn thấy nội dung tin nhắn này.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Thu hồi",
          style: "destructive",
          onPress: () =>
            void recall({ variables: { messageId } })
              .then(() =>
                setEntries((current) => applyRecall(current, messageId)),
              )
              .catch((failure) =>
                setNotice(errorMessage(failure, CHAT_ERRORS)),
              ),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable
              style={styles.header}
              onPress={() =>
                partner &&
                router.push({
                  pathname: "/people/[userId]",
                  params: { userId: partner.userId },
                })
              }
            >
              <Avatar
                url={partner?.avatarUrl}
                name={partner?.displayName}
                size={30}
              />
              <View>
                <AppText variant="label">
                  {partner?.displayName ?? "Tin nhắn"}
                </AppText>
                {partnerTyping ? (
                  <AppText variant="caption" tone="primary">
                    đang soạn tin…
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <LoadingState />
        ) : loadError ? (
          <ErrorState
            message={errorMessage(loadError)}
            onRetry={() => void catchUp()}
          />
        ) : (
          <FlatList
            inverted
            data={[...entries].reverse()}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ padding: spacing.md, gap: spacing.xs }}
            onEndReached={() => void loadOlder()}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingOlder ? (
                <ActivityIndicator style={{ margin: spacing.md }} />
              ) : undefined
            }
            renderItem={({ item }) => {
              const mine =
                item.senderId === me?.id ||
                (item.senderId === null && item.clientId !== null);
              return (
                <Pressable
                  onLongPress={() => messageMenu(item, mine)}
                  onPress={
                    item.delivery === DELIVERY.failed
                      ? () => messageMenu(item, mine)
                      : undefined
                  }
                  style={[
                    styles.bubble,
                    mine ? styles.mine : styles.theirs,
                    item.recalled && styles.recalled,
                  ]}
                >
                  {item.recalled ? (
                    <AppText
                      variant="caption"
                      tone="muted"
                      style={{ fontStyle: "italic" }}
                    >
                      Tin nhắn đã thu hồi
                    </AppText>
                  ) : (
                    <>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.image}
                          resizeMode="cover"
                          accessibilityLabel="Ảnh trong tin nhắn"
                        />
                      ) : null}
                      {item.body ? (
                        <AppText tone={mine ? "inverse" : "default"} selectable>
                          {item.body}
                        </AppText>
                      ) : null}
                    </>
                  )}
                  <AppText
                    variant="caption"
                    tone={mine ? "inverse" : "faint"}
                    style={{ opacity: 0.8, marginTop: 2 }}
                  >
                    {item.delivery === DELIVERY.sending
                      ? "Đang gửi…"
                      : item.delivery === DELIVERY.failed ||
                          item.delivery === DELIVERY.rejected
                        ? "Chưa gửi được · chạm để thử lại"
                        : formatDateTime(item.sentAt)}
                  </AppText>
                </Pressable>
              );
            }}
          />
        )}
        <View style={styles.composer}>
          <Notice message={locked ?? notice} />
          <View style={styles.inputRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi ảnh"
              onPress={() => void sendImage()}
              disabled={!canSend || uploading}
              style={[
                styles.iconButton,
                (!canSend || uploading) && { opacity: 0.4 },
              ]}
            >
              {uploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={colors.primary}
                />
              )}
            </Pressable>
            <TextInput
              value={text}
              onChangeText={onType}
              placeholder={
                canSend
                  ? "Nhắn tin…"
                  : "Không thể nhắn trong cuộc trò chuyện này"
              }
              placeholderTextColor={colors.textFaint}
              multiline
              maxLength={MAX_MESSAGE_LENGTH}
              editable={canSend}
              style={styles.input}
              accessibilityLabel="Tin nhắn"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi"
              onPress={submit}
              disabled={!text.trim() || !canSend}
              style={[
                styles.send,
                (!text.trim() || !canSend) && { opacity: 0.4 },
              ]}
            >
              <Ionicons name="send" size={18} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  bubble: {
    maxWidth: "80%",
    borderRadius: radius.lg,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mine: { alignSelf: "flex-end", backgroundColor: colors.primary },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recalled: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
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
