import { expect, it } from "vitest";
import { placeTourPanel, spotlightBounds } from "./spotlightGeometry";

it.each([
  [1440, 900, 600, 150, 160, 112],
  [390, 844, 12, 150, 366, 48],
  [320, 568, 12, 360, 90, 112],
  [844, 390, 12, 260, 240, 46],
  [1280, 720, 1000, 620, 180, 48],
])(
  "keeps the panel in %sx%s without covering the highlighted control",
  (width, height, x, y, targetWidth, targetHeight) => {
    const viewport = { width, height };
    const target = spotlightBounds(
      { x, y, width: targetWidth, height: targetHeight },
      viewport,
    );
    const panel = placeTourPanel(target, viewport, 290);
    const panelHeight = Math.min(290, panel.maxHeight);
    expect(panel.left).toBeGreaterThanOrEqual(12);
    expect(panel.top).toBeGreaterThanOrEqual(12);
    expect(panel.left + panel.width).toBeLessThanOrEqual(width - 12);
    expect(panel.top + panelHeight).toBeLessThanOrEqual(height - 12);
    const overlaps =
      panel.left < target.x + target.width &&
      panel.left + panel.width > target.x &&
      panel.top < target.y + target.height &&
      panel.top + panelHeight > target.y;
    expect(overlaps).toBe(false);
  },
);

it("places the guide beside a desktop administration navigation button", () => {
  const placement = placeTourPanel(
    { x: 16, y: 180, width: 232, height: 46 },
    { width: 1440, height: 900 },
    290,
    "right",
  );
  expect(placement.side).toBe("right");
  expect(placement.left).toBeGreaterThan(248);
});

it("clips a partially visible target to the viewport", () => {
  const bounds = spotlightBounds(
    { x: -5, y: -10, width: 100, height: 50 },
    { width: 320, height: 568 },
  );
  expect(bounds.x).toBe(4);
  expect(bounds.y).toBe(4);
  expect(bounds.width).toBeGreaterThan(0);
});
