import { Stack, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

import { useChatSocket } from "@/features/chat/useChatSocket";
import { FRAME_TYPE } from "@/features/chat/realtime/frames";
import { Avatar } from "@/features/shared/Avatar";
import { formatDateTime } from "@/features/shared/labels";
import { useChatConversationsQuery } from "@/lib/graphql/generated";
import { AppText, Badge, Card, EmptyState, Row, Screen } from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

export default function ChatListScreen() {
  const conversations = useChatConversationsQuery({
    variables: { page: 0, size: 50 },
    fetchPolicy: "cache-and-network",
  });
  const { refetch } = conversations;
  const socket = useChatSocket(
    (frame) => {
      if (
        frame.type === FRAME_TYPE.message ||
        frame.type === FRAME_TYPE.recalled ||
        frame.type === FRAME_TYPE.read
      ) {
        void refetch();
      }
    },
    () => void refetch(),
  );

  useFocusEffect(
    useCallback(() => {
      void refetch();
      // Without a live socket, keep the list fresh while it is on screen.
      if (socket.live) return;
      const timer = setInterval(() => void refetch(), 15_000);
      return () => clearInterval(timer);
    }, [refetch, socket.live]),
  );

  return (
    <Screen
      refreshing={conversations.loading && Boolean(conversations.data)}
      onRefresh={() => void refetch()}
    >
      <Stack.Screen options={{ title: "Tin nhắn" }} />
      <QueryView
        loading={conversations.loading}
        error={conversations.error}
        data={conversations.data?.chatConversations}
        onRetry={() => void refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="chatbubbles-outline"
            title="Chưa có cuộc trò chuyện"
            message="Kết bạn với người học khác rồi nhắn tin từ trang của họ."
          />
        }
      >
        {(data) =>
          data.items.map((conversation) => {
            const last = conversation.lastMessage;
            const preview = last
              ? last.recalled
                ? "Tin nhắn đã thu hồi"
                : last.hasImage && !last.preview
                  ? "📷 Ảnh"
                  : (last.preview ?? "")
              : "Bắt đầu trò chuyện";
            return (
              <Card
                key={conversation.id}
                style={{ marginBottom: spacing.sm }}
                onPress={() =>
                  router.push({
                    pathname: "/chat/[conversationId]",
                    params: { conversationId: conversation.id },
                  })
                }
              >
                <Row>
                  <Avatar
                    url={conversation.otherUser?.avatarUrl}
                    name={conversation.otherUser?.displayName}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" numberOfLines={1}>
                      {conversation.otherUser?.displayName ??
                        "Người dùng đã rời đi"}
                    </AppText>
                    <AppText
                      variant="caption"
                      tone={conversation.unreadCount > 0 ? "default" : "muted"}
                      numberOfLines={1}
                    >
                      {preview}
                    </AppText>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    {last ? (
                      <AppText variant="caption" tone="faint">
                        {formatDateTime(last.sentAt)}
                      </AppText>
                    ) : null}
                    {conversation.unreadCount > 0 ? (
                      <Badge
                        label={
                          conversation.unreadCount > 99
                            ? "99+"
                            : String(conversation.unreadCount)
                        }
                        tone="accent"
                      />
                    ) : null}
                  </View>
                </Row>
              </Card>
            );
          })
        }
      </QueryView>
    </Screen>
  );
}
