"use client";

import { Avatar, Group, Text } from "@mantine/core";
import { UserRound } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

/** Who wrote something whose author erased their account: nobody to link to, and the content stays. */
export function DeletedAuthor({ size = 28 }: { size?: number }) {
  const { t } = useLanguage();
  return (
    <Group gap="xs" wrap="nowrap" miw={0}>
      <Avatar radius="xl" size={size} aria-hidden="true">
        <UserRound size={size * 0.55} aria-hidden="true" />
      </Avatar>
      <Text size="sm" fs="italic" c="ink.5" truncate>
        {t.blog.deletedAuthor}
      </Text>
    </Group>
  );
}
