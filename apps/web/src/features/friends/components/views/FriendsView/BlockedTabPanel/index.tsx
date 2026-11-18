"use client";

import { useBlockedUsersQuery } from "@/lib/graphql/generated/hooks";

import { FRIENDS_PAGE_SIZE } from "../../../../constants/friends";
import { usePageNumber } from "../../../../hooks/usePageNumber";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../../types";
import { BlockedUserList } from "../../../blocks/BlockedUserList";
import { BlockedUserListSkeleton } from "../../../blocks/BlockedUserList/BlockedUserListSkeleton";
import { ListLoadError } from "../../../parts/ListLoadError";

type BlockedTabPanelProps = {
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/** The "Đã chặn" tab: who the viewer blocked, with the way to unblock. */
export function BlockedTabPanel({ pending, onAction }: BlockedTabPanelProps) {
  const { page, setPage, fitTo } = usePageNumber();
  const { data, loading, error, refetch } = useBlockedUsersQuery({
    variables: { page: page - 1, size: FRIENDS_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const blocked = data?.blockedUsers;
  fitTo(blocked?.totalPages);

  if (!blocked) {
    return error && !loading ? (
      <ListLoadError onRetry={() => void refetch().catch(() => undefined)} />
    ) : (
      <BlockedUserListSkeleton />
    );
  }

  return (
    <BlockedUserList
      items={blocked.items}
      page={page}
      totalPages={blocked.totalPages}
      onPageChange={setPage}
      pending={pending}
      onAction={onAction}
    />
  );
}
