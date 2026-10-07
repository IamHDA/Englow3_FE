import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AssessmentTaskEditor } from "./AssessmentTaskEditor";

const mocks = vi.hoisted(() => ({ create: vi.fn(), edit: vi.fn() }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAssessmentCreateTaskMutation: () => [mocks.create],
  useAssessmentEditTaskMutation: () => [mocks.edit],
}));

it("fills a Speaking starter without saving automatically and preserves it on a failed save", async () => {
  mocks.create.mockRejectedValue(new Error("outage"));
  const close = vi.fn();
  render(
    <MantineProvider>
      <AssessmentTaskEditor task={null} close={close} done={vi.fn()} />
    </MantineProvider>,
  );
  fireEvent.click(
    screen.getByRole("combobox", { name: "Điền nhanh từ đề mẫu" }),
  );
  fireEvent.click(
    await screen.findByRole("option", {
      name: "Speaking Part 2 — một người truyền cảm hứng",
    }),
  );
  expect(screen.getByLabelText(/Tên đề/)).toHaveValue(
    "Part 2: A person who has inspired you",
  );
  expect(mocks.create).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Lưu đề" }));
  await waitFor(() =>
    expect(screen.getByText(/Chưa lưu được đề/)).toBeInTheDocument(),
  );
  expect(mocks.create).toHaveBeenCalledWith({
    variables: {
      input: expect.objectContaining({
        skill: "SPEAKING",
        taskType: "PART_2",
        minimumWords: 0,
        timeLimitSeconds: 120,
      }),
    },
  });
  expect(screen.getByLabelText(/Tên đề/)).toHaveValue(
    "Part 2: A person who has inspired you",
  );
  expect(close).not.toHaveBeenCalled();
});
