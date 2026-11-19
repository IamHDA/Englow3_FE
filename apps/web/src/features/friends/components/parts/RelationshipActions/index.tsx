"use client";

import { Button, Group, Menu } from "@mantine/core";
import {
  Ban,
  Check,
  ChevronDown,
  Pencil,
  ShieldOff,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";

import { OpenChatButton } from "@/features/chat";
import { RelationshipStatus } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { FRIENDS_ROUTES } from "../../../constants/friends";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
  RelationshipActionKind,
  RelationshipTarget,
} from "../../../types";

import { BlockMenu } from "./BlockMenu";

type RelationshipActionsProps = {
  /** How the viewer stands with this person. */
  status: RelationshipStatus;
  target: RelationshipTarget;
  /** The action in flight anywhere on the screen: its button spins, every other one waits. */
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
  /** On the viewer's own wall: leave out the link to the friends page for an account that has none. */
  showFriendsLink?: boolean;
};

/**
 * The buttons for one person, by how the viewer stands with them. Which of
 * these is allowed is the backend's rule and arrives as the status; this only
 * draws it. Fetches nothing: the view passes the status and takes the clicks.
 */
export function RelationshipActions({
  status,
  target,
  pending,
  onAction,
  showFriendsLink = true,
}: RelationshipActionsProps) {
  const labels = useLanguage().t.friends.actions;
  const locked = pending !== null;
  const loadingKind = pending?.userId === target.userId ? pending.kind : null;
  const button = (kind: RelationshipActionKind) => ({
    size: "sm" as const,
    loading: loadingKind === kind,
    disabled: locked && loadingKind !== kind,
    onClick: () => onAction(kind, target),
  });
  const blockMenu = (
    <BlockMenu
      name={target.displayName}
      disabled={locked}
      onBlock={() => onAction("block", target)}
    />
  );

  switch (status) {
    case RelationshipStatus.SELF:
      return (
        <Group gap="xs">
          <Button
            component={Link}
            href={FRIENDS_ROUTES.profile}
            size="sm"
            variant="default"
            leftSection={<Pencil size={16} aria-hidden="true" />}
          >
            {labels.editProfile}
          </Button>
          {showFriendsLink && (
            <Button
              component={Link}
              href={FRIENDS_ROUTES.friends}
              size="sm"
              variant="default"
              leftSection={<Users size={16} aria-hidden="true" />}
            >
              {labels.friendsPage}
            </Button>
          )}
        </Group>
      );
    case RelationshipStatus.NONE:
      return (
        <Group gap="xs" wrap="nowrap">
          <Button
            {...button("send")}
            leftSection={<UserPlus size={16} aria-hidden="true" />}
          >
            {labels.add}
          </Button>
          {blockMenu}
        </Group>
      );
    case RelationshipStatus.REQUEST_SENT:
      return (
        <Group gap="xs" wrap="nowrap">
          <Button
            {...button("cancel")}
            variant="default"
            leftSection={<UserX size={16} aria-hidden="true" />}
          >
            {labels.cancel}
          </Button>
          {blockMenu}
        </Group>
      );
    case RelationshipStatus.REQUEST_RECEIVED:
      return (
        <Group gap="xs" wrap="nowrap">
          <Button
            {...button("accept")}
            leftSection={<UserCheck size={16} aria-hidden="true" />}
          >
            {labels.accept}
          </Button>
          <Button {...button("decline")} variant="default">
            {labels.decline}
          </Button>
          {blockMenu}
        </Group>
      );
    case RelationshipStatus.FRIENDS:
      return (
        <Group gap="xs" wrap="nowrap">
          <OpenChatButton
            friendId={target.userId}
            friendName={target.displayName}
            disabled={locked}
          />
          <Menu position="bottom-end" disabled={locked}>
            <Menu.Target>
              <Button
                size="sm"
                variant="light"
                disabled={locked}
                // "Friends" on every row says nothing about whose menu it is.
                aria-label={labels.friendMenuFor.replace(
                  "{name}",
                  () => target.displayName,
                )}
                leftSection={<Check size={16} aria-hidden="true" />}
                rightSection={<ChevronDown size={16} aria-hidden="true" />}
              >
                {labels.friends}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<UserMinus size={16} aria-hidden="true" />}
                onClick={() => onAction("unfriend", target)}
              >
                {labels.unfriend}
              </Menu.Item>
              <Menu.Item
                color="warn"
                leftSection={<Ban size={16} aria-hidden="true" />}
                onClick={() => onAction("block", target)}
              >
                {labels.block}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      );
    case RelationshipStatus.BLOCKED_BY_ME:
      return (
        <Button
          {...button("unblock")}
          variant="default"
          leftSection={<ShieldOff size={16} aria-hidden="true" />}
        >
          {labels.unblock}
        </Button>
      );
    case RelationshipStatus.UNAVAILABLE:
    case RelationshipStatus.NOT_APPLICABLE:
      return null;
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}
