import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { FlashcardStatsSkeleton } from "./index";

// The statistics tab waits on a placeholder shaped like the page: a period
// switch, four figure cards, then the chart and the two lists.
it("holds the layout of the statistics page while it loads", () => {
  const { container } = render(
    <MantineProvider>
      <FlashcardStatsSkeleton />
    </MantineProvider>,
  );
  expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  // 1 switch + 4 figure cards (3 each) + chart (2) + two lists (4 and 5).
  expect(container.querySelectorAll(".mantine-Skeleton-root").length).toBe(
    1 + 4 * 3 + 2 + 4 + 5,
  );
});
