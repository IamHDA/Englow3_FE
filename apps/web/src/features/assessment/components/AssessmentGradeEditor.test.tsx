import { MantineProvider } from "@mantine/core";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { PracticeAttempt } from "../types";
import { AssessmentGradeEditor } from "./AssessmentGradeEditor";
const mocks = vi.hoisted(() => ({ grade: vi.fn() }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAssessmentGradeMutation: () => [mocks.grade],
}));
describe("Manual grading", () => {
  it("keeps feedback and the modal open when publishing a grade fails", async () => {
    mocks.grade.mockRejectedValue(new Error("outage"));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const close = vi.fn();
    const attempt = {
      id: "id",
      skill: "WRITING",
      task: { title: "Essay", instructions: "Discuss" },
      status: "NEEDS_REVIEW",
      answerText: "Essay",
      wordCount: 1,
    } as PracticeAttempt;
    render(
      <MantineProvider>
        <AssessmentGradeEditor attempt={attempt} close={close} done={vi.fn()} />
      </MantineProvider>,
    );
    await act(async () => {});
    expect(screen.getAllByLabelText(/· điểm 0–9/)).toHaveLength(4);
    // A new grade deliberately has no preselected score.
    expect(
      screen.getByRole("button", { name: "Lưu và công bố kết quả" }),
    ).toBeDisabled();
    for (const input of screen.getAllByLabelText(/· điểm 0–9/))
      fireEvent.change(input, { target: { value: "6" } });
    for (const input of screen.getAllByLabelText(/Nhận xét có dẫn chứng/))
      fireEvent.change(input, { target: { value: "Specific evidence" } });
    fireEvent.change(screen.getByLabelText(/Nhận xét tổng quan/), {
      target: { value: "Clear main idea" },
    });
    fireEvent.change(screen.getByLabelText(/Ghi chú kiểm duyệt/), {
      target: { value: "Initial assessment" },
    });
    fireEvent.click(screen.getByText("Lưu và công bố kết quả"));
    await waitFor(() =>
      expect(screen.getByText(/Chưa lưu được kết quả/)).toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/Nhận xét tổng quan/)).toHaveValue(
      "Clear main idea",
    );
    expect(close).not.toHaveBeenCalled();
  });
});
