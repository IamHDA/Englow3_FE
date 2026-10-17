import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SubmitModal } from "./index";

it("keeps the submission modal open and disables its actions throughout pending work", () => {
  const onClose = vi.fn();
  const onConfirmSubmit = vi.fn();
  render(
    <MantineProvider>
      <SubmitModal
        opened
        totalQuestions={10}
        answeredCount={4}
        flaggedCount={0}
        submitting
        onClose={onClose}
        onConfirmSubmit={onConfirmSubmit}
      />
    </MantineProvider>,
  );
  expect(screen.getByRole("status")).toBeInTheDocument();
  for (const button of screen.getAllByRole("button"))
    expect(button).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(onClose).not.toHaveBeenCalled();
  expect(onConfirmSubmit).not.toHaveBeenCalled();
});
