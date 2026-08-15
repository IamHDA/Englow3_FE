"use client";

import { CloseButton, Group, Modal, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";

import classes from "./LoginModal.module.css";
import { LoginForm } from "./LoginForm";

type LoginModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function LoginModal({ opened, onClose }: LoginModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={580}
      radius={20}
      centered
      padding={0}
      withCloseButton={false}
      classNames={{ content: classes.content }}
    >
      <CloseButton
        onClick={onClose}
        aria-label="Close"
        className={classes.closeButton}
      />
      <Stack gap={36} py={{ base: 32, sm: 62 }} px={{ base: 24, sm: 59 }}>
        <Group
          wrap="nowrap"
          gap={6}
          w="fit-content"
          mx="auto"
        >
          <Image src="/englow3-mark.png" alt="Englow3" width={52} height={56} />
          <Stack gap={4} flex={1} miw={0}>
            <Title order={1} fz={22} fw={700} c="black">
              Welcome to Englow3
            </Title>
            <Text fz={12} fw={700} c="black">
              Your Personal Path, Your Future in Hand
            </Text>
          </Stack>
        </Group>

        <LoginForm onSuccess={onClose} />
      </Stack>
    </Modal>
  );
}
