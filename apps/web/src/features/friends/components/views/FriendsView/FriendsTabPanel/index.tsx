"use client";

import { useFriendsQuery } from "@/lib/graphql/generated/hooks";

import { FRIENDS_PAGE_SIZE } from "../../../../constants/friends";
import { usePageNumber } from "../../../../hooks/usePageNumber";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../../types";
import { FriendList } from "../../../blocks/FriendList";
import { FriendListSkeleton } from "../../../blocks/FriendList/FriendListSkeleton";
import { ListLoadError } from "../../../parts/ListLoadError";

type FriendsTabPanelProps = {
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
  onFindFriends: () => void;
};

/** The "Bạn bè" tab: the viewer's friends, a page at a time. */
export function FriendsTabPanel({
  pending,
  onAction,
  onFindFriends,
}: FriendsTabPanelProps) {
  const { page, setPage, fitTo } = usePageNumber();
  const { data, loading, error, refetch } = useFriendsQuery({
    variables: { page: page - 1, size: FRIENDS_PAGE_SIZE },
    // Friends change without this screen's help (someone accepts, someone
    // unfriends), so a visit always asks again and shows what it has meanwhile.
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const friends = data?.friends;
  fitTo(friends?.totalPages);

  if (!friends) {
    return error && !loading ? (
      <ListLoadError onRetry={() => void refetch().catch(() => undefined)} />
    ) : (
      <FriendListSkeleton />
    );
  }

  return (
    <FriendList
      items={friends.items}
      page={page}
      totalPages={friends.totalPages}
      onPageChange={setPage}
      pending={pending}
      onAction={onAction}
      onFindFriends={onFindFriends}
    />
  );
}
