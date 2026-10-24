import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingStep, Role } from "@/lib/graphql/generated";

import { UserTourProvider, useUserTour } from "./provider";

const state = vi.hoisted(() => ({
  role: "LEARNER",
  pathname: "/",
  requiresOnboarding: false,
  completed: false,
  loading: false,
  statusError: null as Error | null,
  complete: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ session: { userId: "u1", role: state.role } }),
}));
vi.mock("@/features/account", () => ({
  useAccountProfile: () => ({
    profile: {
      id: "application-user-id",
      role: state.role,
      onboardingStep: OnboardingStep.COMPLETED,
    },
  }),
}));
vi.mock("@/features/onboarding", () => ({
  useOnboarding: () => ({ requiresOnboarding: state.requiresOnboarding }),
}));
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: true }),
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useMyTourStatusQuery: () => ({
    data: { myTourStatus: { completed: state.completed } },
    loading: state.loading,
    error: state.statusError,
  }),
  useCompleteMyTourMutation: () => [state.complete],
}));

function ReplayButton() {
  const { replay } = useUserTour();
  return <button onClick={replay}>Replay tour</button>;
}

function renderTour() {
  return render(
    <MantineProvider>
      <UserTourProvider>
        <ReplayButton />
      </UserTourProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  state.role = Role.LEARNER;
  state.pathname = "/";
  state.requiresOnboarding = false;
  state.completed = false;
  state.loading = false;
  state.statusError = null;
  state.complete = vi
    .fn()
    .mockResolvedValue({ data: { completeMyTour: { completed: true } } });
});

describe("UserTourProvider", () => {
  it("opens for a new learner whose application UUID differs from the Supabase UUID", () => {
    renderTour();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Bắt đầu từ trang chủ")).toBeVisible();
  });

  it("allows manual guidance if the status request failed, without reopening automatically", () => {
    state.statusError = new Error("Service unavailable");
    renderTour();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Replay tour" }));
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("does not interrupt password recovery", () => {
    state.pathname = "/auth/reset";
    renderTour();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("waits until learner onboarding has finished", () => {
    state.requiresOnboarding = true;
    renderTour();

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows six learner steps and persists a skip", async () => {
    renderTour();

    expect(screen.getByText("Bước 1 / 6")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ qua" }));

    await waitFor(() => expect(state.complete).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("shows the staff tour only inside administration", () => {
    state.role = Role.STAFF;
    state.pathname = "/admin";
    renderTour();

    expect(screen.getByText("Bước 1 / 4")).toBeTruthy();
    expect(screen.getByText("Xem tổng quan công việc")).toBeTruthy();
  });

  it("lets an admin replay a completed tour without writing again", async () => {
    state.role = Role.ADMIN;
    state.pathname = "/admin";
    state.completed = true;
    renderTour();

    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Replay tour" }));
    expect(screen.getByText("Bước 1 / 4")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ qua" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(state.complete).not.toHaveBeenCalled();
  });
});
