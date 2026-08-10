"use client";

import { Divider, Group, Modal, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/features/auth/components/blocks/LoginForm";
import { SocialSignInButtons } from "@/features/auth/components/blocks/SocialSignInButtons";
import { signIn } from "@/features/auth/signIn";

import classes from "./LoginModal.module.css";

type LoginModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function LoginModal({ opened, onClose }: LoginModalProps) {
  const router = useRouter();

  // The session lives in cookies, so anything rendered on the server needs a
  // refresh to see it. `useSession` updates the header on its own.
  const handleSuccess = () => {
    onClose();
    router.refresh();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={480}
      centered
      radius={20}
      withCloseButton
      title="Log in to Englow3"
      classNames={{
        header: classes.header,
        title: classes.srOnlyTitle,
        body: classes.body,
        content: classes.content,
      }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 2 }}
    >
      <Stack gap="lg">
        <Group gap="sm" wrap="nowrap">
          <Image
            src="/englow3-mark.png"
            alt=""
            width={481}
            height={519}
            sizes="56px"
            className={classes.mark}
          />
          <Stack gap={2}>
            <Title order={2} className={classes.heading}>
              Welcome to Englow3
            </Title>
            <Text className={classes.tagline}>
              Your Personal Path, Your Future in Hand
            </Text>
          </Stack>
        </Group>

        <LoginForm onSubmit={signIn} onSuccess={handleSuccess} />

        <Divider label="Or continue with" labelPosition="center" />

        <SocialSignInButtons />
      </Stack>
    </Modal>
  );
}
