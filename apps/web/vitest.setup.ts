import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// findBy*/waitFor give up after one second by default. With the whole suite
// running in parallel a Mantine-heavy render can take longer than that on a
// busy machine, and a test that passes alone fails in the full run - the
// dictation mistake queue did. Three seconds is slack, not a slower suite: a
// passing wait still returns the moment the text appears.
configure({ asyncUtilTimeout: 3000 });

// The files that test server code run under plain Node, which has no window;
// everything below is about the DOM that component tests render into.
if (typeof window !== "undefined") {
  // Mantine probes matchMedia while computing responsive styles; jsdom has no
  // implementation.
  window.matchMedia =
    window.matchMedia ||
    ((query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList);

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;

  // Mantine's autosizing Textarea re-measures once web fonts finish loading, by
  // listening on document.fonts. jsdom has no FontFaceSet, so any screen with an
  // autosizing field threw on mount before a test could look at it.
  if (!("fonts" in document)) {
    Object.defineProperty(document, "fonts", {
      value: {
        addEventListener: () => {},
        removeEventListener: () => {},
        ready: Promise.resolve(),
      },
    });
  }
}
