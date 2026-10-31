import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import type { FlashcardSet } from "../../../types";
import { FlashcardSetList } from "../../blocks/FlashcardSetList";
import { FlashcardSetDetailView } from "./index";

const mocks = vi.hoisted(() => ({ detail: vi.fn() }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useFlashcardSetDetailQuery: () => mocks.detail(),
}));

const set: FlashcardSet = {
  id: "travel",
  slug: "travel",
  name: "Travel vocabulary",
  description: "Useful words for travel.",
  topic: "Travel",
  targetLevel: "A1",
  cardCount: 10,
  dueCount: 0,
  masteredCount: 0,
  lastStudiedAt: null,
};

function renderSet(overrides: Partial<FlashcardSet>, withList = false) {
  const current = { ...set, ...overrides };
  mocks.detail.mockReturnValue({
    data: { flashcardSet: { set: current, cards: [] } },
    loading: false,
  });
  return render(
    <MantineProvider theme={theme} env="test">
      <LanguageProvider>
        <FlashcardSetDetailView setId={set.id} />
        {withList && <FlashcardSetList sets={[current]} />}
      </LanguageProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  localStorage.setItem("englow3_lang", "vi");
});

it.each([
  { dueCount: 0, lastStudiedAt: null, label: "Chưa học" },
  {
    dueCount: 0,
    lastStudiedAt: "2026-10-16T10:00:00Z",
    label: "Hôm nay chưa có thẻ nào đến hạn ôn.",
  },
  {
    dueCount: 2,
    lastStudiedAt: "2026-10-16T10:00:00Z",
    label: "2 từ cần ôn tập hôm nay",
  },
])("shows the actual review state: $label", ({ label, ...overrides }) => {
  renderSet(overrides);
  expect(
    screen.queryByText("Đã hoàn thành mục tiêu hôm nay"),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(label);
});

it("hides generated import metadata in both detail and list views", () => {
  const description =
    "Generated vocabulary at A1, imported for review on 2026-09-24T15:23:10.919208400Z.";
  renderSet({ description }, true);
  expect(screen.queryAllByText(description)).toHaveLength(0);
});

it("keeps descriptions authored for learners in both views", () => {
  renderSet({}, true);
  expect(screen.getAllByText(set.description)).toHaveLength(2);
});
