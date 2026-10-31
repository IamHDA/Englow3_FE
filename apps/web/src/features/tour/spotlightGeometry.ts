export type TourRect = { x: number; y: number; width: number; height: number };
export type TourViewport = { width: number; height: number };
export type TourSide = "top" | "bottom" | "left" | "right";
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));

export function spotlightBounds(
  rect: TourRect,
  viewport: TourViewport,
): TourRect {
  const x = clamp(rect.x - 6, 4, viewport.width - 4);
  const y = clamp(rect.y - 6, 4, viewport.height - 4);
  return {
    x,
    y,
    width: Math.max(
      0,
      Math.min(rect.x + rect.width + 6, viewport.width - 4) - x,
    ),
    height: Math.max(
      0,
      Math.min(rect.y + rect.height + 6, viewport.height - 4) - y,
    ),
  };
}

export function placeTourPanel(
  rect: TourRect,
  viewport: TourViewport,
  panelHeight: number,
  preferred: "bottom" | "right" = "bottom",
) {
  const margin = 12;
  const gap = 14;
  const width = Math.min(360, viewport.width - margin * 2);
  const below = viewport.height - rect.y - rect.height - gap - margin;
  const above = rect.y - gap - margin;
  const rightFits =
    viewport.width - rect.x - rect.width - gap - margin >= width;
  const leftFits = rect.x - gap - margin >= width;
  let side: TourSide;
  if (preferred === "right" && rightFits) side = "right";
  else if (below >= panelHeight) side = "bottom";
  else if (above >= panelHeight) side = "top";
  else if (rightFits) side = "right";
  else if (leftFits) side = "left";
  else side = below >= above ? "bottom" : "top";
  const maxHeight = Math.max(
    96,
    side === "bottom"
      ? below
      : side === "top"
        ? above
        : viewport.height - margin * 2,
  );
  const height = Math.min(panelHeight, maxHeight);
  const left = clamp(
    side === "right"
      ? rect.x + rect.width + gap
      : side === "left"
        ? rect.x - width - gap
        : rect.x + rect.width / 2 - width / 2,
    margin,
    viewport.width - width - margin,
  );
  const top = clamp(
    side === "bottom"
      ? rect.y + rect.height + gap
      : side === "top"
        ? rect.y - height - gap
        : rect.y + rect.height / 2 - height / 2,
    margin,
    viewport.height - height - margin,
  );
  return {
    left,
    top,
    width,
    maxHeight,
    side,
    arrowX: clamp(rect.x + rect.width / 2 - left, 22, width - 22),
    arrowY: clamp(rect.y + rect.height / 2 - top, 22, height - 22),
  };
}
