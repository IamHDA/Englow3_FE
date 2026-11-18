"use client";

import { SegmentedControl } from "@mantine/core";
import { useState } from "react";

import {
  useIncomingFriendRequestsQuery,
  useOutgoingFriendRequestsQuery,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  FRIENDS_PAGE_SIZE,
  REQUEST_DIRECTIONS,
  type RequestDirection,
} from "../../../../constants/friends";
import { usePageNumber } from "../../../../hooks/usePageNumber";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../../types";
import { FriendRequestList } from "../../../blocks/FriendRequestList";
import { FriendRequestListSkeleton } from "../../../blocks/FriendRequestList/FriendRequestListSkeleton";
import { ListLoadError } from "../../../parts/ListLoadError";

type RequestsTabPanelProps = {
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/** The "requests" tab: requests the viewer received, and the ones they sent. */
export function RequestsTabPanel({ pending, onAction }: RequestsTabPanelProps) {
  const { t } = useLanguage();
  const [direction, setDirection] = useState<RequestDirection>("incoming");
  const incomingPager = usePageNumber();
  const outgoingPager = usePageNumber();

  // Only the list on show is asked for; the other waits until it is chosen.
  const incomingQuery = useIncomingFriendRequestsQuery({
    variables: { page: incomingPager.page - 1, size: FRIENDS_PAGE_SIZE },
    skip: direction !== "incoming",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const outgoingQuery = useOutgoingFriendRequestsQuery({
    variables: { page: outgoingPager.page - 1, size: FRIENDS_PAGE_SIZE },
    skip: direction !== "outgoing",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const incoming = direction === "incoming";
  const pager = incoming ? incomingPager : outgoingPager;
  const query = incoming ? incomingQuery : outgoingQuery;
  const requests = incoming
    ? incomingQuery.data?.incomingFriendRequests
    : outgoingQuery.data?.outgoingFriendRequests;
  pager.fitTo(requests?.totalPages);

  return (
    <>
      <SegmentedControl
        size="sm"
        radius="md"
        mb="md"
        value={direction}
        onChange={(next) => setDirection(next as RequestDirection)}
        data={REQUEST_DIRECTIONS.map((value) => ({
          value,
          label: t.friends.directions[value],
        }))}
      />
      {!requests ? (
        query.error && !query.loading ? (
          <ListLoadError
            onRetry={() => void query.refetch().catch(() => undefined)}
          />
        ) : (
          <FriendRequestListSkeleton />
        )
      ) : (
        <FriendRequestList
          direction={direction}
          items={requests.items}
          page={pager.page}
          totalPages={requests.totalPages}
          onPageChange={pager.setPage}
          pending={pending}
          onAction={onAction}
        />
      )}
    </>
  );
}
