"use client";

import { Group, Loader, Text } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

type TypingIndicatorProps = {
  /** Who is typing, or null when nobody is. */
  name: string | null;
};

/**
 * "Name is typing...", under the messages. Its room is always kept, so a line
 * that comes and goes does not move the messages above it.
 */
export function TypingIndicator({ name }: TypingIndicatorProps) {
  const copy = useLanguage().t.chat.pane;
  return (
    <Group
      gap={6}
      h={22}
      px="md"
      wrap="nowrap"
      role="status"
      aria-live="polite"
    >
      {name !== null && (
        <>
          <Loader type="dots" size="xs" color="ink.5" />
          <Text size="xs" c="ink.6" truncate>
            {copy.typing.replace("{name}", () => name)}
          </Text>
        </>
      )}
    </Group>
  );
}
