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

import { RelationshipStatus } from "@/lib/graphql/generated";

import { ACTION_LABELS, FRIENDS_ROUTES } from "../../../constants/friends";
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
  const locked = pending !== null;
  const loadingKind = pending?.userId === target.userId ? pending.kind : null;
  const button = (kind: RelationshipActionKind) => ({
    size: "sm" as const,
    loading: loadingKind === kind,
    disabled: locked && loadingKind !== kind,
    onClick: () => onAction(kind, target),
  });
  const blockMenu = (
    <BlockMenu disabled={locked} onBlock={() => onAction("block", target)} />
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
            {ACTION_LABELS.editProfile}
          </Button>
          {showFriendsLink && (
            <Button
              component={Link}
              href={FRIENDS_ROUTES.friends}
              size="sm"
              variant="default"
              leftSection={<Users size={16} aria-hidden="true" />}
            >
              {ACTION_LABELS.friendsPage}
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
            {ACTION_LABELS.add}
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
            {ACTION_LABELS.cancel}
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
            {ACTION_LABELS.accept}
          </Button>
          <Button {...button("decline")} variant="default">
            {ACTION_LABELS.decline}
          </Button>
          {blockMenu}
        </Group>
      );
    case RelationshipStatus.FRIENDS:
      return (
        // The group leaves room for the "Nhắn tin" button of the chat plan.
        <Group gap="xs" wrap="nowrap">
          <Menu position="bottom-end" disabled={locked}>
            <Menu.Target>
              <Button
                size="sm"
                variant="light"
                disabled={locked}
                leftSection={<Check size={16} aria-hidden="true" />}
                rightSection={<ChevronDown size={16} aria-hidden="true" />}
              >
                {ACTION_LABELS.friends}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<UserMinus size={16} aria-hidden="true" />}
                onClick={() => onAction("unfriend", target)}
              >
                {ACTION_LABELS.unfriend}
              </Menu.Item>
              <Menu.Item
                color="warn"
                leftSection={<Ban size={16} aria-hidden="true" />}
                onClick={() => onAction("block", target)}
              >
                {ACTION_LABELS.block}
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
          {ACTION_LABELS.unblock}
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
