"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useOpenChatMutation } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CHAT_ROUTES } from "../../../constants/chat";
import { useChatErrorMessage } from "../../../hooks/useChatErrorMessage";

type OpenChatButtonProps = {
  friendId: string;
  /** For the accessible name: "Message An", not "Message" on every row. */
  friendName: string;
  /** Another action on the screen is running. */
  disabled?: boolean;
};

/**
 * "Message": opens the conversation with a friend - or the one they already
 * have - and goes to it. The backend decides whether the two are friends; a
 * refusal is a toast, not a navigation.
 */
export function OpenChatButton({
  friendId,
  friendName,
  disabled = false,
}: OpenChatButtonProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const copy = t.chat.openChat;
  const errorMessage = useChatErrorMessage();
  const [openChat, { loading }] = useOpenChatMutation();

  async function open() {
    try {
      const { data } = await openChat({ variables: { friendId } });
      if (data) router.push(CHAT_ROUTES.conversation(data.openChat.id));
    } catch (error) {
      notifications.show({
        color: "warn",
        title: copy.errorTitle,
        message: errorMessage(error),
      });
    }
  }

  return (
    <Button
      size="sm"
      loading={loading}
      disabled={disabled}
      leftSection={<MessageCircle size={16} aria-hidden="true" />}
      aria-label={copy.buttonFor.replace("{name}", () => friendName)}
      onClick={() => void open()}
    >
      {copy.button}
    </Button>
  );
}
