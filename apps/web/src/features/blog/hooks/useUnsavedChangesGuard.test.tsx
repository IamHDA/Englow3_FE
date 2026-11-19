import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => push.mockReset());

/** A link on the page, as the header or an author's name would be. */
function link(href: string, attributes: Record<string, string> = {}) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.textContent = "link";
  for (const [name, value] of Object.entries(attributes)) {
    anchor.setAttribute(name, value);
  }
  document.body.append(anchor);
  return anchor;
}

/** Clicks and says whether the click was held back. */
function click(anchor: HTMLElement, init: MouseEventInit = {}) {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...init,
  });
  act(() => {
    anchor.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

function leaving() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("with nothing unsaved", () => {
  it("lets the browser close the page, and lets every link go", () => {
    renderHook(() => useUnsavedChangesGuard(false));

    expect(leaving()).toBe(false);
    expect(click(link("/blog"))).toBe(false);
  });
});

describe("with something unsaved", () => {
  it("has the browser ask before the page is closed or reloaded", () => {
    renderHook(() => useUnsavedChangesGuard(true));

    expect(leaving()).toBe(true);
  });

  it("holds back a click on a link to another page of the site, and says it is asking", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));

    expect(click(link("/blog/abc?x=1#top"))).toBe(true);

    expect(result.current.asking).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });

  it("goes where the click was going once the person chooses to leave", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    click(link("/blog/abc?x=1#top"));

    act(() => result.current.leave());

    expect(push).toHaveBeenCalledExactlyOnceWith("/blog/abc?x=1#top");
    expect(result.current.asking).toBe(false);
  });

  it("goes nowhere, and stops asking, when the person stays", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    click(link("/blog"));

    act(() => result.current.stay());

    expect(push).not.toHaveBeenCalled();
    expect(result.current.asking).toBe(false);
    act(() => result.current.leave());
    expect(push).not.toHaveBeenCalled();
  });

  it("finds the link when what was clicked is inside it", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    const anchor = link("/friends");
    const icon = document.createElement("span");
    anchor.append(icon);

    expect(click(icon)).toBe(true);
    expect(result.current.asking).toBe(true);
  });

  it("leaves alone a link that opens a new tab, one that downloads, one to another site and one to this very page", () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));

    expect(click(link("/blog", { target: "_blank" }))).toBe(false);
    expect(click(link("/file.pdf", { download: "" }))).toBe(false);
    expect(click(link("https://example.com/page"))).toBe(false);
    expect(click(link(window.location.pathname + window.location.search))).toBe(
      false,
    );
    expect(result.current.asking).toBe(false);
  });

  it("leaves alone a click made to open a link elsewhere: with a modifier key or a middle button", () => {
    renderHook(() => useUnsavedChangesGuard(true));
    const anchor = link("/blog");

    expect(click(anchor, { ctrlKey: true })).toBe(false);
    expect(click(anchor, { metaKey: true })).toBe(false);
    expect(click(anchor, { shiftKey: true })).toBe(false);
    expect(click(anchor, { button: 1 })).toBe(false);
  });

  it("stops holding anything back once the changes are saved, and takes its listeners off when the page goes", () => {
    const { rerender, unmount } = renderHook(
      ({ dirty }) => useUnsavedChangesGuard(dirty),
      { initialProps: { dirty: true } },
    );
    expect(leaving()).toBe(true);

    rerender({ dirty: false });
    expect(leaving()).toBe(false);
    expect(click(link("/blog"))).toBe(false);

    rerender({ dirty: true });
    unmount();
    expect(leaving()).toBe(false);
    expect(click(link("/blog"))).toBe(false);
  });

  it("is caught before a handler on the link itself sees the click", () => {
    renderHook(() => useUnsavedChangesGuard(true));
    const seen = vi.fn();
    function Link() {
      return (
        <a href="/blog" onClick={seen}>
          go
        </a>
      );
    }
    const { getByText } = render(<Link />);

    fireEvent.click(getByText("go"));

    expect(seen).not.toHaveBeenCalled();
  });
});
