import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";

import { SiteHeaderNav } from "./index";

const auth = vi.hoisted(() => ({
  session: null as {
    userId: string;
    email: string;
    role?: string | null;
  } | null,
}));
const guardOnboarding = vi.hoisted(() => vi.fn());

const route = vi.hoisted(() => ({ pathname: "/exams" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/shared/styles/landingFont", () => ({
  landingFont: { variable: "landing-font" },
}));

// The real modal pulls in the Supabase client; what matters here is only
// whether the header asked for it.
vi.mock("@/features/auth", () => ({
  ADMIN_ROLE: "ADMIN",
  isBackOfficeRole: (role: string | null) =>
    role === "ADMIN" || role === "STAFF",
  useAuth: () => ({ session: auth.session, signOut: vi.fn() }),
  AuthModal: ({ opened }: { opened: boolean }) =>
    opened ? <div role="dialog">login form</div> : null,
}));

// The badge asks the BFF how many requests wait; here it only has to be drawn.
vi.mock("@/features/friends", () => ({
  IncomingRequestsBadge: () => <span data-testid="friend-request-badge" />,
}));

vi.mock("@/features/account", () => ({
  useAccountProfile: () => ({ profile: null }),
}));

vi.mock("@/features/onboarding", () => ({
  useOnboarding: () => ({ requiresOnboarding: false }),
  useOnboardingGuard: () => guardOnboarding,
}));

vi.mock("@/features/tour", () => ({
  useUserTour: () => ({ canReplay: false, replay: vi.fn() }),
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
  route.pathname = "/exams";
});

describe("SiteHeaderNav", () => {
  it("uses public section links on the guest landing page and keeps sign in available", async () => {
    route.pathname = "/";
    renderNav();
    expect(linkTo("#how-it-works")).toBeTruthy();
    expect(linkTo("#learning-path")).toBeTruthy();
    expect(linkTo("#features")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Tiếng Việt" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Mở menu giới thiệu", hidden: true }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Đăng nhập" }));
    expect(screen.getByText("login form")).toBeTruthy();
  });

  // Every feature needs an account. A guest who clicks one is asked to sign
  // in where they are, not sent to a page whose every request would fail.
  it("opens the login form instead of navigating when signed out", () => {
    renderNav();

    const click = fireEvent.click(linkTo("/exams"));

    expect(click).toBe(false); // default prevented: no navigation
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(guardOnboarding).not.toHaveBeenCalled();
  });

  it("lets a signed-in learner practise without blocking on onboarding", () => {
    auth.session = { userId: "u1", email: "learner@example.com" };
    renderNav();

    fireEvent.click(linkTo("/ai-tutor"));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(guardOnboarding).not.toHaveBeenCalled();
  });

  it("gives a signed-in learner the friends link, with the waiting-requests badge", () => {
    auth.session = { userId: "u1", email: "learner@example.com", role: null };
    renderNav();

    expect(linkTo("/friends")).toBeTruthy();
    expect(
      screen.getAllByTestId("friend-request-badge").length,
    ).toBeGreaterThan(0);
  });

  // Friends are for learners: the backend refuses them for staff, so the
  // header does not offer the link (and does not ask for a count they lack).
  it("leaves the friends link, and its badge, out for staff and admin", () => {
    auth.session = { userId: "s1", email: "staff@example.com", role: "STAFF" };
    renderNav();

    expect(() => linkTo("/friends")).toThrow("no link to /friends");
    expect(screen.queryByTestId("friend-request-badge")).toBeNull();
  });

  it("shows a guest the friends link but asks for no count, and opens the login form on click", () => {
    renderNav();

    expect(screen.queryByTestId("friend-request-badge")).toBeNull();
    expect(fireEvent.click(linkTo("/friends"))).toBe(false);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
