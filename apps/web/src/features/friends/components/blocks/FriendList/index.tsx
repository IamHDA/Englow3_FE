"use client";

import { Button } from "@mantine/core";
import { Search, Users } from "lucide-react";

import { RelationshipStatus } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import type {
  FriendItem,
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../types";
import { ListEmptyState } from "../../parts/ListEmptyState";
import { ListPagination } from "../../parts/ListPagination";
import { PersonRow } from "../../parts/PersonRow";
import { RelationshipActions } from "../../parts/RelationshipActions";

type FriendListProps = {
  items: FriendItem[];
  /** Counted from 1. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
  /** Where a learner with no friends yet goes next. */
  onFindFriends: () => void;
};

/**
 * The viewer's friends, one row each, with what can be done about them. Only
 * the rows (or the empty state) and the page buttons: the card around them is
 * the PeoplePanel's.
 */
export function FriendList({
  items,
  page,
  totalPages,
  onPageChange,
  pending,
  onAction,
  onFindFriends,
}: FriendListProps) {
  const copy = useLanguage().t.friends.list;
  if (items.length === 0) {
    return (
      <ListEmptyState
        icon={<Users size={24} aria-hidden="true" />}
        title={copy.friendsEmptyTitle}
        description={copy.friendsEmptyDescription}
        action={
          <Button
            variant="light"
            leftSection={<Search size={16} aria-hidden="true" />}
            onClick={onFindFriends}
          >
            {copy.friendsEmptyAction}
          </Button>
        }
      />
    );
  }

  return (
    <>
      {items.map((friend) => (
        <PersonRow
          key={friend.userId}
          userId={friend.userId}
          displayName={friend.displayName}
          avatarUrl={friend.avatarUrl}
          caption={{
            label: copy.friendsSince,
            date: friend.friendsSince,
          }}
          actions={
            <RelationshipActions
              status={RelationshipStatus.FRIENDS}
              target={{
                userId: friend.userId,
                displayName: friend.displayName,
              }}
              pending={pending}
              onAction={onAction}
            />
          }
        />
      ))}
      <ListPagination
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </>
  );
}
