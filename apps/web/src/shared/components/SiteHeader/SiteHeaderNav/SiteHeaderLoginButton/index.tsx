"use client";

import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { AuthModal } from "@/features/auth";

import classes from "./SiteHeaderLoginButton.module.css";

type SiteHeaderLoginButtonProps = {
  /** Called after the modal opens, so the mobile drawer can close itself. */
  onNavigate?: () => void;
  fullWidth?: boolean;
};

export function SiteHeaderLoginButton({
  onNavigate,
  fullWidth,
}: SiteHeaderLoginButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        onClick={() => {
          open();
          onNavigate?.();
        }}
        fullWidth={fullWidth}
        variant="outline"
        color="navy.9"
        size="md"
        radius="md"
        fw={700}
        className={classes.root}
      >
        Đăng nhập
      </Button>
      <AuthModal opened={opened} onClose={close} />
    </>
  );
}
