"use client";

import { Badge, Box, Group, Stack, Text, Title } from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function PronunciationHeader() {
  const { t, isVi } = useLanguage();

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Box>
          <Group gap="xs" align="center">
            <Title order={2} fw={800} c="dark.9">
              {t.pronunciation.title}
            </Title>
            <Badge variant="filled" color="teal" size="sm">
              {t.pronunciation.ipaBadge}
            </Badge>
          </Group>
          <Text c="dimmed" fz="sm" mt={4}>
            {t.pronunciation.subtitle}
          </Text>
        </Box>

        <Badge
          variant="light"
          color="indigo"
          size="lg"
          leftSection={<IconMicrophone size={16} />}
        >
          {isVi ? "Microphone AI sẵn sàng" : "Microphone AI Ready"}
        </Badge>
      </Group>
    </Stack>
  );
}
