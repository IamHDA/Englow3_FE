"use client";

import {
  Box,
  CloseButton,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";

import {
  AUTH_MODE_COPY,
  AuthMode,
} from "@/features/auth/constants/authOptions";

import classes from "./AuthModal.module.css";
import { AuthSocialButtons } from "./AuthSocialButtons";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthModalProps = {
  opened: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
};

export function AuthModal({
  opened,
  onClose,
  initialMode = AuthMode.LOGIN,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isLogin = mode === AuthMode.LOGIN;
  const copy = AUTH_MODE_COPY[mode];

  function handleClose() {
    onClose();
    setMode(initialMode);
  }

  function toggleMode() {
    setMode(isLogin ? AuthMode.REGISTER : AuthMode.LOGIN);
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size={580}
      radius={20}
      centered
      padding={0}
      withCloseButton={false}
      overlayProps={{ color: "#0F1B3A", backgroundOpacity: 0.5 }}
      classNames={{ content: classes.content }}
    >
      <CloseButton
        onClick={handleClose}
        aria-label="Đóng"
        radius={10}
        size={36}
        className={classes.closeButton}
      />

      <Stack align="center" gap={10} pt={34} px={40}>
        <Image src="/englow3-mark.png" alt="Englow3" width={52} height={56} />
        <Title order={1} className={classes.title}>
          {copy.title}
        </Title>
        <Text className={classes.subtitle}>{copy.subtitle}</Text>
      </Stack>

      <Box pt={26} px={40}>
        {isLogin ? (
          <LoginForm onSuccess={handleClose} />
        ) : (
          <RegisterForm onSuccess={handleClose} />
        )}
      </Box>

      <Group pt={22} px={40} gap={14} wrap="nowrap">
        <Divider flex={1} />
        <Text className={classes.dividerLabel}>{copy.socialLabel}</Text>
        <Divider flex={1} />
      </Group>

      <Box pt={16} px={40}>
        <AuthSocialButtons />
      </Box>

      <Group
        justify="center"
        gap={8}
        mt={22}
        pt={18}
        pb={24}
        px={40}
        className={classes.footer}
      >
        <Text size="sm" c="ink.7">
          {copy.footerPrompt}
        </Text>
        <UnstyledButton
          type="button"
          className={classes.footerAction}
          onClick={toggleMode}
        >
          {copy.footerAction}
        </UnstyledButton>
      </Group>
    </Modal>
  );
}
