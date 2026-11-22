"use client";

import { Stack } from "@mantine/core";
import { useRef } from "react";

import { isBackOfficeRole, useAuth } from "@/features/auth";
import { useIncomingFriendRequestCountQuery } from "@/lib/graphql/generated/hooks";
import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import type { FriendsSection } from "../../../constants/friends";
import {
  useFriendsLocation,
  type FriendsAddress,
} from "../../../hooks/useFriendsLocation";
import { useLearnerSearchTerm } from "../../../hooks/useLearnerSearchTerm";
import { useRelationshipActions } from "../../../hooks/useRelationshipActions";
import { FriendsLayout } from "../../blocks/FriendsLayout";
import { FriendsLearnersOnly } from "../../blocks/FriendsLearnersOnly";
import { LearnerSearch } from "../../blocks/LearnerSearch";
import { RelationshipConfirmModal } from "../../blocks/RelationshipConfirmModal";

import { BlockedPanel } from "./BlockedPanel";
import { FriendsNav } from "./FriendsNav";
import { FriendsPanel } from "./FriendsPanel";
import { RequestsPanel } from "./RequestsPanel";
import { SearchPanel } from "./SearchPanel";

type FriendsViewProps = {
  /** `?tab=` of the address the page was opened with. */
  initialTab?: FriendsAddress["tab"];
  /** `?q=` of the same address. */
  initialQuery?: FriendsAddress["q"];
};

/**
 * /friends: a search box and a menu of four lists on the left, the open list
 * on the right - or, while something is typed in the box, what it finds. Each
 * list fetches itself when it is the one shown. An account that is not a
 * learner gets a notice and no request at all: the backend refuses every
 * write for it anyway.
 */
export function FriendsView({ initialTab, initialQuery }: FriendsViewProps) {
  const { t } = useLanguage();
  const { session } = useAuth();
  const isLearner = !isBackOfficeRole(session?.role);

  const location = useFriendsLocation({ tab: initialTab, q: initialQuery });
  const search = useLearnerSearchTerm(location.query);
  const searchInput = useRef<HTMLInputElement>(null);

  const actions = useRelationshipActions();
  const { data: countData } = useIncomingFriendRequestCountQuery({
    skip: !isLearner,
    fetchPolicy: "cache-and-network",
    // A failed count only leaves the menu entry without its number.
    errorPolicy: "ignore",
  });
  const waiting = countData?.incomingFriendRequestCount ?? 0;

  if (!isLearner) {
    return (
      <>
        <PageHeader title={t.friends.pageTitle} />
        <FriendsLearnersOnly />
      </>
    );
  }

  const focusSearch = () => searchInput.current?.focus();
  const clearSearch = () => {
    location.setQuery("");
    focusSearch();
  };

  const renderSection = (section: FriendsSection) => {
    switch (section) {
      case "friends":
        return (
          <FriendsPanel
            pending={actions.pending}
            onAction={actions.perform}
            onFindFriends={focusSearch}
          />
        );
      case "requests":
        return (
          <RequestsPanel
            key={section}
            direction="incoming"
            pending={actions.pending}
            onAction={actions.perform}
          />
        );
      case "sent":
        return (
          <RequestsPanel
            key={section}
            direction="outgoing"
            pending={actions.pending}
            onAction={actions.perform}
          />
        );
      case "blocked":
        return (
          <BlockedPanel pending={actions.pending} onAction={actions.perform} />
        );
      default: {
        const unreachable: never = section;
        return unreachable;
      }
    }
  };

  return (
    <>
      <PageHeader title={t.friends.pageTitle} />
      <FriendsLayout
        sidebar={
          <Stack gap="md">
            <LearnerSearch
              value={location.query}
              onChange={location.setQuery}
              onClear={clearSearch}
              tooShort={search.status === "tooShort"}
              inputRef={searchInput}
              autoFocus={location.focusSearchOnMount}
            />
            <FriendsNav
              // While a search is on screen it is what is shown, not the list under it.
              active={search.status === "idle" ? location.section : null}
              waiting={waiting}
              onSelect={location.selectSection}
            />
          </Stack>
        }
      >
        {search.status === "idle" ? (
          renderSection(location.section)
        ) : (
          <SearchPanel
            search={search}
            pending={actions.pending}
            onAction={actions.perform}
          />
        )}
      </FriendsLayout>
      <RelationshipConfirmModal {...actions.confirmation} />
    </>
  );
}
