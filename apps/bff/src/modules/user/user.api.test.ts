import { describe, expect, it, vi } from "vitest";
import { BackendClient } from "../../shared/http/backendClient.js";
import { BackendError } from "../../shared/http/backendError.js";
import { UserApi } from "./user.api.js";

describe("account bootstrap", () => {
  it("returns account and onboarding from a single backend call", async () => {
    const client = new BackendClient("http://backend.test", 1000);
    const get = vi.spyOn(client, "get").mockResolvedValue({
      user: { id: "own-account" },
      onboardingState: { step: "COMPLETED" },
    });
    expect(await new UserApi(client).getMe()).toEqual({
      id: "own-account",
      onboardingState: { step: "COMPLETED" },
    });
    expect(get).toHaveBeenCalledExactlyOnceWith("/api/user/me/bootstrap");
  });
  it("preserves an explicit null onboarding state for a back-office account", async () => {
    const client = new BackendClient("http://backend.test", 1000);
    vi.spyOn(client, "get").mockResolvedValue({
      user: { id: "staff" },
      onboardingState: null,
    });
    expect((await new UserApi(client).getMe()).onboardingState).toBeNull();
  });
  it("falls back only when an older backend lacks the endpoint", async () => {
    const client = new BackendClient("http://backend.test", 1000);
    const get = vi
      .spyOn(client, "get")
      .mockRejectedValueOnce(new BackendError("Missing route", 404))
      .mockResolvedValueOnce({ id: "legacy" });
    expect(await new UserApi(client).getMe()).toEqual({ id: "legacy" });
    expect(get.mock.calls.map(([path]) => path)).toEqual([
      "/api/user/me/bootstrap",
      "/api/user/me",
    ]);
  });
  it.each([401, 403, 429, 500, 503, 0])(
    "does not amplify HTTP %s with a second account request",
    async (status) => {
      const client = new BackendClient("http://backend.test", 1000);
      const error = new BackendError("Refused", status);
      const get = vi.spyOn(client, "get").mockRejectedValue(error);
      await expect(new UserApi(client).getMe()).rejects.toBe(error);
      expect(get).toHaveBeenCalledTimes(1);
    },
  );
});
