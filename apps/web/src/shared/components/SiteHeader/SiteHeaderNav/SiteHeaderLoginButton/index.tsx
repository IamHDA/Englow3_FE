"use client";

import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { LoginModal } from "@/features/auth";

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
        // An explicit variant is required: without one Mantine falls back to the
        // filled primary colour, which paints the button amber on hover.
        variant="outline"
        color="navy.9"
        size="md"
        radius="md"
        fw={700}
        className={classes.root}
      >
        Đăng nhập
      </Button>
      <LoginModal opened={opened} onClose={close} />
    </>
  );
}
