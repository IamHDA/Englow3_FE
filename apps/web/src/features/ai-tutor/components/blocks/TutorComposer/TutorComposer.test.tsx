import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TutorComposer } from "./index";

describe("TutorComposer", () => {
  it("retains the draft on failure and clears it only after delivery", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const user = userEvent.setup();
    render(
      <MantineProvider>
        <TutorComposer onSend={send} disabled={false} />
      </MantineProvider>,
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "Explain this sentence");
    await user.click(screen.getByRole("button", { name: "Gửi câu hỏi" }));
    await waitFor(() => expect(input).toHaveValue("Explain this sentence"));
    await user.click(screen.getByRole("button", { name: "Gửi câu hỏi" }));
    await waitFor(() => expect(input).toHaveValue(""));
    expect(send).toHaveBeenCalledTimes(2);
  });
});
