import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { AssessmentAssignmentPanel } from "./AssessmentAssignmentPanel";
const mocks = vi.hoisted(() => ({
  assign: vi.fn(),
  refetch: vi.fn(),
  role: "ADMIN",
}));
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ session: { role: mocks.role } }),
}));
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: true }),
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAssessmentAssignmentQuery: () => ({
    refetch: mocks.refetch,
    data: {
      assessmentAssignment: {
        attemptId: "attempt",
        reviewerId: null,
        reviewerName: null,
        version: 4,
        history: [],
      },
      assessmentReviewers: [
        { id: "reviewer", displayName: "Assigned reviewer" },
      ],
    },
  }),
  useAssignAssessmentMutation: () => [mocks.assign, { loading: false }],
}));
beforeEach(() => {
  mocks.role = "ADMIN";
  mocks.assign.mockReset().mockResolvedValue({});
  mocks.refetch.mockReset().mockResolvedValue({});
});
it("requires a reviewer and reason and submits the version that was loaded", async () => {
  render(
    <MantineProvider env="test">
      <AssessmentAssignmentPanel id="attempt" status="NEEDS_REVIEW" />
    </MantineProvider>,
  );
  const user = userEvent.setup();
  expect(screen.getByRole("button", { name: "Giao chấm" })).toBeDisabled();
  await user.click(screen.getByRole("combobox", { name: "Người chấm" }));
  await user.click(screen.getByText("Assigned reviewer"));
  await user.type(screen.getByLabelText("Lý do phân công"), "Balance queue");
  await user.click(screen.getByRole("button", { name: "Giao chấm" }));
  await waitFor(() =>
    expect(mocks.assign).toHaveBeenCalledWith({
      variables: {
        id: "attempt",
        reviewerId: "reviewer",
        version: 4,
        note: "Balance queue",
      },
    }),
  );
  expect(mocks.refetch).toHaveBeenCalled();
});
it("hides administrative assignment actions from staff", () => {
  mocks.role = "STAFF";
  render(
    <MantineProvider env="test">
      <AssessmentAssignmentPanel id="attempt" status="NEEDS_REVIEW" />
    </MantineProvider>,
  );
  expect(screen.queryByRole("button", { name: "Giao chấm" })).toBeNull();
});
