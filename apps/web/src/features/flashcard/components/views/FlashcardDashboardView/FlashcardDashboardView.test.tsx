import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { FlashcardDashboardView } from "./index";

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useFlashcardSetsQuery: () => ({
    data: { flashcardSets: { items: [] } },
    loading: false,
  }),
  useFlashcardStatsQuery: () => ({ data: undefined }),
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
  localStorage.setItem("englow3_lang", "vi");
  window.history.replaceState(null, "", "/study/flashcards?filter=IELTS#sets");
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
