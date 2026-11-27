import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useConfirm } from "./useConfirm";

function Harness({ onAnswer }: { onAnswer: (confirmed: boolean) => void }) {
  const { confirm, confirmModal } = useConfirm();
  return (
    <>
      <button
        onClick={() =>
          void confirm({
            title: "Lưu trữ đề?",
            body: "Đề sẽ ẩn khỏi thư viện.",
            confirmLabel: "Lưu trữ",
            danger: true,
          }).then(onAnswer)
        }
      >
        ask
      </button>
      {confirmModal}
    </>
  );
}

function renderHarness() {
  const onAnswer = vi.fn();
  render(
    <MantineProvider>
      <Harness onAnswer={onAnswer} />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "ask" }));
  return onAnswer;
}

describe("useConfirm", () => {
  it("asks in a dialog and resolves true once confirmed", async () => {
    const onAnswer = renderHarness();
    expect(
      await screen.findByText("Đề sẽ ẩn khỏi thư viện."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Lưu trữ" }));
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith(true));
  });

  it("resolves false when cancelled", async () => {
    const onAnswer = renderHarness();
    fireEvent.click(await screen.findByRole("button", { name: "Huỷ" }));
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith(false));
  });
});
