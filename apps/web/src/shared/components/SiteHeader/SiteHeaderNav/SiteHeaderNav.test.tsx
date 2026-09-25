import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";

import { SiteHeaderNav } from "./index";

const auth = vi.hoisted(() => ({
  session: null as { userId: string; email: string } | null,
}));
const guardOnboarding = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

// The real modal pulls in the Supabase client; what matters here is only
// whether the header asked for it.
vi.mock("@/features/auth", () => ({
  ADMIN_ROLE: "ADMIN",
  useAuth: () => ({ session: auth.session, signOut: vi.fn() }),
  AuthModal: ({ opened }: { opened: boolean }) =>
    opened ? <div role="dialog">login form</div> : null,
}));

vi.mock("@/features/account", () => ({
  useAccountProfile: () => ({ profile: null }),
}));

vi.mock("@/features/onboarding", () => ({
  useOnboarding: () => ({ requiresOnboarding: false }),
  useOnboardingGuard: () => guardOnboarding,
}));

function renderNav() {
  render(
    <MantineProvider theme={theme}>
      <LanguageProvider>
        <SiteHeaderNav>logo</SiteHeaderNav>
      </LanguageProvider>
    </MantineProvider>,
  );
}

/** First link to the page: the desktop bar comes before the mobile drawer. */
function linkTo(href: string) {
  const link = screen
    .getAllByRole("link", { hidden: true })
    .find((element) => element.getAttribute("href") === href);
  if (!link) throw new Error(`no link to ${href}`);
  return link;
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.session = null;
});

describe("SiteHeaderNav", () => {
  // Every feature needs an account. A guest who clicks one is asked to sign
  // in where they are, not sent to a page whose every request would fail.
  it("opens the login form instead of navigating when signed out", () => {
    renderNav();

    const click = fireEvent.click(linkTo("/exams"));

    expect(click).toBe(false); // default prevented: no navigation
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(guardOnboarding).not.toHaveBeenCalled();
  });

  it("lets a signed-in learner through to the onboarding check", () => {
    auth.session = { userId: "u1", email: "learner@example.com" };
    renderNav();

    fireEvent.click(linkTo("/ai-tutor"));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(guardOnboarding).toHaveBeenCalledTimes(1);
  });
});
