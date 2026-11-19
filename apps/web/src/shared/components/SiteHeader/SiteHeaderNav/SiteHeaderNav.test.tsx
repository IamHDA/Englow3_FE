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
vi.mock("@/features/friends/header", () => ({
  IncomingRequestsBadge: () => <span data-testid="friend-request-badge" />,
}));

// The indicator asks the BFF how many conversations are unread; here it only
// has to be drawn, and counted, since it polls and must exist once.
vi.mock("@/features/chat/header", () => ({
  ChatUnreadIndicator: () => <span data-testid="chat-unread-indicator" />,
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
    <MantineProvider theme={theme} env="test">
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
    const language = screen.getByRole("button", {
      name: "Switch Language / Đổi ngôn ngữ",
    });
    expect(language).toHaveAttribute("aria-haspopup", "menu");
    fireEvent.click(language);
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /English \(EN\)/ }),
    );
    expect(linkTo("#how-it-works")).toHaveTextContent("How it works");
    fireEvent.click(language);
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /Tiếng Việt \(VI\)/ }),
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

  it("gives every signed-in account the blog link, learner, staff and admin alike", () => {
    for (const role of [null, "STAFF", "ADMIN"]) {
      auth.session = { userId: "u1", email: "a@example.com", role };
      const { unmount } = render(
        <MantineProvider theme={theme} env="test">
          <LanguageProvider>
            <SiteHeaderNav>logo</SiteHeaderNav>
          </LanguageProvider>
        </MantineProvider>,
      );

      expect(linkTo("/blog")).toBeTruthy();
      unmount();
    }
  });

  it("asks a guest to sign in, as for every other section, instead of opening the blog", () => {
    renderNav();

    const click = fireEvent.click(linkTo("/blog"));

    expect(click).toBe(false);
    expect(screen.getByRole("dialog")).toBeTruthy();
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

  // The header's way into the chat, with its "something new" mark: learners
  // only, and drawn once - it polls, so a second copy in the drawer would ask
  // twice as often.
  it("gives a signed-in learner one chat indicator", () => {
    auth.session = { userId: "u1", email: "learner@example.com", role: null };
    renderNav();

    expect(screen.getAllByTestId("chat-unread-indicator")).toHaveLength(1);
  });

  it.each(["STAFF", "ADMIN"])(
    "leaves the chat indicator out for %s, who have no chat",
    (role) => {
      auth.session = { userId: "s1", email: "staff@example.com", role };
      renderNav();

      expect(screen.queryByTestId("chat-unread-indicator")).toBeNull();
    },
  );

  it("leaves the chat indicator out for a guest", () => {
    renderNav();

    expect(screen.queryByTestId("chat-unread-indicator")).toBeNull();
  });
});
