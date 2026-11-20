import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { IeltsFullTestGrid } from "./index";
import type { CertificateVariant } from "@/lib/graphql/generated/schemaTypes";

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useIeltsFullTestCatalogueQuery: () => ({
    data: {
      fullTests: [
        {
          id: "a1",
          title: "Academic Test 1",
          description: "",
          certificateVariant: "ACADEMIC",
        },
        {
          id: "g1",
          title: "General Test 1",
          description: "",
          certificateVariant: "GENERAL",
        },
      ],
      myFullTestSittings: [
        {
          id: "open",
          fullTestId: "a1",
          status: "IN_PROGRESS",
          overallBand: null,
          provisionalBand: null,
        },
        {
          id: "done",
          fullTestId: "a1",
          status: "COMPLETED",
          overallBand: 6.5,
          provisionalBand: 6.5,
        },
      ],
    },
    loading: false,
    refetch: vi.fn(),
  }),
}));

beforeEach(() => localStorage.setItem("englow3_lang", "vi"));

function renderGrid(variant?: string, searchQuery = "") {
  render(
    <MantineProvider>
      <IeltsFullTestGrid
        variant={variant as CertificateVariant | undefined}
        searchQuery={searchQuery}
      />
    </MantineProvider>,
  );
}

it("lists only the tab's variant, and sends an open sitting straight back to its parts", () => {
  renderGrid("ACADEMIC");
  expect(screen.getByText("Academic Test 1")).toBeInTheDocument();
  expect(screen.queryByText("General Test 1")).not.toBeInTheDocument();
  expect(screen.getByText("Band cao nhất 6.5")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Tiếp tục/ })).toHaveAttribute(
    "href",
    "/exams/full-tests/sittings/open",
  );
});

it("filters by the search box", () => {
  renderGrid(undefined, "general");
  expect(screen.queryByText("Academic Test 1")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Xem đề/ })).toHaveAttribute(
    "href",
    "/exams/full-tests/g1",
  );
});
