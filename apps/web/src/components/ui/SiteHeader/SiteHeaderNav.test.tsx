import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// There is no app router in jsdom, and nothing here navigates.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {} }),
}));

// Signed out, and no network: the header only needs the session to resolve.
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  }),
}));

import { SiteHeaderNav } from "./SiteHeaderNav";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

/**
 * Regression: the login dialog used to be owned by the login button, which
 * also renders inside the drawer. Closing the drawer unmounted its children
 * and took the dialog with it, so it flashed and vanished. The dialog now
 * lives outside the drawer, and this pins it there.
 */
describe("SiteHeaderNav", () => {
  it("keeps the login dialog open after the drawer that triggered it closes", async () => {
    const user = userEvent.setup();
    render(<SiteHeaderNav />, { wrapper });

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));

    const drawer = await screen.findByRole("dialog", { name: "Menu" });
    const loginButton = await within(drawer).findByRole("button", { name: "Login" });
    await user.click(loginButton);

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument(),
    );

    expect(screen.getByRole("dialog", { name: "Log in to Englow3" })).toBeVisible();
  });
});
