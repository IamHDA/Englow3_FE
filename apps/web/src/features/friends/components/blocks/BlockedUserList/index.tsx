"use client";

import { Paper, Stack } from "@mantine/core";
import { Ban } from "lucide-react";

import { RelationshipStatus } from "@/lib/graphql/generated";

import { LIST_COPY } from "../../../constants/friends";
import type {
  BlockedUserItem,
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../types";
import { ListEmptyState } from "../../parts/ListEmptyState";
import { ListPagination } from "../../parts/ListPagination";
import { PersonRow } from "../../parts/PersonRow";
import { RelationshipActions } from "../../parts/RelationshipActions";

type BlockedUserListProps = {
  items: BlockedUserItem[];
  /** Counted from 1. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/** The people the viewer blocked, each with the way to unblock. */
export function BlockedUserList({
  items,
  page,
  totalPages,
  onPageChange,
  pending,
  onAction,
}: BlockedUserListProps) {
  if (items.length === 0) {
    return (
      <Paper withBorder radius="lg">
        <ListEmptyState
          icon={<Ban size={24} aria-hidden="true" />}
          title={LIST_COPY.blockedEmptyTitle}
          description={LIST_COPY.blockedEmptyDescription}
        />
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg">
        {items.map((blocked) => (
          <PersonRow
            key={blocked.userId}
            userId={blocked.userId}
            displayName={blocked.displayName}
            avatarUrl={blocked.avatarUrl}
            caption={{
              label: LIST_COPY.blockedSince,
              date: blocked.blockedAt,
            }}
            actions={
              <RelationshipActions
                status={RelationshipStatus.BLOCKED_BY_ME}
                target={{
                  userId: blocked.userId,
                  displayName: blocked.displayName,
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
