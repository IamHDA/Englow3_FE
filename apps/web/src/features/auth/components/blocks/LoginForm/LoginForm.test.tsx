import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { LoginSubmitResult } from "@/features/auth/types";

import { LoginForm } from ".";

function renderForm(
  onSubmit: (values: {
    email: string;
    password: string;
  }) => Promise<LoginSubmitResult>,
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  return {
    user: userEvent.setup(),
    ...render(<LoginForm onSubmit={onSubmit} />, { wrapper }),
  };
}

const succeed = async (): Promise<LoginSubmitResult> => ({ status: "success" });

describe("LoginForm", () => {
  it("submits trimmed values when both fields are valid", async () => {
    const onSubmit = vi.fn(succeed);
    const { user } = renderForm(onSubmit);

    await user.type(screen.getByLabelText("Email"), "  hoa@englow3.com  ");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        email: "hoa@englow3.com",
        password: "secret123",
      }),
    );
  });

  it("blocks submit and shows a message when fields are empty", async () => {
    const onSubmit = vi.fn(succeed);
    const { user } = renderForm(onSubmit);

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Enter your email")).toBeVisible();
    expect(await screen.findByText("Enter your password")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a message when the email is malformed", async () => {
    const onSubmit = vi.fn(succeed);
    const { user } = renderForm(onSubmit);

    await user.type(screen.getByLabelText("Email"), "hoa@");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Enter a valid email address")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("maps server field errors onto their inputs", async () => {
    const onSubmit = vi.fn(
      async (): Promise<LoginSubmitResult> => ({
        status: "error",
        fieldErrors: { password: "Wrong password" },
      }),
    );
    const { user } = renderForm(onSubmit);

    await user.type(screen.getByLabelText("Email"), "hoa@englow3.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Wrong password")).toBeVisible();
  });

  it("shows a form-level alert for an error not tied to a field", async () => {
    const onSubmit = vi.fn(
      async (): Promise<LoginSubmitResult> => ({
        status: "error",
        message: "Service unavailable",
      }),
    );
    const { user } = renderForm(onSubmit);

    await user.type(screen.getByLabelText("Email"), "hoa@englow3.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
  });

  it("does not submit twice while a submit is in flight", async () => {
    let release: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<LoginSubmitResult>((resolve) => {
          release = () => resolve({ status: "success" });
        }),
    );
    const { user } = renderForm(onSubmit);

    await user.type(screen.getByLabelText("Email"), "hoa@englow3.com");
    await user.type(screen.getByLabelText("Password"), "secret123");

    const submitButton = screen.getByRole("button", { name: "Login" });
    await user.click(submitButton);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    release?.();
  });
});
