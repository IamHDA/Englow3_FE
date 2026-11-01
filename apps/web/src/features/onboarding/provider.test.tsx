import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingStep, Role } from "@/lib/graphql/generated";

import { useOnboarding } from "./hooks/useOnboarding";
import { OnboardingProvider } from "./provider";

const state = vi.hoisted(() => ({
  step: "COMPLETED" as string,
  role: "LEARNER" as string,
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/profile" }));
vi.mock("@/features/account", () => ({
  useAccountProfile: () => ({
    profile: { role: state.role, onboardingStep: state.step },
    refresh: state.refresh,
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <OnboardingProvider>{children}</OnboardingProvider>
);

beforeEach(() => {
  state.step = OnboardingStep.COMPLETED;
  state.role = Role.LEARNER;
  state.refresh.mockReset().mockResolvedValue(undefined);
});

describe("OnboardingProvider", () => {
  it("opens by itself while onboarding is unfinished, at the saved step", () => {
    state.step = OnboardingStep.CURRENT_LEVEL;
    const { result } = renderHook(useOnboarding, { wrapper });

    expect(result.current.opened).toBe(true);
    expect(result.current.editing).toBe(false);
    expect(result.current.step).toBe(OnboardingStep.CURRENT_LEVEL);
  });

  /**
   * "Update learning goals" on the profile did nothing for a learner who had
   * finished: the popup only ever opened for an unfinished onboarding.
   */
  it("lets a learner who finished edit their goals from the first step", () => {
    const { result } = renderHook(useOnboarding, { wrapper });
    expect(result.current.opened).toBe(false);

    act(() => result.current.open());

    expect(result.current.opened).toBe(true);
    expect(result.current.editing).toBe(true);
    expect(result.current.step).toBe(OnboardingStep.LEARNING_PURPOSES);

    act(() => result.current.advanceEdit(OnboardingStep.LEARNING_GOAL));
    expect(result.current.step).toBe(OnboardingStep.LEARNING_GOAL);

    act(() => result.current.advanceEdit(null));
    expect(result.current.opened).toBe(false);
  });

  it("ends an edit when the popup is closed", () => {
    const { result } = renderHook(useOnboarding, { wrapper });
    act(() => result.current.open());

    act(() => result.current.close());

    expect(result.current.opened).toBe(false);
    expect(result.current.editing).toBe(false);
  });

  it("has nothing to edit for staff", () => {
    state.role = Role.STAFF;
    const { result } = renderHook(useOnboarding, { wrapper });

    act(() => result.current.open());

    expect(result.current.opened).toBe(false);
  });
});
