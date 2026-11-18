import { CombinedGraphQLErrors } from "@apollo/client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRelationshipActions } from "./useRelationshipActions";

const mutations = vi.hoisted(() => ({
  send: vi.fn(),
  accept: vi.fn(),
  withdraw: vi.fn(),
  unfriend: vi.fn(),
  block: vi.fn(),
  unblock: vi.fn(),
}));
const client = vi.hoisted(() => ({ refetchQueries: vi.fn(), query: vi.fn() }));
const toast = vi.hoisted(() => ({ show: vi.fn() }));

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useSendFriendRequestMutation: () => [mutations.send],
  useAcceptFriendRequestMutation: () => [mutations.accept],
  useWithdrawFriendRequestMutation: () => [mutations.withdraw],
  useUnfriendMutation: () => [mutations.unfriend],
  useBlockUserMutation: () => [mutations.block],
  useUnblockUserMutation: () => [mutations.unblock],
}));
vi.mock("@apollo/client/react", () => ({ useApolloClient: () => client }));
vi.mock("@mantine/notifications", () => ({
  notifications: { show: toast.show },
}));

const PERSON = { userId: "u2", displayName: "An" };

function refusal(backendCode: string) {
  return new CombinedGraphQLErrors({
    errors: [
      { message: "refused", extensions: { code: "FORBIDDEN", backendCode } },
    ],
  });
}

async function perform(
  result: { current: ReturnType<typeof useRelationshipActions> },
  ...args: Parameters<ReturnType<typeof useRelationshipActions>["perform"]>
) {
  await act(async () => {
    result.current.perform(...args);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mutations.send.mockResolvedValue({
    data: { sendFriendRequest: { status: "PENDING" } },
  });
  for (const mutate of [
    mutations.accept,
    mutations.withdraw,
    mutations.unfriend,
    mutations.block,
    mutations.unblock,
  ]) {
    mutate.mockResolvedValue({ data: {} });
  }
  client.refetchQueries.mockResolvedValue([]);
});

describe("the mutation each action calls", () => {
  it("sends a friend request to the person, tells them, and refreshes", async () => {
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);

    await waitFor(() => expect(toast.show).toHaveBeenCalledTimes(1));
    expect(mutations.send).toHaveBeenCalledExactlyOnceWith({
      variables: { addresseeId: "u2" },
    });
    expect(toast.show).toHaveBeenCalledWith({
      color: "teal",
      message: "Đã gửi lời mời kết bạn.",
    });
    expect(client.refetchQueries).toHaveBeenCalledOnce();
  });

  /** The other learner had asked first: the backend answers their request instead of making one. */
  it("says the two are friends when sending answered a request already waiting", async () => {
    mutations.send.mockResolvedValue({
      data: { sendFriendRequest: { status: "ACCEPTED" } },
    });
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);

    await waitFor(() =>
      expect(toast.show).toHaveBeenCalledWith({
        color: "teal",
        message: "Hai bạn đã trở thành bạn bè.",
      }),
    );
  });

  it("accepts, declines and cancels by the request id", async () => {
    const { result } = renderHook(() => useRelationshipActions());
    const target = { ...PERSON, requestId: "r1" };

    await perform(result, "accept", target);
    await waitFor(() => expect(mutations.accept).toHaveBeenCalledOnce());
    await perform(result, "decline", target);
    await waitFor(() => expect(mutations.withdraw).toHaveBeenCalledTimes(1));
    await perform(result, "cancel", target);
    await waitFor(() => expect(mutations.withdraw).toHaveBeenCalledTimes(2));

    expect(mutations.accept).toHaveBeenCalledWith({
      variables: { requestId: "r1" },
    });
    expect(mutations.withdraw).toHaveBeenNthCalledWith(1, {
      variables: { requestId: "r1" },
    });
    expect(mutations.withdraw).toHaveBeenNthCalledWith(2, {
      variables: { requestId: "r1" },
    });
    expect(client.query).not.toHaveBeenCalled();
  });

  it("unblocks at once, with nothing to confirm", async () => {
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "unblock", PERSON);

    await waitFor(() =>
      expect(mutations.unblock).toHaveBeenCalledExactlyOnceWith({
        variables: { userId: "u2" },
      }),
    );
    expect(result.current.confirmation.confirming).toBeNull();
  });
});

/**
 * The backend names a request to its receiver only. To cancel one the viewer
 * sent from a wall or a search result, the hook finds it among the sent ones.
 */
describe("cancelling a request the screen has no id for", () => {
  const sentPage = (
    items: { requestId: string; userId: string }[],
    totalPages: number,
  ) => ({ data: { outgoingFriendRequests: { items, totalPages } } });

  it("looks through every page of sent requests for the person, then withdraws that one", async () => {
    client.query
      .mockResolvedValueOnce(
        sentPage([{ requestId: "r-other", userId: "u9" }], 2),
      )
      .mockResolvedValueOnce(
        sentPage([{ requestId: "r-found", userId: "u2" }], 2),
      );
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "cancel", PERSON);

    await waitFor(() => expect(mutations.withdraw).toHaveBeenCalledOnce());
    expect(client.query).toHaveBeenCalledTimes(2);
    expect(
      client.query.mock.calls.map(([options]) => options.variables.page),
    ).toEqual([0, 1]);
    expect(mutations.withdraw).toHaveBeenCalledWith({
      variables: { requestId: "r-found" },
    });
  });

  it("withdraws nothing and says the request is gone when the person is not among them", async () => {
    client.query.mockResolvedValue(sentPage([], 1));
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "cancel", PERSON);

    await waitFor(() =>
      expect(toast.show).toHaveBeenCalledWith({
        color: "warn",
        title: "Không thực hiện được",
        message: "Lời mời này không còn nữa.",
      }),
    );
    expect(mutations.withdraw).not.toHaveBeenCalled();
    // The screen was out of date, so it is refreshed.
    expect(client.refetchQueries).toHaveBeenCalledOnce();
  });
});

describe("confirming what takes something away", () => {
  it.each([
    ["unfriend", "unfriend"],
    ["block", "block"],
  ] as const)(
    "asks before %s and calls nothing until confirmed",
    async (kind, mutation) => {
      const { result } = renderHook(() => useRelationshipActions());

      await perform(result, kind, PERSON);

      expect(result.current.confirmation.confirming).toEqual({
        kind,
        target: PERSON,
      });
      expect(mutations[mutation]).not.toHaveBeenCalled();

      await act(async () => {
        await result.current.confirmation.onConfirm();
      });

      expect(mutations[mutation]).toHaveBeenCalledExactlyOnceWith({
        variables: { userId: "u2" },
      });
      expect(result.current.confirmation.confirming).toBeNull();
    },
  );

  it("calls nothing when the person backs out", async () => {
    const { result } = renderHook(() => useRelationshipActions());
    await perform(result, "block", PERSON);

    act(() => result.current.confirmation.onCancel());

    expect(result.current.confirmation.confirming).toBeNull();
    expect(mutations.block).not.toHaveBeenCalled();
    expect(client.refetchQueries).not.toHaveBeenCalled();
  });
});

describe("a refusal", () => {
  it("shows the sentence for the backend's code and refreshes a screen that was out of date", async () => {
    mutations.send.mockRejectedValue(refusal("FRIEND_REQUEST_NOT_ALLOWED"));
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);

    await waitFor(() =>
      expect(toast.show).toHaveBeenCalledWith({
        color: "warn",
        title: "Không thực hiện được",
        message: "Không thể gửi lời mời cho người này.",
      }),
    );
    expect(client.refetchQueries).toHaveBeenCalledOnce();
  });

  it("says ALREADY_FRIENDS in words", async () => {
    mutations.send.mockRejectedValue(refusal("ALREADY_FRIENDS"));
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);

    await waitFor(() =>
      expect(toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Hai bạn đã là bạn bè." }),
      ),
    );
  });

  it("falls back to a general sentence for a code nobody wrote one for", async () => {
    mutations.send.mockRejectedValue(refusal("SOMETHING_NEW"));
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);

    await waitFor(() =>
      expect(toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Có lỗi xảy ra. Vui lòng thử lại.",
        }),
      ),
    );
  });

  /** Nothing reached the backend, so nothing changed and there is nothing to refresh. */
  it("uses the general sentence, and does not refresh, when the server was unreachable", async () => {
    mutations.send.mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);

    await waitFor(() =>
      expect(toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Có lỗi xảy ra. Vui lòng thử lại.",
        }),
      ),
    );
    expect(client.refetchQueries).not.toHaveBeenCalled();
  });

  it("closes the confirmation after a refusal, with its sentence shown", async () => {
    mutations.block.mockRejectedValue(refusal("BLOCK_SELF"));
    const { result } = renderHook(() => useRelationshipActions());
    await perform(result, "block", PERSON);

    await act(async () => {
      await result.current.confirmation.onConfirm();
    });

    expect(toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Bạn không thể tự chặn mình." }),
    );
    expect(result.current.confirmation.confirming).toBeNull();
  });
});

describe("while an action runs", () => {
  it("marks it as pending for that person and ignores another until it is done", async () => {
    let finish: (value: unknown) => void = () => {};
    mutations.send.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);
    expect(result.current.pending).toEqual({ kind: "send", userId: "u2" });
    expect(result.current.confirmation.loading).toBe(true);

    await perform(result, "unblock", { userId: "u3", displayName: "Bình" });
    expect(mutations.unblock).not.toHaveBeenCalled();

    await act(async () => {
      finish({ data: { sendFriendRequest: { status: "PENDING" } } });
    });
    await waitFor(() => expect(result.current.pending).toBeNull());
    expect(mutations.send).toHaveBeenCalledOnce();
  });
});

describe("what is refreshed afterwards", () => {
  it("refreshes only the queries on screen that show a friendship", async () => {
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);
    await waitFor(() => expect(client.refetchQueries).toHaveBeenCalledOnce());

    const [options] = client.refetchQueries.mock.calls[0] as [
      {
        include: unknown;
        onQueryUpdated: (query: { queryName?: string }) => boolean;
      },
    ];
    expect(options.include).toBe("active");
    for (const name of [
      "Relationship",
      "UserWall",
      "Friends",
      "IncomingFriendRequests",
      "OutgoingFriendRequests",
      "IncomingFriendRequestCount",
      "BlockedUsers",
      "SearchLearners",
    ]) {
      expect(options.onQueryUpdated({ queryName: name })).toBe(true);
    }
    expect(options.onQueryUpdated({ queryName: "CurrentUser" })).toBe(false);
    expect(options.onQueryUpdated({})).toBe(false);
  });

  it("does not turn a successful action into an error when the refresh fails", async () => {
    client.refetchQueries.mockRejectedValue(new Error("refresh failed"));
    const { result } = renderHook(() => useRelationshipActions());

    await perform(result, "send", PERSON);

    await waitFor(() => expect(result.current.pending).toBeNull());
    expect(toast.show).toHaveBeenCalledOnce();
    expect(toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "teal" }),
    );
  });
});
