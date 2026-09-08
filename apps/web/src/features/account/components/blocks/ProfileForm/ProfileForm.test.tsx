import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { Gender, OnboardingStep } from "@/lib/graphql/generated";
import type { AccountProfile } from "../../../types";
import { ProfileForm } from "./index";

const mockProfile: NonNullable<AccountProfile> = {
  id: "user-123",
  email: "learner@example.com",
  fullName: "Nguyen Van A",
  displayName: "vana",
  gender: Gender.MALE,
  birthDate: "2000-01-15",
  avatarUrl: null,
  bannerUrl: null,
  onboardingStep: OnboardingStep.COMPLETED,
  onboardingState: null,
};

function renderForm(props: Partial<Parameters<typeof ProfileForm>[0]> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <MantineProvider theme={theme}>
      <ProfileForm
        profile={mockProfile}
        isSubmitting={false}
        onSubmit={onSubmit}
        {...props}
      />
    </MantineProvider>,
  );
  return { onSubmit };
}

describe("ProfileForm", () => {
  it("renders with initial profile values", () => {
    renderForm();

    expect(screen.getByLabelText(/Họ và tên/)).toHaveValue("Nguyen Van A");
    expect(screen.getByLabelText(/Tên hiển thị/)).toHaveValue("vana");
    expect(screen.getByLabelText(/Địa chỉ email/)).toHaveValue(
      "learner@example.com",
    );
    expect(screen.getByLabelText(/Ngày sinh/)).toHaveValue("2000-01-15");
  });

  it("shows error when fullName is cleared and submitted", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const fullNameInput = screen.getByLabelText(/Họ và tên/);
    await user.clear(fullNameInput);

    const submitBtn = screen.getByRole("button", { name: /Lưu thay đổi/ });
    await user.click(submitBtn);

    expect(
      await screen.findByText("Vui lòng nhập họ và tên"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows error when displayName is cleared and submitted", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const displayNameInput = screen.getByLabelText(/Tên hiển thị/);
    await user.clear(displayNameInput);

    const submitBtn = screen.getByRole("button", { name: /Lưu thay đổi/ });
    await user.click(submitBtn);

    expect(
      await screen.findByText("Vui lòng nhập tên hiển thị"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows error when birthDate is set to future date", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const birthDateInput = screen.getByLabelText(/Ngày sinh/);
    await user.clear(birthDateInput);
    await user.type(birthDateInput, "2099-01-01");

    const submitBtn = screen.getByRole("button", { name: /Lưu thay đổi/ });
    await user.click(submitBtn);

    expect(
      await screen.findByText("Ngày sinh phải là ngày trong quá khứ"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with updated values when valid", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const fullNameInput = screen.getByLabelText(/Họ và tên/);
    await user.clear(fullNameInput);
    await user.type(fullNameInput, "Nguyen Van B");

    const submitBtn = screen.getByRole("button", { name: /Lưu thay đổi/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Nguyen Van B",
          displayName: "vana",
          gender: Gender.MALE,
          birthDate: "2000-01-15",
        }),
      );
    });
  });
});
