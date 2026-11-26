import { router } from "expo-router";
import { Alert } from "react-native";

import { errorMessage } from "@/lib/errors";
import {
  RelationshipStatus,
  useAcceptFriendRequestMutation,
  useBlockUserMutation,
  useOpenChatMutation,
  useSendFriendRequestMutation,
  useUnblockUserMutation,
  useUnfriendMutation,
  useWithdrawFriendRequestMutation,
} from "@/lib/graphql/generated";
import { Button, Row } from "@/ui/components";
import { spacing } from "@/ui/theme";

const FRIEND_ERRORS: Record<string, string> = {
  FRIEND_REQUEST_LIMIT: "Bạn đã gửi quá nhiều lời mời. Hãy thử lại sau.",
  FRIEND_LIMIT: "Danh sách bạn bè đã đầy.",
  USER_BLOCKED: "Không thể kết bạn với người này.",
};

/**
 * Every action between two learners, from the status the backend reports:
 * add, cancel, accept, message, unfriend, block. `onChanged` re-reads whatever
 * the screen shows.
 */
export function RelationshipButton({
  userId,
  status,
  requestId,
  onChanged,
  compact,
}: {
  userId: string;
  status: RelationshipStatus;
  requestId?: string | null;
  onChanged: () => void;
  compact?: boolean;
}) {
  const [send, sendState] = useSendFriendRequestMutation();
  const [accept, acceptState] = useAcceptFriendRequestMutation();
  const [withdraw, withdrawState] = useWithdrawFriendRequestMutation();
  const [unfriend] = useUnfriendMutation();
  const [block] = useBlockUserMutation();
  const [unblock, unblockState] = useUnblockUserMutation();
  const [openChat, chatState] = useOpenChatMutation();
  const size = compact ? "sm" : "md";

  const run = (operation: Promise<unknown>) =>
    void operation
      .then(onChanged)
      .catch((failure) =>
        Alert.alert(
          "Chưa thực hiện được",
          errorMessage(failure, FRIEND_ERRORS),
        ),
      );

  function more() {
    Alert.alert("Tuỳ chọn", undefined, [
      ...(status === RelationshipStatus.FRIENDS
        ? [
            {
              text: "Huỷ kết bạn",
              style: "destructive" as const,
              onPress: () => run(unfriend({ variables: { userId } })),
            },
          ]
        : []),
      {
        text: "Chặn",
        style: "destructive",
        onPress: () =>
          Alert.alert(
            "Chặn người này?",
            "Hai bạn sẽ không thấy nhau và không nhắn tin được.",
            [
              { text: "Huỷ", style: "cancel" },
              {
                text: "Chặn",
                style: "destructive",
                onPress: () => run(block({ variables: { userId } })),
              },
            ],
          ),
      },
      { text: "Đóng", style: "cancel" },
    ]);
  }

  switch (status) {
    case RelationshipStatus.NONE:
      return (
        <Row gap={spacing.sm}>
          <Button
            title="Kết bạn"
            icon="person-add-outline"
            size={size}
            loading={sendState.loading}
            onPress={() => run(send({ variables: { addresseeId: userId } }))}
          />
          {!compact ? (
            <Button title="…" variant="ghost" size={size} onPress={more} />
          ) : null}
        </Row>
      );
    case RelationshipStatus.REQUEST_SENT:
      return (
        <Button
          title="Huỷ lời mời"
          variant="secondary"
          size={size}
          loading={withdrawState.loading}
          onPress={() =>
            requestId && run(withdraw({ variables: { requestId } }))
          }
        />
      );
    case RelationshipStatus.REQUEST_RECEIVED:
      return (
        <Row gap={spacing.sm}>
          <Button
            title="Chấp nhận"
            size={size}
            loading={acceptState.loading}
            onPress={() =>
              requestId && run(accept({ variables: { requestId } }))
            }
          />
          <Button
            title="Từ chối"
            variant="ghost"
            size={size}
            onPress={() =>
              requestId && run(withdraw({ variables: { requestId } }))
            }
          />
        </Row>
      );
    case RelationshipStatus.FRIENDS:
      return (
        <Row gap={spacing.sm}>
          <Button
            title="Nhắn tin"
            icon="chatbubble-outline"
            size={size}
            loading={chatState.loading}
            onPress={() =>
              void openChat({ variables: { friendId: userId } })
                .then(({ data }) => {
                  if (data)
                    router.push({
                      pathname: "/chat/[conversationId]",
                      params: { conversationId: data.openChat.id },
                    });
                })
                .catch((failure) =>
                  Alert.alert(
                    "Chưa mở được cuộc trò chuyện",
                    errorMessage(failure),
                  ),
                )
            }
          />
          {!compact ? (
            <Button title="…" variant="ghost" size={size} onPress={more} />
          ) : null}
        </Row>
      );
    case RelationshipStatus.BLOCKED_BY_ME:
      return (
        <Button
          title="Bỏ chặn"
          variant="secondary"
          size={size}
          loading={unblockState.loading}
          onPress={() => run(unblock({ variables: { userId } }))}
        />
      );
    default:
      return null;
  }
}
