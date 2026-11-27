"use client";
import { Box, Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function EditorFrame({
  title,
  children,
  busy,
  onClose,
  standalone = false,
  subtitle,
}: {
  title: string;
  /** What is being edited - its own name, under the title. */
  subtitle?: string;
  children: ReactNode;
  busy: boolean;
  onClose: () => void;
  standalone?: boolean;
}) {
  const { isVi } = useLanguage();
  if (!standalone)
    return (
      <Modal
        opened
        onClose={onClose}
        title={title}
        size="xl"
        closeOnClickOutside={false}
        closeOnEscape={!busy}
        withCloseButton={!busy}
      >
        {children}
      </Modal>
    );
  return (
    <Box maw={1320} mx="auto" p={{ base: "md", md: "xl" }}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Englow3 · {isVi ? "Không gian làm việc" : "Workspace"}
            </Text>
            <Title order={1}>{title}</Title>
            {subtitle && (
              <Text c="ink.6" fw={600} lineClamp={2}>
                {subtitle}
              </Text>
            )}
          </Stack>
          <Button variant="default" disabled={busy} onClick={onClose}>
            {isVi ? "Quay lại" : "Back"}
          </Button>
        </Group>
        {children}
      </Stack>
    </Box>
  );
}
