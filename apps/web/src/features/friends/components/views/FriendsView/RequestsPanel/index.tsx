"use client";

import {
  useIncomingFriendRequestsQuery,
  useOutgoingFriendRequestsQuery,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  FRIENDS_PAGE_SIZE,
  type RequestDirection,
} from "../../../../constants/friends";
import { usePageNumber } from "../../../../hooks/usePageNumber";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../../types";
import { FriendRequestList } from "../../../blocks/FriendRequestList";
import { FriendRequestListSkeleton } from "../../../blocks/FriendRequestList/FriendRequestListSkeleton";
import { PeoplePanel } from "../../../blocks/PeoplePanel";
import { ListLoadError } from "../../../parts/ListLoadError";

type RequestsPanelProps = {
  /** "incoming" is "Lời mời nhận được", "outgoing" is "Lời mời đã gửi". */
  direction: RequestDirection;
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/**
 * One of the two request lists: the requests the viewer received, or the ones
 * they sent. The view keys it by list, so each starts on its own first page.
 */
export function RequestsPanel({
  direction,
  pending,
  onAction,
}: RequestsPanelProps) {
  const { sections } = useLanguage().t.friends;
  const { page, setPage, fitTo } = usePageNumber();
  const incoming = direction === "incoming";

  // Only the list on show is asked for.
  const incomingQuery = useIncomingFriendRequestsQuery({
    variables: { page: page - 1, size: FRIENDS_PAGE_SIZE },
    skip: !incoming,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const outgoingQuery = useOutgoingFriendRequestsQuery({
    variables: { page: page - 1, size: FRIENDS_PAGE_SIZE },
    skip: incoming,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const query = incoming ? incomingQuery : outgoingQuery;
  const requests = incoming
    ? incomingQuery.data?.incomingFriendRequests
    : outgoingQuery.data?.outgoingFriendRequests;
  fitTo(requests?.totalPages);

  const title = incoming ? sections.requests : sections.sent;

  if (!requests) {
    return (
      <PeoplePanel title={title}>
        {query.error && !query.loading ? (
          <ListLoadError
            onRetry={() => void query.refetch().catch(() => undefined)}
          />
        ) : (
          <FriendRequestListSkeleton />
        )}
      </PeoplePanel>
    );
  }

  return (
    <PeoplePanel title={title} count={requests.totalItems}>
      <FriendRequestList
        direction={direction}
        items={requests.items}
        page={page}
        totalPages={requests.totalPages}
        onPageChange={setPage}
        pending={pending}
        onAction={onAction}
      />
    </PeoplePanel>
  );
}
