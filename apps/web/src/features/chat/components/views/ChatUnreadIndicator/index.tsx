"use client";

import { ActionIcon, Indicator } from "@mantine/core";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useChatUnreadCountQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CHAT_ROUTES, UNREAD_BADGE_MAX } from "../../../constants/chat";
import { useUnreadPolling } from "../../../hooks/useUnreadPolling";

/**
 * The header's way into the chat, and its "something new" mark: a message icon
 * with a red dot and the number of conversations holding something unread
 * ("99+" past ninety-nine). Learners only - the header does not draw it for
 * anyone else.
 *
 * It holds no connection. The count is asked for when the header appears, when
 * the viewer moves to another page, when they come back to the tab and once a
 * minute while it is showing; inside the chat the socket keeps the same query
 * fresh. A failed ask leaves the number as it was: a header that cannot count
 * must still be a header. That is the default error policy, and it is why none
 * is set below: with `errorPolicy: "ignore"` Apollo Client 4 answers a failed
 * refetch by clearing `data` (to null for a GraphQL error, to undefined for a
 * network one), which would have dropped the dot to 0. The refetch's own
 * rejection is swallowed in `refresh`, and a first ask that fails shows 0.
 */
export function ChatUnreadIndicator() {
  const { t } = useLanguage();
  const copy = t.chat.indicator;
  const pathname = usePathname();
  const { data, refetch } = useChatUnreadCountQuery({
    fetchPolicy: "cache-and-network",
    // The server render has no session to ask with.
    ssr: false,
  });
  useUnreadPolling({
    refresh: () => refetch().catch(() => undefined),
    pathname,
  });

  const count = data?.chatUnreadCount ?? 0;
  const label =
    count === 0
      ? copy.label
      : (count === 1 ? copy.unreadOne : copy.unreadOther).replace(
          "{count}",
          String(count),
        );

  return (
    <Indicator
      inline
      color="red"
      size={18}
      offset={6}
      label={count > UNREAD_BADGE_MAX ? `${UNREAD_BADGE_MAX}+` : count}
      disabled={count === 0}
    >
      <ActionIcon
        component={Link}
        href={CHAT_ROUTES.list}
        variant="subtle"
        color="ink"
        size={44}
        radius="md"
        aria-label={label}
        aria-current={
          pathname.startsWith(CHAT_ROUTES.list) ? "page" : undefined
        }
      >
        <MessageCircle size={22} aria-hidden="true" />
      </ActionIcon>
    </Indicator>
  );
}
