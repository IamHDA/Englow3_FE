"use client";

import { useApolloClient } from "@apollo/client/react";
import { notifications } from "@mantine/notifications";
import { useCallback, useRef, useState } from "react";

import {
  FriendRequestStatus,
  OutgoingFriendRequestsDocument,
} from "@/lib/graphql/generated";
import {
  useAcceptFriendRequestMutation,
  useBlockUserMutation,
  useSendFriendRequestMutation,
  useUnblockUserMutation,
  useUnfriendMutation,
  useWithdrawFriendRequestMutation,
} from "@/lib/graphql/generated/hooks";
import type { FriendsTranslations } from "@/shared/constants/translations";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import {
  AFFECTED_QUERY_NAMES,
  BACKEND_CODES,
  FRIENDS_MAX_PAGE_SIZE,
  MIN_SEARCH_TERM_LENGTH,
} from "../constants/friends";
import type {
  ConfirmableActionKind,
  PendingRelationshipAction,
  RelationshipActionHandler,
  RelationshipActionKind,
  RelationshipConfirmation,
  RelationshipTarget,
} from "../types";

/** A refusal the screen itself detected, carrying the backend code a real refusal would have had. */
class ActionRefused extends Error {
  constructor(readonly backendCode: string) {
    super(backendCode);
    this.name = "ActionRefused";
  }
}

function isConfirmable(
  kind: RelationshipActionKind,
): kind is ConfirmableActionKind {
  switch (kind) {
    case "unfriend":
    case "block":
      return true;
    case "send":
    case "accept":
    case "decline":
    case "cancel":
    case "unblock":
      return false;
    default: {
      const unreachable: never = kind;
      return unreachable;
    }
  }
}

/** Which sentence of `success` tells the person it worked. */
type SuccessKey = keyof FriendsTranslations["success"];

function messageFor(error: unknown, copy: FriendsTranslations): string {
  const code =
    error instanceof ActionRefused ? error.backendCode : backendCodeOf(error);
  const sentence =
    code && Object.hasOwn(copy.backendErrors, code)
      ? copy.backendErrors[code as keyof FriendsTranslations["backendErrors"]]
      : copy.genericError;
  return sentence.replace("{min}", String(MIN_SEARCH_TERM_LENGTH));
}

/**
 * Everything a button on a person's row or wall can do: the six friendship
 * mutations, the "are you sure" step for the two that take something away, the
 * toast for what happened and a refresh of the screens that show who stands
 * where. One action at a time - a second tap while one is in flight is ignored.
 *
 * What is allowed is the backend's to say: a refusal arrives as a code and is
 * shown as a sentence, never decided here.
 */
export function useRelationshipActions() {
  const { t } = useLanguage();
  const copy = t.friends;
  const client = useApolloClient();
  const [sendRequest] = useSendFriendRequestMutation();
  const [acceptRequest] = useAcceptFriendRequestMutation();
  const [withdrawRequest] = useWithdrawFriendRequestMutation();
  const [unfriend] = useUnfriendMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();

  const [pending, setPending] = useState<PendingRelationshipAction | null>(
    null,
  );
  const [confirming, setConfirming] = useState<RelationshipConfirmation | null>(
    null,
  );
  const inFlight = useRef(false);

  /** Refresh only what is on screen and shows a friendship; everything else keeps its data. */
  const refreshAffected = useCallback(async () => {
    try {
      await client.refetchQueries({
        include: "active",
        onQueryUpdated: (query) =>
          AFFECTED_QUERY_NAMES.has(query.queryName ?? ""),
      });
    } catch {
      // The action itself went through; a list that fails to refresh shows its
      // own error and retry the next time it is asked.
    }
  }, [client]);

  /**
   * The backend reveals the id of a request only to the person who received
   * it. To cancel one the viewer sent from somewhere that does not list it (a
   * wall, a search result), find it among the sent requests.
   */
  const findSentRequestId = useCallback(
    async (userId: string): Promise<string | null> => {
      for (let page = 0; ; page += 1) {
        const { data } = await client.query({
          query: OutgoingFriendRequestsDocument,
          variables: { page, size: FRIENDS_MAX_PAGE_SIZE },
          fetchPolicy: "network-only",
        });
        const sent = data?.outgoingFriendRequests;
        const found = sent?.items.find((item) => item.userId === userId);
        if (found) return found.requestId;
        if (!sent || page + 1 >= sent.totalPages) return null;
      }
    },
    [client],
  );

  /** Runs one action and returns which sentence of `success` tells the person it worked. */
  const run = useCallback(
    async (
      kind: RelationshipActionKind,
      target: RelationshipTarget,
    ): Promise<SuccessKey> => {
      const requestId = () => {
        if (!target.requestId) {
          throw new ActionRefused(BACKEND_CODES.friendRequestNotFound);
        }
        return target.requestId;
      };
      switch (kind) {
        case "send": {
          const { data } = await sendRequest({
            variables: { addresseeId: target.userId },
          });
          return data?.sendFriendRequest.status === FriendRequestStatus.ACCEPTED
            ? "nowFriends"
            : "send";
        }
        case "accept":
          await acceptRequest({ variables: { requestId: requestId() } });
          break;
        case "decline":
          await withdrawRequest({ variables: { requestId: requestId() } });
          break;
        case "cancel": {
          const id =
            target.requestId ?? (await findSentRequestId(target.userId));
          if (!id) throw new ActionRefused(BACKEND_CODES.friendRequestNotFound);
          await withdrawRequest({ variables: { requestId: id } });
          break;
        }
        case "unfriend":
          await unfriend({ variables: { userId: target.userId } });
          break;
        case "block":
          await blockUser({ variables: { userId: target.userId } });
          break;
        case "unblock":
          await unblockUser({ variables: { userId: target.userId } });
          break;
        default: {
          const unreachable: never = kind;
          return unreachable;
        }
      }
      return kind;
    },
    [
      sendRequest,
      acceptRequest,
      withdrawRequest,
      unfriend,
      blockUser,
      unblockUser,
      findSentRequestId,
    ],
  );

  const execute = useCallback(
    async (kind: RelationshipActionKind, target: RelationshipTarget) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setPending({ kind, userId: target.userId });
      try {
        const done = await run(kind, target);
        notifications.show({ color: "teal", message: copy.success[done] });
        await refreshAffected();
      } catch (error) {
        notifications.show({
          color: "warn",
          title: copy.actionErrorTitle,
          message: messageFor(error, copy),
        });
        // A refusal by the backend usually means the screen was out of date
        // (the request was already answered, the friendship already gone).
        // A failure with no code - the server unreachable - changed nothing.
        if (error instanceof ActionRefused || backendCodeOf(error)) {
          await refreshAffected();
        }
      } finally {
        inFlight.current = false;
        setPending(null);
      }
    },
    [run, refreshAffected, copy],
  );

  const perform: RelationshipActionHandler = useCallback(
    (kind, target) => {
      if (isConfirmable(kind)) {
        setConfirming({ kind, target });
        return;
      }
      void execute(kind, target);
    },
    [execute],
  );

  const confirm = useCallback(async () => {
    if (!confirming) return;
    await execute(confirming.kind, confirming.target);
    setConfirming(null);
  }, [confirming, execute]);

  const cancelConfirmation = useCallback(() => setConfirming(null), []);

  return {
    perform,
    pending,
    confirmation: {
      confirming,
      loading: pending !== null,
      onConfirm: confirm,
      onCancel: cancelConfirmation,
    },
  };
}
