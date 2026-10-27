import { act, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, useContext } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AccountProfileResult } from "./types";
import { AccountContext, AccountProvider } from "./provider";

const mocks = vi.hoisted(() => ({
  userId: "auth-user",
  load: vi.fn(),
  notify: vi.fn(),
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    session: mocks.userId ? { userId: mocks.userId } : null,
  }),
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useCurrentUserLazyQuery: () => [mocks.load, { loading: false }],
}));
vi.mock("@mantine/notifications", () => ({
  notifications: { show: mocks.notify },
}));

const empty: AccountProfileResult = { profile: null, hasError: false };

function Consumer() {
  const account = useContext(AccountContext)!;
  return (
    <>
      <span>{account.hasError ? "failed" : "ok"}</span>
      <span>{account.profile?.id ?? "no profile"}</span>
      <button onClick={() => void account.refresh()}>Retry</button>
    </>
  );
}

function tree(initialProfile = empty) {
  return (
    <AccountProvider initialProfile={initialProfile}>
      <Consumer />
    </AccountProvider>
  );
}

beforeEach(() => {
  mocks.userId = "auth-user";
  mocks.load.mockReset();
  mocks.notify.mockReset();
});

describe("AccountProvider", () => {
  it("hides the old learner profile immediately while the next account is loading", async () => {
    const profile = { id: "previous-application-id" } as NonNullable<
      AccountProfileResult["profile"]
    >;
    const view = render(tree({ profile, hasError: false }));
    expect(screen.getByText("previous-application-id")).toBeInTheDocument();
    let resolveNext!: (value: unknown) => void;
    mocks.load.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNext = resolve;
      }),
    );
    mocks.userId = "next-auth-id";
    view.rerender(tree());
    expect(
      screen.queryByText("previous-application-id"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("no profile")).toBeInTheDocument();
    await waitFor(() => expect(mocks.load).toHaveBeenCalledOnce());
    await act(async () =>
      resolveNext({ data: { me: { id: "next-application-id" } } }),
    );
    expect(screen.getByText("next-application-id")).toBeInTheDocument();
  });
  it("recovers the failed profile when backend readiness returns", async () => {
    const services = await import("@/shared/network/serviceAvailability");
    mocks.load.mockRejectedValueOnce(new Error("Backend unavailable"));
    render(tree());
    await screen.findByText("failed");
    mocks.load.mockResolvedValueOnce({
      data: { me: { id: "recovered-profile" } },
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ backend: "unavailable", ai: "unconfigured" }),
        )
        .mockResolvedValueOnce(
          Response.json({ backend: "ready", ai: "unconfigured" }),
        ),
    );
    const stop = services.mountServiceChecks();
    await waitFor(() =>
      expect(services.serviceSnapshot().backend).toBe("unavailable"),
    );
    act(() => services.retryServices());
    await screen.findByText("recovered-profile");
    stop();
    vi.unstubAllGlobals();
  });
  it("loads the profile in Strict Mode", async () => {
    mocks.load.mockResolvedValueOnce({ data: { me: { id: "profile-id" } } });
    render(<StrictMode>{tree()}</StrictMode>);
    await screen.findByText("profile-id");
    expect(mocks.load).toHaveBeenCalledOnce();
  });
  it("handles a rejected initial request and recovers on retry", async () => {
    mocks.load.mockRejectedValueOnce(new Error("Backend unavailable"));
    render(tree());
    await screen.findByText("failed");
    expect(mocks.notify).toHaveBeenCalledTimes(1);

    mocks.load.mockResolvedValueOnce({ data: { me: { id: "profile-id" } } });
    await act(async () => screen.getByText("Retry").click());
    // Waited for rather than read at once: the retry settles a few microtasks
    // after the click, and under a loaded parallel run act() can return first.
    expect(await screen.findByText("profile-id")).toBeInTheDocument();
    expect(await screen.findByText("ok")).toBeInTheDocument();
  });

  it("handles rejection from an explicit refresh", async () => {
    mocks.load.mockResolvedValueOnce({ data: { me: { id: "profile-id" } } });
    render(tree());
    await screen.findByText("profile-id");
    mocks.load.mockRejectedValueOnce(new Error("Connection refused"));
    await act(async () => screen.getByText("Retry").click());
    expect(await screen.findByText("failed")).toBeInTheDocument();
  });

  it("does not refetch a server profile whose database ID differs from auth ID", () => {
    const profile = { id: "database-id" } as NonNullable<
      AccountProfileResult["profile"]
    >;
    render(tree({ profile, hasError: false }));
    expect(mocks.load).not.toHaveBeenCalled();
  });

  it("ignores the previous account request after switching accounts", async () => {
    let resolveOld!: (value: unknown) => void;
    mocks.load.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    const view = render(tree());
    await waitFor(() => expect(mocks.load).toHaveBeenCalledOnce());
    mocks.userId = "other-auth-user";
    mocks.load.mockResolvedValueOnce({ data: { me: { id: "new-profile" } } });
    view.rerender(tree());
    await screen.findByText("new-profile");
    await act(async () => resolveOld({ data: { me: { id: "old-profile" } } }));
    expect(screen.queryByText("old-profile")).not.toBeInTheDocument();
    expect(screen.getByText("new-profile")).toBeInTheDocument();
  });

  it("ignores a pending request after signing out", async () => {
    let rejectOld!: (reason: unknown) => void;
    mocks.load.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectOld = reject;
      }),
    );
    const view = render(tree());
    await waitFor(() => expect(mocks.load).toHaveBeenCalledOnce());
    mocks.userId = "";
    view.rerender(tree());
    await act(async () => rejectOld(new Error("Backend unavailable")));
    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it("invalidates a refresh after signing out with a server-provided profile", async () => {
    let resolveOld!: (value: unknown) => void;
    const profile = { id: "database-id" } as NonNullable<
      AccountProfileResult["profile"]
    >;
    const view = render(tree({ profile, hasError: false }));
    mocks.load.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    await act(async () => screen.getByText("Retry").click());
    mocks.userId = "";
    view.rerender(tree());
    await act(async () =>
      resolveOld({ data: { me: { id: "stale-profile" } } }),
    );
    mocks.userId = "auth-user";
    mocks.load.mockResolvedValueOnce({ data: { me: { id: "fresh-profile" } } });
    view.rerender(tree());
    expect(screen.queryByText("stale-profile")).not.toBeInTheDocument();
    await screen.findByText("fresh-profile");
  });
});
