import { describe, expect, it, vi } from "vitest";

import { userResolvers } from "./user.resolvers.js";
import type { UserInformationResponse } from "./user.types.js";
import { BackendError } from "../../shared/http/backendError.js";
import { makeContext } from "../../test/makeContext.js";

describe("Query.me", () => {
  it("fails before calling the backend when there is no token", () => {
    const getMe = vi.fn();
    const ctx = makeContext({ token: null, apis: { userApi: { getMe } } });

    expect(() => userResolvers.Query.me({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getMe).not.toHaveBeenCalled();
  });

  it("returns the UserApi response directly", async () => {
    const me: UserInformationResponse = {
      id: "u1",
      email: "learner@example.com",
      role: "LEARNER",
      fullName: "Nguyen Van A",
      displayName: "vana",
      gender: null,
      birthDate: null,
      avatarUrl: null,
      bannerUrl: null,
      onboardingStep: "LEARNING_PURPOSES",
    };
    const getMe = vi.fn().mockResolvedValue(me);
    const ctx = makeContext({ apis: { userApi: { getMe } } });

    const result = await userResolvers.Query.me({}, {}, ctx);

    expect(result).toBe(me);
    expect(getMe).toHaveBeenCalledTimes(1);
  });
});

describe("Mutation.updateProfile", () => {
  it("fails before calling the backend when there is no token", () => {
    const ctx = makeContext({ token: null });

    expect(() =>
      userResolvers.Mutation.updateProfile(
        {},
        {
          input: {
            fullName: "Nguyen Van B",
            displayName: "vanb",
          },
        },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
  });

  it("calls UserApi.updateProfile with input and returns result", async () => {
    const updated: UserInformationResponse = {
      id: "u1",
      email: "learner@example.com",
      role: "LEARNER",
      fullName: "Nguyen Van B",
      displayName: "vanb",
      gender: "MALE",
      birthDate: "2000-01-01",
      avatarUrl: null,
      bannerUrl: null,
      onboardingStep: "COMPLETED",
    };
    const updateProfile = vi.fn().mockResolvedValue(updated);
    const ctx = makeContext({ apis: { userApi: { updateProfile } } });

    const input = {
      fullName: "Nguyen Van B",
      displayName: "vanb",
      gender: "MALE" as const,
      birthDate: "2000-01-01",
    };

    const result = await userResolvers.Mutation.updateProfile(
      {},
      { input },
      ctx,
    );

    expect(result).toBe(updated);
    expect(updateProfile).toHaveBeenCalledWith(input);
  });
});

describe("website tour", () => {
  it("requires authentication before reading status or completing the tour", () => {
    const getTourStatus = vi.fn();
    const completeTour = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { userApi: { getTourStatus, completeTour } },
    });

    expect(() => userResolvers.Query.myTourStatus({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(() => userResolvers.Mutation.completeMyTour({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getTourStatus).not.toHaveBeenCalled();
    expect(completeTour).not.toHaveBeenCalled();
  });

  it("forwards the current user's tour requests", async () => {
    const getTourStatus = vi.fn().mockResolvedValue({ completed: false });
    const completeTour = vi.fn().mockResolvedValue({ completed: true });
    const ctx = makeContext({
      apis: { userApi: { getTourStatus, completeTour } },
    });

    expect(await userResolvers.Query.myTourStatus({}, {}, ctx)).toEqual({
      completed: false,
    });
    expect(await userResolvers.Mutation.completeMyTour({}, {}, ctx)).toEqual({
      completed: true,
    });
    expect(getTourStatus).toHaveBeenCalledOnce();
    expect(completeTour).toHaveBeenCalledOnce();
  });
});

describe("Mutation.chooseAvatar", () => {
  it("fails before calling the backend when there is no token", () => {
    const chooseAvatar = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { userApi: { chooseAvatar } },
    });

    expect(() =>
      userResolvers.Mutation.chooseAvatar({}, { preset: "fox" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(chooseAvatar).not.toHaveBeenCalled();
  });

  /** The id goes as given: which ids exist is the backend's list to check. */
  it("forwards the chosen preset id", async () => {
    const chooseAvatar = vi.fn().mockResolvedValue({ id: "u1" });
    const ctx = makeContext({ apis: { userApi: { chooseAvatar } } });

    await userResolvers.Mutation.chooseAvatar({}, { preset: "owl" }, ctx);

    expect(chooseAvatar).toHaveBeenCalledWith("owl");
  });
});

describe("UserWall.profile", () => {
  const wall = (available: boolean) => ({
    userId: "u2",
    available,
    relationship: { userId: "u2", status: "NONE" as const },
  });

  it("loads the public profile of an available wall", async () => {
    const profile = { userId: "u2", displayName: "An", staff: false };
    const publicProfile = vi.fn().mockResolvedValue(profile);
    const ctx = makeContext({ apis: { userApi: { publicProfile } } });

    expect(await userResolvers.UserWall.profile(wall(true), {}, ctx)).toBe(
      profile,
    );
    expect(publicProfile).toHaveBeenCalledExactlyOnceWith("u2");
  });

  it("is null, without calling the backend, when the wall is unavailable", async () => {
    const publicProfile = vi.fn();
    const ctx = makeContext({ apis: { userApi: { publicProfile } } });

    expect(
      await userResolvers.UserWall.profile(wall(false), {}, ctx),
    ).toBeNull();
    expect(publicProfile).not.toHaveBeenCalled();
  });

  /** The web reads backendCode USER_NOT_FOUND off the errors entry, so nothing may swallow it. */
  it("lets the backend's refusal reject", async () => {
    const refusal = new BackendError("No such user", 404, "USER_NOT_FOUND");
    const publicProfile = vi.fn().mockRejectedValue(refusal);
    const ctx = makeContext({ apis: { userApi: { publicProfile } } });

    await expect(
      userResolvers.UserWall.profile(wall(true), {}, ctx),
    ).rejects.toBe(refusal);
  });
});
