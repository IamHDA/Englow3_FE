import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cancelNavigationProgress, NavigationProgress } from "./index";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

function renderWithLink(href: string, extra: Record<string, string> = {}) {
  const view = render(
    <>
      <NavigationProgress />
      <a href={href} {...extra}>
        go
      </a>
    </>,
  );
  const link = view.getByText("go");
  const bar = () => view.container.querySelector('[aria-hidden="true"]');
  return { link, bar };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("NavigationProgress", () => {
  it("shows the bar when a link to another page is clicked", () => {
    const { link, bar } = renderWithLink("/exams");
    act(() => {
      vi.runOnlyPendingTimers();
    });

    fireEvent.click(link);

    expect(bar()).not.toBeNull();
  });

  // A guard that opens the login form instead of navigating must not leave
  // a bar crawling across the top forever.
  it("takes the bar down when the navigation is cancelled", () => {
    const { link, bar } = renderWithLink("/exams");
    act(() => {
      vi.runOnlyPendingTimers();
    });

    fireEvent.click(link);
    act(() => cancelNavigationProgress());

    expect(bar()).toBeNull();
  });

  it("ignores a link that opens in a new tab", () => {
    const { link, bar } = renderWithLink("/exams", { target: "_blank" });
    act(() => {
      vi.runOnlyPendingTimers();
    });

    fireEvent.click(link);

    expect(bar()).toBeNull();
  });

  it("gives up on a navigation that never changes the page", () => {
    const { link, bar } = renderWithLink("/exams");
    act(() => {
      vi.runOnlyPendingTimers();
    });

    fireEvent.click(link);
    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(bar()).toBeNull();
  });
});
