"use client";

import { Anchor, Avatar, Flex, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import type { ReactNode } from "react";

import { DATE_LOCALES } from "@/shared/constants/dateLocales";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { FRIENDS_ROUTES } from "../../../constants/friends";

import classes from "./PersonRow.module.css";

type PersonRowProps = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  /** A line under the name: what the date means, and the date. */
  caption?: { label: string; date: string };
  /** The buttons for this person. */
  actions?: ReactNode;
};

/**
 * One person in a list: picture, name (a link to their wall) and the buttons
 * that apply. The same row for friends, requests, search results and blocks.
 * On a phone the buttons drop under the name.
 */
export function PersonRow({
  userId,
  displayName,
  avatarUrl,
  caption,
  actions,
}: PersonRowProps) {
  const { language } = useLanguage();
  return (
    <Flex
      className={classes.row}
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "center" }}
      justify="space-between"
      gap="sm"
      px="md"
      py="sm"
    >
      <Group gap="sm" wrap="nowrap" miw={0}>
        <Avatar src={avatarUrl} name={displayName} radius="xl" size={44} />
        <Stack gap={0} miw={0}>
          <Anchor
            component={Link}
            href={FRIENDS_ROUTES.wall(userId)}
            fw={600}
            c="ink.9"
            truncate
          >
            {displayName}
          </Anchor>
          {caption && (
            <Text size="xs" c="ink.5">
              {caption.label}{" "}
              {new Date(caption.date).toLocaleDateString(
                DATE_LOCALES[language],
              )}
            </Text>
          )}
        </Stack>
      </Group>
      {actions}
    </Flex>
  );
}
