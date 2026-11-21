"use client";

import { Ban } from "lucide-react";

import { RelationshipStatus } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

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

/**
 * The people the viewer blocked, each with the way to unblock. Only the rows
 * (or the empty state) and the page buttons: the card around them is the
 * PeoplePanel's.
 */
export function BlockedUserList({
  items,
  page,
  totalPages,
  onPageChange,
  pending,
  onAction,
}: BlockedUserListProps) {
  const copy = useLanguage().t.friends.list;
  if (items.length === 0) {
    return (
      <ListEmptyState
        icon={<Ban size={24} aria-hidden="true" />}
        title={copy.blockedEmptyTitle}
        description={copy.blockedEmptyDescription}
      />
    );
  }

  return (
    <>
      {items.map((blocked) => (
        <PersonRow
          key={blocked.userId}
          userId={blocked.userId}
          displayName={blocked.displayName}
          avatarUrl={blocked.avatarUrl}
          caption={{
            label: copy.blockedSince,
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
      <ListPagination
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </>
  );
}
