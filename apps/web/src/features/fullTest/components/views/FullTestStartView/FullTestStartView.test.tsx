import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { FullTestStartView } from "./index";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: false }),
}));
const sittings = vi.hoisted(() => ({ list: [] as unknown[] }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useFullTestLibraryQuery: () => ({
    data: {
      fullTests: [
        {
          id: "ft1",
          title: "IELTS Academic Test 1",
          description: "",
          certificateVariant: "ACADEMIC",
          examId: "paper",
          writingTask1Id: "w1",
          writingTask2Id: "w2",
          speakingPart1Id: "s1",
          speakingPart2Id: "s2",
          speakingPart3Id: "s3",
        },
      ],
      myFullTestSittings: sittings.list,
    },
    loading: false,
    refetch: vi.fn(),
  }),
  useStartFullTestMutation: () => [vi.fn(), { loading: false }],
}));

function renderView() {
  render(
    <MantineProvider>
      <FullTestStartView fullTestId="ft1" />
    </MantineProvider>,
  );
}

it("lets each part be practised on its own, paper and tasks alike", () => {
  sittings.list = [];
  renderView();
  const hrefs = screen
    .getAllByRole("link", { name: "Practise" })
    .map((link) => link.getAttribute("href"));
  expect(hrefs).toEqual([
    "/exams/paper?fullTest=ft1",
    "/study/writing/w1",
    "/study/writing/w2",
    "/study/speaking/s1",
    "/study/speaking/s2",
    "/study/speaking/s3",
  ]);
  expect(screen.getByRole("link", { name: /Exam library/ })).toHaveAttribute(
    "href",
    "/exams?tab=ielts_academic",
  );
});

it("opens on the real test, with the way back into an open sitting", () => {
  sittings.list = [
    {
      id: "open",
      fullTestId: "ft1",
      status: "IN_PROGRESS",
      startedAt: "2026-11-18T12:00:00Z",
      overallBand: null,
      provisionalBand: null,
    },
  ];
  renderView();
  expect(
    screen.getByRole("link", { name: "Continue your open sitting" }),
  ).toHaveAttribute("href", "/exams/full-tests/sittings/open");
  fireEvent.click(screen.getByRole("tab", { name: "Practice" }));
  expect(screen.getAllByRole("link", { name: "Practise" })).toHaveLength(6);
});
