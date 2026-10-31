"use client";

import { useEffect, useState } from "react";
import type { TourRect, TourViewport } from "./spotlightGeometry";

type Measurement = {
  target: string;
  element: HTMLElement | null;
  rect: TourRect | null;
  viewport: TourViewport;
};

export function useTourTarget(target: string, opened: boolean, retry: number) {
  const [measurement, setMeasurement] = useState<Measurement>({
    target: "",
    element: null,
    rect: null,
    viewport: { width: 1024, height: 768 },
  });
  useEffect(() => {
    if (!opened) return;
    let frame = 0;
    let settleFrame = 0;
    let observed: HTMLElement | null = null;
    let scrolled: HTMLElement | null = null;
    const measure = () => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const element =
        Array.from(
          document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`),
        ).find((node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden"
          );
        }) ?? null;
      if (element !== observed) {
        resize.disconnect();
        if (element) resize.observe(element);
        observed = element;
      }
      const bounds = element?.getBoundingClientRect();
      if (element && bounds && element !== scrolled) {
        scrolled = element;
        if (bounds.top < 80 || bounds.bottom > viewport.height - 24) {
          element.scrollIntoView({
            block: "center",
            inline: "nearest",
            behavior: "instant",
          });
        }
      }
      const visible =
        bounds &&
        bounds.right > 0 &&
        bounds.left < viewport.width &&
        bounds.bottom > 0 &&
        bounds.top < viewport.height;
      const rect = visible
        ? {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          }
        : null;
      setMeasurement((previous) => {
        if (
          previous.target === target &&
          previous.element === element &&
          previous.viewport.width === viewport.width &&
          previous.viewport.height === viewport.height &&
          JSON.stringify(previous.rect) === JSON.stringify(rect)
        )
          return previous;
        return { target, element, rect, viewport };
      });
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };
    const resize = new ResizeObserver(schedule);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden"],
    });
    document.addEventListener("scroll", schedule, true);
    document.addEventListener("transitionend", schedule, true);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    // Track a mobile navigation opening animation and the first layout updates.
    const until = performance.now() + 1000;
    const settle = () => {
      measure();
      if (performance.now() < until)
        settleFrame = requestAnimationFrame(settle);
    };
    settleFrame = requestAnimationFrame(settle);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settleFrame);
      resize.disconnect();
      mutations.disconnect();
      document.removeEventListener("scroll", schedule, true);
      document.removeEventListener("transitionend", schedule, true);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, [target, opened, retry]);
  return {
    ...measurement,
    rect: opened && measurement.target === target ? measurement.rect : null,
    element: measurement.target === target ? measurement.element : null,
  };
}
