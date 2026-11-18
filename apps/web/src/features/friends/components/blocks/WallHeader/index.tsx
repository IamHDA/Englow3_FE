"use client";

import {
  Avatar,
  Badge,
  Box,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Users } from "lucide-react";
import type { ReactNode } from "react";

import { DATE_LOCALES } from "@/shared/constants/dateLocales";
import { useLanguage } from "@/shared/hooks/useLanguage";

import type { WallProfile } from "../../../types";

import classes from "./WallHeader.module.css";

type WallHeaderProps = {
  profile: WallProfile;
  /** Null for a staff wall, and when the count could not be read. */
  friendCount: number | null;
  /** The buttons for how the viewer stands with this account. */
  actions: ReactNode;
};

/** Banner, picture and name of an account, with how long it has been here and how many friends it has. */
export function WallHeader({ profile, friendCount, actions }: WallHeaderProps) {
  const { language, t } = useLanguage();
  const copy = t.friends.wall;
  return (
    <Paper radius="lg" withBorder className={classes.paper}>
      <Box
        className={classes.banner}
        style={
          profile.bannerUrl
            ? // Quoted (JSON.stringify escapes a quote or backslash inside), so a
              // ")" or a space in the address cannot end the url() early.
              { backgroundImage: `url(${JSON.stringify(profile.bannerUrl)})` }
            : undefined
        }
      />
      <Stack gap="md" p="xl" pt={0}>
        <Avatar
          src={profile.avatarUrl}
          name={profile.displayName}
          radius="xl"
          className={classes.avatar}
        />
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "flex-end" }}
          gap="md"
        >
          <Stack gap={6} miw={0}>
            <Group gap="xs" align="center">
              <Title order={1} fz={24} fw={700} c="ink.9">
                {profile.displayName}
              </Title>
              {profile.staff && <Badge color="navy">{copy.staffBadge}</Badge>}
            </Group>
            <Group gap="md">
              <Text size="sm" c="ink.6">
                {copy.joined}{" "}
                {new Date(profile.joinedAt).toLocaleDateString(
                  DATE_LOCALES[language],
                )}
              </Text>
              {friendCount !== null && (
                <Group gap={4} wrap="nowrap">
                  <Users size={14} aria-hidden="true" />
                  <Text size="sm" fw={600} c="ink.8">
                    {(friendCount === 1
                      ? copy.friendCountOne
                      : copy.friendCountOther
                    ).replace("{count}", String(friendCount))}
                  </Text>
                </Group>
              )}
            </Group>
          </Stack>
          {actions}
        </Flex>
      </Stack>
    </Paper>
  );
}
