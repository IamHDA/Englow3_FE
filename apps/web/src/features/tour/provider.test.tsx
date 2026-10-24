import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingStep, Role } from "@/lib/graphql/generated";

import { UserTourProvider, useUserTour } from "./provider";
import { ADMIN_TOUR, LEARNER_TOUR } from "./constants/tourSteps";

const state = vi.hoisted(() => ({
  role: "LEARNER",
  pathname: "/",
  requiresOnboarding: false,
  completed: false,
  loading: false,
  statusError: null as Error | null,
  complete: vi.fn(),
  push: vi.fn(),
  targetClick: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => ({ push: state.push }),
}));
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
        {Array.from(
          new Set([...LEARNER_TOUR, ...ADMIN_TOUR].map((step) => step.target)),
        ).map((target) => (
          <button
            key={target}
            data-tour={target}
            onClick={state.targetClick}
          >{`Open ${target}`}</button>
        ))}
      </UserTourProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      if (!this.hasAttribute("data-tour")) return new DOMRect(0, 0, 0, 0);
      return new DOMRect(100, 200, 180, 48);
    },
  );
  state.role = Role.LEARNER;
  state.pathname = "/";
  state.requiresOnboarding = false;
  state.completed = false;
  state.loading = false;
  state.statusError = null;
  state.push.mockReset();
  state.targetClick.mockReset();
  state.complete = vi
    .fn()
    .mockResolvedValue({ data: { completeMyTour: { completed: true } } });
});

describe("UserTourProvider", () => {
  it("highlights a real control for a learner whose application UUID differs from the Supabase UUID", async () => {
    renderTour();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Bài kiểm tra đầu vào")).toBeVisible();
    await waitFor(() =>
      expect(
        document.querySelector('[data-tour-highlight="learner-placement"]'),
      ).toBeInTheDocument(),
    );
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

  it("shows ten anchored learner steps and persists a skip", async () => {
    renderTour();

    expect(screen.getByText("Bước 1 / 10")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ qua" }));

    await waitFor(() => expect(state.complete).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("moves the highlight to the next button and back without saving completion", async () => {
    renderTour();
    fireEvent.click(screen.getByRole("button", { name: "Tiếp" }));
    await waitFor(() =>
      expect(
        document.querySelector('[data-tour-highlight="learner-daily-path"]'),
      ).toBeInTheDocument(),
    );
    expect(
      document.querySelector('[data-tour-highlight="learner-placement"]'),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    await waitFor(() =>
      expect(
        document.querySelector('[data-tour-highlight="learner-placement"]'),
      ).toBeInTheDocument(),
    );
    expect(state.complete).not.toHaveBeenCalled();
  });

  it("lets a learner activate the highlighted control without marking the guide completed", async () => {
    renderTour();
    fireEvent.click(
      await screen.findByRole("button", { name: "Dùng mục này" }),
    );
    expect(state.targetClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(state.complete).not.toHaveBeenCalled();
  });

  it("does not interrupt a sitting and returns to the tour home only on explicit replay", () => {
    state.pathname = "/exams/in-progress";
    renderTour();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(state.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Replay tour" }));
    expect(state.push).toHaveBeenCalledWith("/");
  });

  it("allows a temporary close if completion cannot be saved", async () => {
    state.complete.mockRejectedValue(new Error("Backend unavailable"));
    renderTour();
    fireEvent.click(screen.getByRole("button", { name: "Bỏ qua" }));
    fireEvent.click(await screen.findByRole("button", { name: "Đóng tạm" }));
    expect(screen.queryByRole("dialog")).toBeNull();
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
