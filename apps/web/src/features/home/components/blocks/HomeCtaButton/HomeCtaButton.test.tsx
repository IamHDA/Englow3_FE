import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { HomeCtaButton } from "./index";

const state = vi.hoisted(() => ({
  session: null as { role: string | null } | null,
  requiresOnboarding: false,
  openOnboarding: vi.fn(),
}));

vi.mock("@/features/auth", async () => {
  const { homeForRole } = await import("@/features/auth/types");
  return {
    homeForRole,
    useAuth: () => ({ session: state.session }),
    AuthModal: ({ opened }: { opened: boolean }) =>
      opened ? <div role="dialog">Sign in</div> : null,
  };
});
vi.mock("@/features/onboarding", () => ({
  useOnboarding: () => ({
    requiresOnboarding: state.requiresOnboarding,
    open: state.openOnboarding,
  }),
}));

function renderCta() {
  render(
    <MantineProvider theme={theme}>
      <HomeCtaButton label="Continue" />
    </MantineProvider>,
  );
}

beforeEach(() => {
  state.session = null;
  state.requiresOnboarding = false;
  vi.clearAllMocks();
});

describe("HomeCtaButton", () => {
  it.each(["ADMIN", "STAFF"])(
    "sends %s to their workspace without learner onboarding",
    (role) => {
      state.session = { role };
      state.requiresOnboarding = true;
      renderCta();
      expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
        "href",
        "/admin",
      );
      expect(state.openOnboarding).not.toHaveBeenCalled();
    },
  );

  it("continues an onboarded learner's daily path", () => {
    state.session = { role: "LEARNER" };
    renderCta();
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      "/study/daily-path",
    );
  });

  it("opens goal setup for a learner who has not finished onboarding", () => {
    state.session = { role: "LEARNER" };
    state.requiresOnboarding = true;
    renderCta();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(state.openOnboarding).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens sign in for a guest", () => {
    renderCta();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
