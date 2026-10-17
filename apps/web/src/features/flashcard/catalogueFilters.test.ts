import { expect, it } from "vitest";
import { flashcardFiltersFromUrl } from "./catalogueFilters";

it("restores server-side filter and sort conditions from a shared URL", () => {
  expect(
    flashcardFiltersFromUrl(
      Object.fromEntries(
        new URLSearchParams("topic=TOEIC&q=travel&sort=progress&page=3"),
      ),
    ),
  ).toEqual({ topic: "TOEIC", q: "travel", sort: "progress", page: 3 });
});

it("normalizes defaults and invalid query values", () => {
  expect(
    flashcardFiltersFromUrl({
      topic: "ALL",
      q: "  ",
      sort: "unknown",
      page: "-8",
    }),
  ).toEqual({ topic: "ALL", q: "", sort: "due", page: 1 });
});

it("accepts repeated URL parameters without throwing during server rendering", () => {
  expect(
    flashcardFiltersFromUrl({
      q: [" travel ", "other"],
      topic: ["TOEIC", "IELTS"],
      page: [],
    }),
  ).toEqual({ topic: "TOEIC", q: "travel", sort: "due", page: 1 });
});
