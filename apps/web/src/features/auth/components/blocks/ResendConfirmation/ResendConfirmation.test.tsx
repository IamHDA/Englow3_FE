import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
const resend = vi.fn();
vi.mock("@/features/auth/api/authClient", () => ({
  resendConfirmation: (...args: unknown[]) => resend(...args),
}));
import { ResendConfirmation } from "./index";
beforeEach(() => vi.clearAllMocks());
it("does not send automatically and prevents another send during cooldown", async () => {
  resend.mockResolvedValue({ error: null });
  const user = userEvent.setup();
  const view = render(
    <MantineProvider>
      <ResendConfirmation email="test@example.com" />
    </MantineProvider>,
  );
  expect(resend).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole("button", { name: "Gửi lại email xác nhận" }),
  );
  expect(resend).toHaveBeenCalledWith("test@example.com");
  expect(
    await screen.findByRole("button", { name: "Gửi lại sau 60 giây" }),
  ).toBeDisabled();
  view.unmount();
});
it("shows an actionable error and allows another attempt after a connection failure", async () => {
  resend.mockRejectedValue(new TypeError("offline"));
  const user = userEvent.setup();
  render(
    <MantineProvider>
      <ResendConfirmation email="test@example.com" />
    </MantineProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: "Gửi lại email xác nhận" }),
  );
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Kiểm tra kết nối"),
  );
  expect(
    screen.getByRole("button", { name: "Gửi lại email xác nhận" }),
  ).toBeEnabled();
});
