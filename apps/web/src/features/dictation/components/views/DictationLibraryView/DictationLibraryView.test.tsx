import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import type { DictationLesson } from "../../../types";
import { DictationLibraryView } from "./index";

const mocks = vi.hoisted(() => ({ lessons: vi.fn() }));
vi.mock("../../../hooks/useAllDictationLessons", () => ({
  useAllDictationLessons: () => mocks.lessons(),
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useDictationStatsQuery: () => ({ data: undefined }),
}));

const lessons: DictationLesson[] = Array.from({ length: 109 }, (_, index) => ({
  id: `lesson-${index + 1}`,
  slug: `lesson-${index + 1}`,
  title: `Lesson ${String(index + 1).padStart(3, "0")}`,
  topic: index < 96 ? "Work" : "Travel",
  targetLevel: "A1",
  sentenceCount: 5,
  completedSentenceCount: 0,
  totalDurationSeconds: 60,
  lastPractisedAt: null,
  publishedAt: null,
}));

function renderLibrary() {
  return render(
    <MantineProvider theme={theme} env="test">
      <LanguageProvider>
        <DictationLibraryView />
      </LanguageProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  localStorage.setItem("englow3_lang", "vi");
  mocks.lessons.mockReturnValue({ lessons, loading: false, error: undefined });
  Element.prototype.scrollIntoView = vi.fn();
});

describe("dictation library pagination", () => {
  it("limits both views to 12 lessons and includes the final lesson", async () => {
    const user = userEvent.setup();
    renderLibrary();
    expect(screen.getByRole("status")).toHaveTextContent("1–12 / 109");
    expect(screen.queryByText("Lesson 013")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Trang sau" }));
    expect(screen.getByRole("status")).toHaveTextContent("13–24 / 109");
    expect(screen.getByText("Lesson 013")).toBeInTheDocument();
    expect(screen.queryByText("Lesson 001")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Xem dạng danh sách" }),
    );
    expect(screen.getAllByRole("row")).toHaveLength(13);
    expect(screen.getByRole("status")).toHaveTextContent("13–24 / 109");

    await user.click(screen.getByRole("button", { name: "Trang 10" }));
    expect(screen.getByRole("status")).toHaveTextContent("109–109 / 109");
    expect(screen.getByText("Lesson 109")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  });

  it("filters the entire library before paginating and resets on filter or sort changes", async () => {
    const user = userEvent.setup();
    renderLibrary();
    await user.click(screen.getByRole("button", { name: "Trang 10" }));
    await user.click(screen.getByRole("combobox", { name: "Lọc theo chủ đề" }));
    await user.click(
      await screen.findByRole("option", { name: "Du lịch & Sân bay" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("1–12 / 13");
    expect(screen.getByText("Lesson 097")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Trang sau" }));
    expect(screen.getByRole("status")).toHaveTextContent("13–13 / 13");
    expect(screen.getByText("Lesson 109")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Sắp xếp bài học" }));
    await user.click(
      await screen.findByRole("option", { name: "Bài học mới nhất" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("1–12 / 13");
  });

  it("keeps the page valid after data shrinks and hides pagination for empty results", async () => {
    const user = userEvent.setup();
    const view = renderLibrary();
    await user.click(screen.getByRole("button", { name: "Trang 10" }));
    mocks.lessons.mockReturnValue({
      lessons: lessons.slice(0, 2),
      loading: false,
    });
    view.rerender(
      <MantineProvider theme={theme} env="test">
        <LanguageProvider>
          <DictationLibraryView />
        </LanguageProvider>
      </MantineProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("1–2 / 2");
    expect(
      screen.queryByRole("navigation", { name: "Phân trang bài nghe" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Lọc theo chủ đề" }));
    await user.click(
      await screen.findByRole("option", { name: "Du lịch & Sân bay" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("0–0 / 0");
    expect(
      screen.getByText(/Không có bài nào khớp bộ lọc/),
    ).toBeInTheDocument();
  });
});
