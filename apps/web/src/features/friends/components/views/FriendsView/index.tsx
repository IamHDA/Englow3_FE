"use client";

import { useEffect, useState } from "react";

import { isBackOfficeRole, useAuth } from "@/features/auth";
import { useIncomingFriendRequestCountQuery } from "@/lib/graphql/generated/hooks";
import { PageHeader, PageTabs } from "@/shared/components/Page";

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

const PAGE_TITLE = "Bạn bè";

function parseTab(value: string | null | undefined): FriendsTab {
  return (
    FRIENDS_TABS.find((tab) => tab.value === value)?.value ??
    DEFAULT_FRIENDS_TAB
  );
}

/**
 * /friends: four tabs - friends, requests, search, blocked - each fetching its
 * own list when it is the one shown. An account that is not a learner gets a
 * notice and no request at all: the backend refuses every write for it anyway.
 */
export function FriendsView({ initialTab }: { initialTab?: string }) {
  const { session } = useAuth();
  const isLearner = !isBackOfficeRole(session?.role);

  const [tab, setTab] = useState(parseTab(initialTab));
  useEffect(() => {
    const restore = () =>
      setTab(parseTab(new URL(window.location.href).searchParams.get("tab")));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
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
        <PageHeader title={PAGE_TITLE} />
        <FriendsLearnersOnly />
      </>
    );
  }

  return (
    <>
      <PageHeader title={PAGE_TITLE} />
      <PageTabs
        value={tab}
        onChange={changeTab}
        tabs={FRIENDS_TABS.map(({ value, label }) => ({
          value,
          label:
            value === "requests" && waiting > 0
              ? `${label} (${waiting})`
              : label,
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
