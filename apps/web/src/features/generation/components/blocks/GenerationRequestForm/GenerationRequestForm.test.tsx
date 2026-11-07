import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { GenerationRequestForm } from "./index";

function renderForm(
  props: Partial<Parameters<typeof GenerationRequestForm>[0]> = {},
) {
  const onSubmit = vi.fn().mockResolvedValue(true);
  render(
    <MantineProvider theme={theme}>
      <GenerationRequestForm
        remaining={3}
        limit={3}
        inProgress={false}
        submitting={false}
        onSubmit={onSubmit}
        {...props}
      />
    </MantineProvider>,
  );
  return { onSubmit };
}

const brief = () => screen.getByRole("textbox", { name: /Yêu cầu riêng/ });
const button = () => screen.getByRole("button", { name: /Tạo bộ đề IELTS/ });

describe("GenerationRequestForm", () => {
  it("sends the brief trimmed and clears it once the request has started", async () => {
    const { onSubmit } = renderForm();
    fireEvent.change(brief(), { target: { value: "  science topics  " } });

    fireEvent.click(button());

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ brief: "science topics" }),
    );
    await waitFor(() => expect(brief()).toHaveValue(""));
  });

  it("starts without a brief, for the default set", async () => {
    const { onSubmit } = renderForm();

    fireEvent.click(button());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ brief: "" }));
  });

  it("keeps the brief when the request was refused", async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    renderForm({ onSubmit });
    fireEvent.change(brief(), { target: { value: "rivers" } });

    fireEvent.click(button());

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(brief()).toHaveValue("rivers");
  });

  it("refuses a brief over the limit before asking the backend", async () => {
    const { onSubmit } = renderForm();
    fireEvent.change(brief(), { target: { value: "x".repeat(1001) } });

    fireEvent.click(button());

    expect(await screen.findByText(/tối đa 1000 ký tự/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("is held when today's requests are used or one is still running", () => {
    renderForm({ remaining: 0 });
    expect(button()).toBeDisabled();
  });

  it("says why it is held while a request is running", () => {
    renderForm({ inProgress: true });
    expect(button()).toBeDisabled();
    expect(screen.getByText(/đang có một lượt chưa xong/)).toBeInTheDocument();
  });
});
