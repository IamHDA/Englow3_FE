"use client";

import { ActionIcon, Anchor, Avatar, Group, Text, Title } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { CHAT_ROUTES } from "../../../../constants/chat";
import type { ConversationPartner } from "../../../../types";

import classes from "./ConversationHeader.module.css";

type ConversationHeaderProps = {
  /** Null when the other person erased their account. */
  partner: ConversationPartner | null;
};

/** Who the conversation is with: their picture and name, a link to their wall - and, on a phone, the way back to the list. */
export function ConversationHeader({ partner }: ConversationHeaderProps) {
  const copy = useLanguage().t.chat;

  return (
    <Group gap="sm" px="md" py="sm" wrap="nowrap" className={classes.header}>
      <ActionIcon
        component={Link}
        href={CHAT_ROUTES.list}
        variant="subtle"
        color="ink"
        size={44}
        hiddenFrom="md"
        aria-label={copy.pane.backToList}
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </ActionIcon>
      <Avatar
        src={partner?.avatarUrl}
        name={partner?.displayName}
        radius="xl"
        size={40}
        aria-hidden="true"
      />
      {partner ? (
        <Title order={2} fz={18} fw={700} miw={0}>
          <Anchor
            component={Link}
            href={CHAT_ROUTES.wall(partner.userId)}
            c="navy.9"
            underline="hover"
            truncate="end"
            display="block"
            aria-label={copy.pane.viewProfile.replace(
              "{name}",
              () => partner.displayName,
            )}
          >
            {partner.displayName}
          </Anchor>
        </Title>
      ) : (
        <Text fw={700} c="ink.6" truncate>
          {copy.list.deletedUser}
        </Text>
      )}
    </Group>
  );
}
