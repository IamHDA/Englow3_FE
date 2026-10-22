import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { AssessmentHistory } from "./AssessmentHistory";

const history = {
  data: {
    assessmentHistory: {
      items: [
        {
          id: "a1",
          skill: "WRITING",
          status: "COMPLETED",
          createdAt: "2026-10-17T10:00:00Z",
          report: null,
          task: { title: "Task 1: Energy" },
        },
      ],
      totalPages: 3,
    },
  },
  loading: false,
  error: undefined,
  refetch: vi.fn(),
};
const notifications = {
  data: {
    assessmentNotifications: {
      items: [
        {
          attemptId: "n1",
          title: "Part 1: Hometown",
          skill: "SPEAKING",
          version: 2,
          assessedAt: "2026-10-17T10:00:00Z",
        },
      ],
      totalPages: 2,
      totalItems: 21,
    },
  },
  loading: false,
  error: undefined,
  refetch: vi.fn(),
};

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAssessmentHistoryQuery: () => history,
  useAssessmentNotificationsQuery: () => notifications,
}));

function renderPage(initial: Record<string, string> = {}) {
  localStorage.setItem("englow3_lang", "vi");
  return render(
    <MantineProvider>
      <LanguageProvider>
        <AssessmentHistory initial={initial} />
      </LanguageProvider>
    </MantineProvider>,
  );
}

// The page used to carry two lists, each with its own pager, one of them in the
// middle of the page.
describe("AssessmentHistory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows one list and one pager, with the unread count on the switch", () => {
    const { container } = renderPage();
    expect(screen.getByText("Task 1: Energy")).toBeTruthy();
    expect(screen.queryByText("Part 1: Hometown")).toBeNull();
    expect(container.querySelectorAll(".mantine-Pagination-root")).toHaveLength(
      1,
    );
    expect(screen.getByText("Chưa đọc · 21")).toBeTruthy();
  });

  it("swaps to the unread results in the same place, still with a single pager", () => {
    const { container } = renderPage();
    fireEvent.click(screen.getByText("Chưa đọc · 21"));
    expect(screen.getByText("Part 1: Hometown")).toBeTruthy();
    expect(screen.queryByText("Task 1: Energy")).toBeNull();
    expect(container.querySelectorAll(".mantine-Pagination-root")).toHaveLength(
      1,
    );
  });

  it("opens on the unread results when the address asks for them", () => {
    renderPage({ view: "unread" });
    expect(screen.getByText("Part 1: Hometown")).toBeTruthy();
  });
});
