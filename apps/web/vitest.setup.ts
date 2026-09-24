import "@testing-library/jest-dom/vitest";

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
