"use client";

import { useCallback, useState } from "react";

import {
  DEFAULT_FRIENDS_SECTION,
  FRIENDS_ADDRESS_PARAMS,
  FRIENDS_SECTIONS,
  LEGACY_SEARCH_TAB,
  type FriendsSection,
} from "../constants/friends";

/** A search parameter as the route hands it over: absent, one value, or one per repeat. */
type AddressParam = string | string[] | undefined;

/** What the address said when the page was opened. */
export type FriendsAddress = {
  tab?: AddressParam;
  q?: AddressParam;
};

type FriendsPlace = {
  section: FriendsSection;
  /** What is typed in the search box, as typed. */
  query: string;
};

function first(param: AddressParam): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

function readPlace(address: FriendsAddress): FriendsPlace {
  const tab = first(address.tab);
  return {
    // The tab names of today, and "requests" as the old links spelled it: the
    // requests the viewer received. Anything else - "search" included - is the default.
    section:
      FRIENDS_SECTIONS.find((section) => section === tab) ??
      DEFAULT_FRIENDS_SECTION,
    query: first(address.q) ?? "",
  };
}

function writeParam(
  params: URLSearchParams,
  name: string,
  value: string | null,
) {
  if (value) params.set(name, value);
  else params.delete(name);
}

/**
 * Where the learner is on /friends: which list is open and what is typed in the
 * search box. A search on top of a list leaves the list as it was, so clearing
 * the box brings it back; choosing a list clears the box.
 *
 * Both are kept in the address as they change - rewritten in place rather than
 * added to the history, so Back leaves the page instead of stepping through
 * every keystroke. The default list is left out of the address, and so is an
 * empty search; parameters that are not ours stay.
 */
export function useFriendsLocation(address: FriendsAddress) {
  const [place, setPlace] = useState(() => readPlace(address));
  // Only the address the page was opened with can ask for this: a box that
  // grabbed focus at every change would take it from the person typing.
  const [focusSearchOnMount] = useState(
    () => first(address.tab) === LEGACY_SEARCH_TAB,
  );

  const apply = useCallback((next: FriendsPlace) => {
    setPlace(next);
    const url = new URL(window.location.href);
    writeParam(
      url.searchParams,
      FRIENDS_ADDRESS_PARAMS.section,
      next.section === DEFAULT_FRIENDS_SECTION ? null : next.section,
    );
    writeParam(
      url.searchParams,
      FRIENDS_ADDRESS_PARAMS.query,
      next.query.trim() || null,
    );
    window.history.replaceState(null, "", url);
  }, []);

  const selectSection = useCallback(
    (section: FriendsSection) => apply({ section, query: "" }),
    [apply],
  );

  const setQuery = useCallback(
    (query: string) => apply({ section: place.section, query }),
    [apply, place.section],
  );

  return {
    section: place.section,
    query: place.query,
    focusSearchOnMount,
    selectSection,
    setQuery,
  };
}
