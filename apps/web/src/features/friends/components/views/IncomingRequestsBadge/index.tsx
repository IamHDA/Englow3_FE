"use client";

import { Badge, VisuallyHidden } from "@mantine/core";

import { useIncomingFriendRequestCountQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  REQUEST_BADGE_MAX,
  REQUEST_COUNT_POLL_MS,
} from "../../../constants/friends";

/**
 * How many friend requests are waiting, beside the friends link in the header.
 * Nothing at all for none, and nothing when the count cannot be read: a header
 * that cannot count must still be a header.
 */
export function IncomingRequestsBadge() {
  const { t } = useLanguage();
  const { data } = useIncomingFriendRequestCountQuery({
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
    // The server render has no session to ask with.
    ssr: false,
    // New requests arrive without this page doing anything; a hidden tab does not ask.
    pollInterval: REQUEST_COUNT_POLL_MS,
    skipPollAttempt: () => document.hidden,
  });
  const count = data?.incomingFriendRequestCount ?? 0;
  if (count <= 0) return null;

  return (
    <>
      <Badge size="sm" variant="filled" color="navy" aria-hidden="true">
        {count > REQUEST_BADGE_MAX ? `${REQUEST_BADGE_MAX}+` : count}
      </Badge>
      <VisuallyHidden>
        {(count === 1
          ? t.friends.requestBadge.labelOne
          : t.friends.requestBadge.labelOther
        ).replace("{count}", String(count))}
      </VisuallyHidden>
    </>
  );
}
