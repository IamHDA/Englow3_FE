import { describe, expect, it, vi } from "vitest";

import { userResolvers } from "../user/user.resolvers.js";
import { BackendError } from "../../shared/http/backendError.js";
import { makeContext } from "../../test/makeContext.js";
import { friendshipResolvers } from "./friendship.resolvers.js";
import { toRelationship } from "./friendship.mapper.js";
import type { RelationshipResponse } from "./friendship.types.js";

/** The shape the REST endpoint really answers with: the field is `relationship`, not `status`. */
const restRelationship = (
  relationship: RelationshipResponse["relationship"],
  requestId: string | null = null,
): RelationshipResponse => ({ userId: "u2", relationship, requestId });

describe("toRelationship", () => {
  it("reads the REST `relationship` field into the GraphQL `status`", () => {
    expect(toRelationship(restRelationship("FRIENDS"))).toEqual({
      userId: "u2",
      status: "FRIENDS",
      requestId: null,
    });
  });

  it("keeps a request id and turns a missing one into null", () => {
    expect(
      toRelationship(restRelationship("REQUEST_RECEIVED", "req-1")).requestId,
    ).toBe("req-1");
    const withoutRequestId = {
      userId: "u2",
      relationship: "NONE",
    } as RelationshipResponse;
    expect(toRelationship(withoutRequestId).requestId).toBeNull();
  });
});

describe("Query.relationship", () => {
  it("fails before calling the backend when there is no token", async () => {
    const relationship = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { friendshipApi: { relationship } },
    });
    await expect(
      friendshipResolvers.Query.relationship({}, { userId: "u2" }, ctx),
    ).rejects.toThrow("Missing or invalid access token");
    expect(relationship).not.toHaveBeenCalled();
  });

  it("answers with `status`, mapped from the REST body", async () => {
    const relationship = vi
      .fn()
      .mockResolvedValue(restRelationship("REQUEST_RECEIVED", "req-1"));
    const ctx = makeContext({ apis: { friendshipApi: { relationship } } });

    expect(
      await friendshipResolvers.Query.relationship({}, { userId: "u2" }, ctx),
    ).toEqual({ userId: "u2", status: "REQUEST_RECEIVED", requestId: "req-1" });
    expect(relationship).toHaveBeenCalledWith("u2");
  });
});

/** The wall as the two modules resolve it: userWall decides, then each field runs. */
async function resolveWall(relationship: RelationshipResponse) {
  const relationshipCall = vi.fn().mockResolvedValue(relationship);
  const friendCount = vi.fn().mockResolvedValue({ count: 7 });
  const publicProfile = vi.fn().mockResolvedValue({ userId: "u2" });
  const ctx = makeContext({
    apis: {
      friendshipApi: { relationship: relationshipCall, friendCount },
      userApi: { publicProfile },
    },
  });
  const wall = await friendshipResolvers.Query.userWall(
    {},
    { userId: "u2" },
    ctx,
  );
  const [friendCountResult, profileResult] = await Promise.all([
    friendshipResolvers.UserWall.friendCount(wall, {}, ctx),
    userResolvers.UserWall.profile(wall, {}, ctx),
  ]);
  return {
    wall,
    friendCountResult,
    profileResult,
    relationshipCall,
    friendCount,
    publicProfile,
  };
}

describe("Query.userWall", () => {
  it("fails before calling the backend when there is no token", async () => {
    const relationship = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { friendshipApi: { relationship } },
    });
    await expect(
      friendshipResolvers.Query.userWall({}, { userId: "u2" }, ctx),
    ).rejects.toThrow("Missing or invalid access token");
    expect(relationship).not.toHaveBeenCalled();
  });

  /**
   * The REST body says `{ relationship: "UNAVAILABLE" }`. This is the case that
   * went wrong when the block rule read `.status` off the raw body: it never
   * matched, and a blocked wall rendered a name and a friend count.
   */
  it("is unavailable, and fetches nothing else, when the other side blocked the viewer", async () => {
    const result = await resolveWall(restRelationship("UNAVAILABLE"));

    expect(result.wall).toMatchObject({ userId: "u2", available: false });
    expect(result.friendCountResult).toBeNull();
    expect(result.profileResult).toBeNull();
    expect(result.friendCount).not.toHaveBeenCalled();
    expect(result.publicProfile).not.toHaveBeenCalled();
  });

  it("is unavailable, and fetches nothing else, when the viewer blocked the other side", async () => {
    const result = await resolveWall(restRelationship("BLOCKED_BY_ME"));

    expect(result.wall).toMatchObject({ available: false });
    expect(result.wall.relationship.status).toBe("BLOCKED_BY_ME");
    expect(result.friendCountResult).toBeNull();
    expect(result.profileResult).toBeNull();
    expect(result.friendCount).not.toHaveBeenCalled();
    expect(result.publicProfile).not.toHaveBeenCalled();
  });

  it("skips the friend count for NOT_APPLICABLE but still loads the profile", async () => {
    const result = await resolveWall(restRelationship("NOT_APPLICABLE"));

    expect(result.wall).toMatchObject({ available: true });
    expect(result.friendCountResult).toBeNull();
    expect(result.friendCount).not.toHaveBeenCalled();
    expect(result.publicProfile).toHaveBeenCalledExactlyOnceWith("u2");
    expect(result.profileResult).toEqual({ userId: "u2" });
  });

  it("asks for the relationship once, then the friend count and the profile once each", async () => {
    const result = await resolveWall(restRelationship("FRIENDS"));

    expect(result.wall).toMatchObject({ available: true });
    expect(result.wall.relationship.status).toBe("FRIENDS");
    expect(result.relationshipCall).toHaveBeenCalledExactlyOnceWith("u2");
    expect(result.friendCount).toHaveBeenCalledExactlyOnceWith("u2");
    expect(result.publicProfile).toHaveBeenCalledExactlyOnceWith("u2");
    expect(result.friendCountResult).toBe(7);
  });

  it.each(["NONE", "REQUEST_SENT", "REQUEST_RECEIVED", "SELF"] as const)(
    "is available for %s",
    async (status) => {
      const { wall } = await resolveWall(restRelationship(status));
      expect(wall).toMatchObject({ available: true });
    },
  );

  it("lets a failing friend count reject on its own field", async () => {
    const failure = new BackendError("boom", 500);
    const friendCount = vi.fn().mockRejectedValue(failure);
    const ctx = makeContext({ apis: { friendshipApi: { friendCount } } });
    const wall = {
      userId: "u2",
      available: true,
      relationship: toRelationship(restRelationship("NONE")),
    };

    await expect(
      friendshipResolvers.UserWall.friendCount(wall, {}, ctx),
    ).rejects.toBe(failure);
  });
});

describe("mutations", () => {
  it("fail before calling the backend when there is no token", () => {
    const send = vi.fn();
    const ctx = makeContext({ token: null, apis: { friendshipApi: { send } } });
    expect(() =>
      friendshipResolvers.Mutation.sendFriendRequest(
        {},
        { addresseeId: "u2" },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns the outcome of sending and accepting a request", async () => {
    const outcome = {
      requestId: "r1",
      userId: "u2",
      status: "PENDING" as const,
      requestedAt: "2026-11-16T00:00:00Z",
      acceptedAt: null,
    };
    const send = vi.fn().mockResolvedValue(outcome);
    const accept = vi
      .fn()
      .mockResolvedValue({ ...outcome, status: "ACCEPTED" });
    const ctx = makeContext({ apis: { friendshipApi: { send, accept } } });

    expect(
      await friendshipResolvers.Mutation.sendFriendRequest(
        {},
        { addresseeId: "u2" },
        ctx,
      ),
    ).toBe(outcome);
    expect(
      await friendshipResolvers.Mutation.acceptFriendRequest(
        {},
        { requestId: "r1" },
        ctx,
      ),
    ).toMatchObject({ status: "ACCEPTED" });
    expect(send).toHaveBeenCalledWith("u2");
    expect(accept).toHaveBeenCalledWith("r1");
  });

  it("answers true once the backend has answered 204", async () => {
    const withdraw = vi.fn().mockResolvedValue(undefined);
    const unfriend = vi.fn().mockResolvedValue(undefined);
    const block = vi.fn().mockResolvedValue(undefined);
    const unblock = vi.fn().mockResolvedValue(undefined);
    const ctx = makeContext({
      apis: { friendshipApi: { withdraw, unfriend, block, unblock } },
    });

    expect(
      await friendshipResolvers.Mutation.withdrawFriendRequest(
        {},
        { requestId: "r1" },
        ctx,
      ),
    ).toBe(true);
    expect(
      await friendshipResolvers.Mutation.unfriend({}, { userId: "u2" }, ctx),
    ).toBe(true);
    expect(
      await friendshipResolvers.Mutation.blockUser({}, { userId: "u2" }, ctx),
    ).toBe(true);
    expect(
      await friendshipResolvers.Mutation.unblockUser({}, { userId: "u2" }, ctx),
    ).toBe(true);
    expect(withdraw).toHaveBeenCalledWith("r1");
    expect(unfriend).toHaveBeenCalledWith("u2");
    expect(block).toHaveBeenCalledWith("u2");
    expect(unblock).toHaveBeenCalledWith("u2");
  });

  it("does not answer true when the backend refuses", async () => {
    const refusal = new BackendError(
      "This learner cannot be invited",
      403,
      "FRIEND_REQUEST_NOT_ALLOWED",
    );
    const send = vi.fn().mockRejectedValue(refusal);
    const block = vi.fn().mockRejectedValue(refusal);
    const ctx = makeContext({ apis: { friendshipApi: { send, block } } });

    await expect(
      friendshipResolvers.Mutation.sendFriendRequest(
        {},
        { addresseeId: "u2" },
        ctx,
      ),
    ).rejects.toBe(refusal);
    await expect(
      friendshipResolvers.Mutation.blockUser({}, { userId: "u2" }, ctx),
    ).rejects.toBe(refusal);
  });
});

describe("lists", () => {
  it("default the page and cap the size at the backend's own cap", async () => {
    const friends = vi.fn().mockResolvedValue({ items: [] });
    const incoming = vi.fn().mockResolvedValue({ items: [] });
    const outgoing = vi.fn().mockResolvedValue({ items: [] });
    const blocked = vi.fn().mockResolvedValue({ items: [] });
    const search = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({
      apis: {
        friendshipApi: { friends, incoming, outgoing, blocked, search },
      },
    });

    await friendshipResolvers.Query.friends({}, { size: 5000 }, ctx);
    await friendshipResolvers.Query.incomingFriendRequests({}, {}, ctx);
    await friendshipResolvers.Query.outgoingFriendRequests(
      {},
      { page: 3, size: 10 },
      ctx,
    );
    await friendshipResolvers.Query.blockedUsers({}, { size: 51 }, ctx);
    await friendshipResolvers.Query.searchLearners(
      {},
      { q: "an", page: 1 },
      ctx,
    );

    expect(friends).toHaveBeenCalledWith({ page: 0, size: 50 });
    expect(incoming).toHaveBeenCalledWith({ page: 0, size: 20 });
    expect(outgoing).toHaveBeenCalledWith({ page: 3, size: 10 });
    expect(blocked).toHaveBeenCalledWith({ page: 0, size: 50 });
    expect(search).toHaveBeenCalledWith({ q: "an", page: 1, size: 20 });
  });

  it("answers the pending count as a number", async () => {
    const incomingCount = vi.fn().mockResolvedValue({ count: 4 });
    const ctx = makeContext({ apis: { friendshipApi: { incomingCount } } });
    expect(
      await friendshipResolvers.Query.incomingFriendRequestCount({}, {}, ctx),
    ).toBe(4);
  });

  it("requires a token on every list", async () => {
    const ctx = makeContext({ token: null });
    expect(() => friendshipResolvers.Query.friends({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(() =>
      friendshipResolvers.Query.searchLearners({}, { q: "an" }, ctx),
    ).toThrow("Missing or invalid access token");
    await expect(
      friendshipResolvers.Query.incomingFriendRequestCount({}, {}, ctx),
    ).rejects.toThrow("Missing or invalid access token");
  });
});
