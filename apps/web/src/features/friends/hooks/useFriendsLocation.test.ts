import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFriendsLocation, type FriendsAddress } from "./useFriendsLocation";

/** The address the page was opened with, in the browser as well as in the props. */
function open(search: string) {
  window.history.replaceState(null, "", `/friends${search}`);
}

function setup(address: FriendsAddress = {}) {
  return renderHook(({ at }) => useFriendsLocation(at), {
    initialProps: { at: address },
  });
}

beforeEach(() => open(""));
afterEach(() => vi.restoreAllMocks());

describe("opening the page", () => {
  it("shows the friends and an empty search box for a bare address", () => {
    const { result } = setup();

    expect(result.current.section).toBe("friends");
    expect(result.current.query).toBe("");
    expect(result.current.focusSearchOnMount).toBe(false);
  });

  it.each(["friends", "requests", "sent", "blocked"] as const)(
    "opens the %s list from ?tab=%s",
    (tab) => {
      expect(setup({ tab }).result.current.section).toBe(tab);
    },
  );

  /** The header badge and older links go to /friends?tab=requests. */
  it("still opens the requests the viewer received for ?tab=requests", () => {
    const { result } = setup({ tab: "requests" });

    expect(result.current.section).toBe("requests");
    expect(result.current.focusSearchOnMount).toBe(false);
  });

  it("opens the default list with the search box focused for the old ?tab=search", () => {
    const { result } = setup({ tab: "search" });

    expect(result.current.section).toBe("friends");
    expect(result.current.query).toBe("");
    expect(result.current.focusSearchOnMount).toBe(true);
  });

  it("falls back to the default list for a tab it does not know", () => {
    expect(setup({ tab: "wall" }).result.current.section).toBe("friends");
  });

  /** The blog's search dropdown links to /friends?q=<term>. */
  it("opens with the search box filled in from ?q=", () => {
    const { result } = setup({ q: "an" });

    expect(result.current.query).toBe("an");
    expect(result.current.section).toBe("friends");
    expect(result.current.focusSearchOnMount).toBe(false);
  });

  it("keeps the list a search was opened on top of", () => {
    const { result } = setup({ tab: "blocked", q: "an" });

    expect(result.current.section).toBe("blocked");
    expect(result.current.query).toBe("an");
  });

  it("takes the first of a parameter given twice", () => {
    const { result } = setup({ tab: ["sent", "blocked"], q: ["an", "ba"] });

    expect(result.current.section).toBe("sent");
    expect(result.current.query).toBe("an");
  });
});

describe("choosing a list", () => {
  it("shows it and writes it into the address", () => {
    const { result } = setup();

    act(() => result.current.selectSection("sent"));

    expect(result.current.section).toBe("sent");
    expect(window.location.search).toBe("?tab=sent");
  });

  it("leaves the default list out of the address", () => {
    open("?tab=blocked");
    const { result } = setup({ tab: "blocked" });

    act(() => result.current.selectSection("friends"));

    expect(result.current.section).toBe("friends");
    expect(window.location.search).toBe("");
  });

  it("clears the search box, and the search from the address", () => {
    open("?tab=requests&q=an");
    const { result } = setup({ tab: "requests", q: "an" });

    act(() => result.current.selectSection("blocked"));

    expect(result.current.query).toBe("");
    expect(window.location.search).toBe("?tab=blocked");
  });

  it("drops the old ?tab=search from the address once a list is chosen", () => {
    open("?tab=search");
    const { result } = setup({ tab: "search" });

    act(() => result.current.selectSection("friends"));

    expect(window.location.search).toBe("");
  });
});

describe("searching", () => {
  it("keeps what is typed, and writes it into the address as it is trimmed", () => {
    const { result } = setup();

    act(() => result.current.setQuery("  an "));

    expect(result.current.query).toBe("  an ");
    expect(window.location.search).toBe("?q=an");
  });

  it("goes back to the list that was open when the box is cleared", () => {
    open("?tab=requests");
    const { result } = setup({ tab: "requests" });

    act(() => result.current.setQuery("an"));
    expect(result.current.section).toBe("requests");
    expect(window.location.search).toBe("?tab=requests&q=an");

    act(() => result.current.setQuery(""));
    expect(result.current.section).toBe("requests");
    expect(result.current.query).toBe("");
    expect(window.location.search).toBe("?tab=requests");
  });

  it("leaves a blank search out of the address", () => {
    open("?q=an");
    const { result } = setup({ q: "an" });

    act(() => result.current.setQuery("   "));

    expect(window.location.search).toBe("");
  });

  it("keeps parameters that are not its own", () => {
    open("?ref=header");
    const { result } = setup();

    act(() => result.current.setQuery("an"));
    act(() => result.current.selectSection("sent"));

    expect(window.location.search).toBe("?ref=header&tab=sent");
  });
});

describe("the history", () => {
  it("rewrites the address in place and adds no entry", () => {
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = setup();

    act(() => result.current.setQuery("a"));
    act(() => result.current.setQuery("an"));
    act(() => result.current.selectSection("blocked"));

    expect(replace).toHaveBeenCalledTimes(3);
    expect(push).not.toHaveBeenCalled();
  });
});
