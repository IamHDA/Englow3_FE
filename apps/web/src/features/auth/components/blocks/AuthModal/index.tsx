"use client";

import { Anchor, Divider, Group, Modal, Stack, Text } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AUTH_MODES,
  authModeCopy,
  type AuthMode,
} from "@/features/auth/constants/authModes";

import { AuthForm } from "./AuthForm";
import classes from "./AuthModal.module.css";
import { SocialSignInButtons } from "./SocialSignInButtons";

type AuthModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function AuthModal({ opened, onClose }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(AUTH_MODES.login);
  const copy = authModeCopy[mode];

  // The session lives in cookies, so anything already rendered on the server
  // needs a refresh before it can see it.
  function handleSuccess() {
    onClose();
    router.refresh();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      // Reopening should always start on login, but flipping the copy while the
      // modal is still fading out would be visible, so it waits for the exit.
      onExitTransitionEnd={() => setMode(AUTH_MODES.login)}
      centered
      size={420}
      radius={14}
      padding={20}
      overlayProps={{
        color: "var(--mantine-color-slate-0)",
        backgroundOpacity: 0.85,
        blur: 3,
      }}
      classNames={{ content: classes.content }}
    >
      <Stack gap={20} px={{ base: 0, sm: 16 }} pb={{ base: 2, sm: 8 }}>
        <Group gap={10} wrap="nowrap">
          <Image
            src="/englow3-mark.png"
            alt=""
            width={48}
            height={52}
            className={classes.mark}
          />
          <Stack gap={5}>
            {/*
              Modal.Title rather than Title: it registers with the modal
              context, which is what gives the dialog its aria-labelledby.
              The design puts the heading in the body, not in a header bar.
            */}
            <Modal.Title className={classes.title}>
              Welcome to Englow3
            </Modal.Title>
            <Text className={classes.tagline}>
              Your Personal Path, Your Future in Hand
            </Text>
          </Stack>
        </Group>

        {/* Remounting on mode change resets the fields and swaps the resolver. */}
        <AuthForm key={mode} mode={mode} onSuccess={handleSuccess} />

        <Stack gap={12}>
          <Divider
            label="Or continue with"
            labelPosition="center"
            classNames={{ label: classes.dividerLabel }}
          />

          <SocialSignInButtons />
        </Stack>

        <Text ta="center" fz={13} c="slate.6">
          {copy.switchPrompt}{" "}
          <Anchor
            component="button"
            type="button"
            fz={13}
            fw={700}
            c="navy.7"
            onClick={() => setMode(copy.switchTo)}
          >
            {copy.switchLabel}
          </Anchor>
        </Text>
      </Stack>
    </Modal>
  );
}
