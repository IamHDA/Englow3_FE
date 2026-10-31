import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RejectContentModal } from "./index";

describe("content review note", () => {
  it("keeps the reason until the parent confirms success", async () => {
    const confirm = vi.fn();
    const user = userEvent.setup();
    render(
      <MantineProvider>
        <RejectContentModal
          itemTitle="Draft"
          submitting={false}
          onCancel={vi.fn()}
          onConfirm={confirm}
        />
      </MantineProvider>,
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "Missing audio");
    await user.click(screen.getByRole("button", { name: "Trả lại" }));
    expect(confirm).toHaveBeenCalledWith("Missing audio");
    expect(input).toHaveValue("Missing audio");
  });
});
