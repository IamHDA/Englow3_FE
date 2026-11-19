import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ownershipOf, useBlogViewer } from "./useBlogViewer";

const account = vi.hoisted(() => ({
  value: {} as {
    profile: { id: string } | null;
    hasError: boolean;
    loading: boolean;
    refresh: () => Promise<void>;
  },
}));
vi.mock("@/features/account", () => ({
  useAccountProfile: () => account.value,
}));

const refresh = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  refresh.mockClear();
  account.value = { profile: null, hasError: false, loading: true, refresh };
});

describe("useBlogViewer", () => {
  it("is loading while the profile is on its way, not somebody else", () => {
    const { result } = renderHook(() => useBlogViewer());

    expect(result.current).toEqual({ status: "loading" });
  });

  it("is the backend's id for the viewer once the profile is there", () => {
    account.value = { ...account.value, profile: { id: "u1" }, loading: false };
    const { result } = renderHook(() => useBlogViewer());

    expect(result.current).toEqual({ status: "known", id: "u1" });
  });

  it("goes from loading to known when the profile arrives", () => {
    const { result, rerender } = renderHook(() => useBlogViewer());
    expect(result.current.status).toBe("loading");

    account.value = { ...account.value, profile: { id: "u1" }, loading: false };
    rerender();

    expect(result.current).toEqual({ status: "known", id: "u1" });
  });

  it("is failed when the profile could not be loaded, and retrying asks the account again", () => {
    account.value = { ...account.value, hasError: true, loading: false };
    const { result } = renderHook(() => useBlogViewer());

    expect(result.current.status).toBe("failed");
    if (result.current.status === "failed") result.current.retry();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("is failed too, with the error, while a retry is loading: the profile is still not there to trust", () => {
    account.value = { ...account.value, hasError: true, loading: true };
    const { result } = renderHook(() => useBlogViewer());

    expect(result.current.status).toBe("failed");
  });

  it("is failed for nobody signed in, which these member-only pages never are", () => {
    account.value = { ...account.value, loading: false };
    const { result } = renderHook(() => useBlogViewer());

    expect(result.current.status).toBe("failed");
  });
});

describe("ownershipOf", () => {
  it("is own for the viewer's id, and other for anybody else's", () => {
    const viewer = { status: "known", id: "u1" } as const;

    expect(ownershipOf(viewer, "u1")).toBe("own");
    expect(ownershipOf(viewer, "u2")).toBe("other");
  });

  it("is other for an erased author, whoever is looking: it is nobody's own", () => {
    const viewer = { status: "known", id: "u1" } as const;

    expect(ownershipOf(viewer, null)).toBe("other");
    expect(ownershipOf(viewer, undefined)).toBe("other");
  });

  it("is not known while the profile loads or when it failed, whoever wrote it", () => {
    expect(ownershipOf({ status: "loading" }, "u1")).toBe("loading");
    expect(ownershipOf({ status: "loading" }, null)).toBe("loading");
    expect(ownershipOf({ status: "failed", retry: () => {} }, "u1")).toBe(
      "unavailable",
    );
  });
});
