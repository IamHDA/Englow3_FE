"use client";

import { Button, Paper, Stack } from "@mantine/core";
import { Search, Users } from "lucide-react";

import { RelationshipStatus } from "@/lib/graphql/generated";

import { LIST_COPY } from "../../../constants/friends";
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

/** The viewer's friends, one row each, with what can be done about them. */
export function FriendList({
  items,
  page,
  totalPages,
  onPageChange,
  pending,
  onAction,
  onFindFriends,
}: FriendListProps) {
  if (items.length === 0) {
    return (
      <Paper withBorder radius="lg">
        <ListEmptyState
          icon={<Users size={24} aria-hidden="true" />}
          title={LIST_COPY.friendsEmptyTitle}
          description={LIST_COPY.friendsEmptyDescription}
          action={
            <Button
              variant="light"
              leftSection={<Search size={16} aria-hidden="true" />}
              onClick={onFindFriends}
            >
              {LIST_COPY.friendsEmptyAction}
            </Button>
          }
        />
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg">
        {items.map((friend) => (
          <PersonRow
            key={friend.userId}
            userId={friend.userId}
            displayName={friend.displayName}
            avatarUrl={friend.avatarUrl}
            caption={{
              label: LIST_COPY.friendsSince,
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
      </Paper>
      <ListPagination
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </Stack>
  );
}
