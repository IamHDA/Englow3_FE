"use client";

import { Stack } from "@mantine/core";

import { isBackOfficeRole, useAuth } from "@/features/auth";
import { useUserWallQuery } from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { hasBackendCode } from "@/shared/network/loadError";

import { BACKEND_CODES, FRIENDS_ROUTES } from "../../../constants/friends";
import { useRelationshipActions } from "../../../hooks/useRelationshipActions";
import { RelationshipConfirmModal } from "../../blocks/RelationshipConfirmModal";
import { WallHeader } from "../../blocks/WallHeader";
import { WallProfileError } from "../../blocks/WallProfileError";
import { WallSkeleton } from "../../blocks/WallSkeleton";
import { WallUnavailable } from "../../blocks/WallUnavailable";
import { RelationshipActions } from "../../parts/RelationshipActions";

/**
 * /people/[userId]: the wall of one account. The BFF makes one call to ask how
 * the viewer stands with it and, unless either side blocked the other, fetches
 * the profile and the friend count next to it. The query keeps the data that
 * did arrive when one of those fails (errorPolicy "all"), so a failing friend
 * count or profile costs that piece, not the page.
 */
export function WallView({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const copy = t.friends.wall;
  const back = { href: FRIENDS_ROUTES.home, label: copy.backLabel };
  const { session } = useAuth();
  const { data, error, loading, refetch } = useUserWallQuery({
    variables: { userId },
    errorPolicy: "all",
    // Who stands where changes without this screen's help.
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const actions = useRelationshipActions();
  const retry = () => void refetch().catch(() => undefined);

  const wall = data?.userWall;
  if (!wall) {
    // Neither the wall nor a verdict yet: loading, or the query itself failed
    // (a malformed id is "not found" too - nothing could ever be there).
    return loading || !error ? (
      <WallSkeleton />
    ) : (
      <LoadErrorState
        error={error}
        thing={copy.thing}
        back={back}
        notFoundDescription={copy.notFoundDescription}
        onRetry={retry}
      />
    );
  }

  const { relationship, profile, friendCount } = wall;
  const target = {
    userId,
    displayName: profile?.displayName ?? copy.fallbackName,
    requestId: relationship.requestId,
  };
  const buttons = (
    <RelationshipActions
      status={relationship.status}
      target={target}
      pending={actions.pending}
      onAction={actions.perform}
      showFriendsLink={!isBackOfficeRole(session?.role)}
    />
  );

  let content;
  if (!wall.available) {
    content = <WallUnavailable actions={buttons} />;
  } else if (profile) {
    content = (
      <WallHeader
        profile={profile}
        // Staff have no friends to count. The backend says so for everyone but
        // staff's own wall, where it answers 0, and a 0 there would read as
        // "no friends" rather than "not applicable".
        friendCount={profile.staff ? null : friendCount}
        actions={buttons}
      />
    );
  } else if (hasBackendCode(error, BACKEND_CODES.userNotFound)) {
    // The id names no account: nothing to show and nothing to do about it.
    return (
      <LoadErrorState
        kind="not-found"
        thing={copy.thing}
        back={back}
        notFoundDescription={copy.notFoundDescription}
      />
    );
  } else {
    content = (
      <WallProfileError
        friendCount={friendCount}
        actions={buttons}
        onRetry={retry}
      />
    );
  }

  return (
    <Stack gap="lg">
      {content}
      <RelationshipConfirmModal {...actions.confirmation} />
    </Stack>
  );
}
