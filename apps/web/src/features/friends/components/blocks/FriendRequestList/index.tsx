"use client";

import { Paper, Stack } from "@mantine/core";
import { Inbox, SendHorizontal } from "lucide-react";

import { RelationshipStatus } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import type { RequestDirection } from "../../../constants/friends";
import type {
  FriendRequestItem,
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../types";
import { ListEmptyState } from "../../parts/ListEmptyState";
import { ListPagination } from "../../parts/ListPagination";
import { PersonRow } from "../../parts/PersonRow";
import { RelationshipActions } from "../../parts/RelationshipActions";

type FriendRequestListProps = {
  /** Requests the viewer received, or the ones the viewer sent. */
  direction: RequestDirection;
  items: FriendRequestItem[];
  /** Counted from 1. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/** Friend requests, received (accept or decline) or sent (cancel). */
export function FriendRequestList({
  direction,
  items,
  page,
  totalPages,
  onPageChange,
  pending,
  onAction,
}: FriendRequestListProps) {
  const copy = useLanguage().t.friends.list;
  const incoming = direction === "incoming";

  if (items.length === 0) {
    return (
      <Paper withBorder radius="lg">
        <ListEmptyState
          icon={
            incoming ? (
              <Inbox size={24} aria-hidden="true" />
            ) : (
              <SendHorizontal size={24} aria-hidden="true" />
            )
          }
          title={incoming ? copy.incomingEmptyTitle : copy.outgoingEmptyTitle}
          description={
            incoming
              ? copy.incomingEmptyDescription
              : copy.outgoingEmptyDescription
          }
        />
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg">
        {items.map((request) => (
          <PersonRow
            key={request.requestId}
            userId={request.userId}
            displayName={request.displayName}
            avatarUrl={request.avatarUrl}
            caption={{
              label: incoming ? copy.requestReceived : copy.requestSent,
              date: request.requestedAt,
            }}
            actions={
              <RelationshipActions
                status={
                  incoming
                    ? RelationshipStatus.REQUEST_RECEIVED
                    : RelationshipStatus.REQUEST_SENT
                }
                target={{
                  userId: request.userId,
                  displayName: request.displayName,
                  requestId: request.requestId,
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
