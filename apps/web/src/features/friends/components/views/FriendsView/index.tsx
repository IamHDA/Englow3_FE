"use client";

import { useState } from "react";

import { isBackOfficeRole, useAuth } from "@/features/auth";
import { useIncomingFriendRequestCountQuery } from "@/lib/graphql/generated/hooks";
import { PageHeader, PageTabs } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  DEFAULT_FRIENDS_TAB,
  FRIENDS_TABS,
  type FriendsTab,
} from "../../../constants/friends";
import { useRelationshipActions } from "../../../hooks/useRelationshipActions";
import { FriendsLearnersOnly } from "../../blocks/FriendsLearnersOnly";
import { RelationshipConfirmModal } from "../../blocks/RelationshipConfirmModal";

import { BlockedTabPanel } from "./BlockedTabPanel";
import { FriendsTabPanel } from "./FriendsTabPanel";
import { RequestsTabPanel } from "./RequestsTabPanel";
import { SearchTabPanel } from "./SearchTabPanel";

function parseTab(value: string | null | undefined): FriendsTab {
  return FRIENDS_TABS.find((tab) => tab === value) ?? DEFAULT_FRIENDS_TAB;
}

/**
 * /friends: four tabs - friends, requests, search, blocked - each fetching its
 * own list when it is the one shown. An account that is not a learner gets a
 * notice and no request at all: the backend refuses every write for it anyway.
 */
export function FriendsView({ initialTab }: { initialTab?: string }) {
  const { t } = useLanguage();
  const { session } = useAuth();
  const isLearner = !isBackOfficeRole(session?.role);

  // Switching tabs rewrites the address in place (replaceState) instead of
  // adding history entries, so there is no tab to restore on "back": going
  // back leaves the page, and coming here again mounts it with the address's tab.
  const [tab, setTab] = useState(parseTab(initialTab));
  const changeTab = (next: FriendsTab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  };

  const actions = useRelationshipActions();
  const { data: countData } = useIncomingFriendRequestCountQuery({
    skip: !isLearner,
    fetchPolicy: "cache-and-network",
    // A failed count only leaves the tab without its number.
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

  return (
    <>
      <PageHeader title={t.friends.pageTitle} />
      <PageTabs
        value={tab}
        onChange={changeTab}
        tabs={FRIENDS_TABS.map((value) => ({
          value,
          label: t.friends.tabs[value],
          count: value === "requests" ? waiting : undefined,
        }))}
      />
      {tab === "friends" && (
        <FriendsTabPanel
          pending={actions.pending}
          onAction={actions.perform}
          onFindFriends={() => changeTab("search")}
        />
      )}
      {tab === "requests" && (
        <RequestsTabPanel
          pending={actions.pending}
          onAction={actions.perform}
        />
      )}
      {tab === "search" && (
        <SearchTabPanel pending={actions.pending} onAction={actions.perform} />
      )}
      {tab === "blocked" && (
        <BlockedTabPanel pending={actions.pending} onAction={actions.perform} />
      )}
      <RelationshipConfirmModal {...actions.confirmation} />
    </>
  );
}
