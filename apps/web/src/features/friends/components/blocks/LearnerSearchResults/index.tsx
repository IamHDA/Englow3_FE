"use client";

import { Paper, Stack } from "@mantine/core";
import { SearchX } from "lucide-react";

import { SEARCH_COPY } from "../../../constants/friends";
import type {
  LearnerSearchItem,
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../types";
import { ListEmptyState } from "../../parts/ListEmptyState";
import { ListPagination } from "../../parts/ListPagination";
import { PersonRow } from "../../parts/PersonRow";
import { RelationshipActions } from "../../parts/RelationshipActions";

type LearnerSearchResultsProps = {
  items: LearnerSearchItem[];
  /** Counted from 1. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/** Learners found by name, each with the button that fits how the viewer stands with them. */
export function LearnerSearchResults({
  items,
  page,
  totalPages,
  onPageChange,
  pending,
  onAction,
}: LearnerSearchResultsProps) {
  if (items.length === 0) {
    return (
      <Paper withBorder radius="lg">
        <ListEmptyState
          icon={<SearchX size={24} aria-hidden="true" />}
          title={SEARCH_COPY.emptyTitle}
          description={SEARCH_COPY.emptyDescription}
        />
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg">
        {items.map((learner) => (
          <PersonRow
            key={learner.userId}
            userId={learner.userId}
            displayName={learner.displayName}
            avatarUrl={learner.avatarUrl}
            actions={
              <RelationshipActions
                status={learner.relationship}
                target={{
                  userId: learner.userId,
                  displayName: learner.displayName,
                  requestId: learner.requestId,
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
