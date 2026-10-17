import { MantineProvider } from "@mantine/core";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { FlashcardDashboardView } from "./index";

const queries = vi.hoisted(() => ({ sets: vi.fn(), stats: vi.fn() }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useFlashcardSetsQuery: (options: unknown) => queries.sets(options),
  useFlashcardStatsQuery: () => queries.stats(),
}));

function renderDashboard(initialTab: "decks" | "stats" = "decks") {
  return render(
    <MantineProvider theme={theme} env="test">
      <LanguageProvider>
        <FlashcardDashboardView initialTab={initialTab} />
      </LanguageProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  queries.sets.mockReset().mockReturnValue({
    data: {
      flashcardSets: { items: [], totalPages: 1, totalItems: 0 },
      flashcardCatalogueInfo: {
        topics: ["TOEIC", "IELTS", "Travel"],
        totalDueCount: 0,
      },
    },
    loading: false,
  });
  queries.stats.mockReset().mockReturnValue({ data: undefined });
  localStorage.setItem("englow3_lang", "vi");
  window.history.replaceState(null, "", "/study/flashcards?filter=IELTS#sets");
});

it("queries the backend when a topic is chosen and keeps it in the URL", async () => {
  const user = userEvent.setup();
  renderDashboard();
  await user.click(screen.getByText("TOEIC"));
  expect(queries.sets).toHaveBeenLastCalledWith(
    expect.objectContaining({
      variables: expect.objectContaining({
        topic: "TOEIC",
        page: 0,
        sortBy: "due",
      }),
      fetchPolicy: "network-only",
    }),
  );
  expect(new URLSearchParams(window.location.search).get("topic")).toBe(
    "TOEIC",
  );
  expect(window.location.hash).toBe("#sets");
});

it("sends sort changes to the backend and stores them in the URL", async () => {
  const user = userEvent.setup();
  renderDashboard();
  await user.click(screen.getByRole("combobox", { name: "Sắp xếp" }));
  await user.click(
    screen.getByRole("option", { name: "Tiến độ học cao nhất" }),
  );
  expect(queries.sets).toHaveBeenLastCalledWith(
    expect.objectContaining({
      variables: expect.objectContaining({ sortBy: "progress", page: 0 }),
    }),
  );
  expect(new URLSearchParams(window.location.search).get("sort")).toBe(
    "progress",
  );
});

it("restores query conditions when browser history changes", () => {
  renderDashboard();
  act(() => {
    window.history.pushState(
      null,
      "",
      "/study/flashcards?topic=Travel&sort=cards&page=2",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  expect(queries.sets).toHaveBeenLastCalledWith(
    expect.objectContaining({
      variables: expect.objectContaining({
        topic: "Travel",
        sortBy: "cards",
        page: 1,
      }),
    }),
  );
});

it("keeps tabs visible while statistics load independently of the deck list", () => {
  queries.stats.mockReturnValue({ loading: true, data: undefined });
  queries.sets.mockReturnValue({ loading: true, data: undefined });
  renderDashboard("stats");
  expect(screen.getByRole("radio", { name: "Thống kê học tập" })).toBeChecked();
  expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
});

it("keeps the selected tab on reload without losing other URL state", async () => {
  const user = userEvent.setup();
  const view = renderDashboard();
  await user.click(screen.getByText("Thống kê học tập"));
  expect(new URLSearchParams(window.location.search).get("tab")).toBe("stats");
  expect(new URLSearchParams(window.location.search).get("filter")).toBe(
    "IELTS",
  );
  expect(window.location.hash).toBe("#sets");

  view.unmount();
  const tab = new URLSearchParams(window.location.search).get("tab");
  renderDashboard(tab === "stats" ? "stats" : "decks");
  expect(screen.getByRole("radio", { name: "Thống kê học tập" })).toBeChecked();
  await user.click(screen.getByText("Bộ từ vựng"));
  expect(new URLSearchParams(window.location.search).get("tab")).toBe("decks");
});
