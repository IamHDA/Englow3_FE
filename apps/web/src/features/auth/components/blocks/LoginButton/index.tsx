"use client";

import { Button } from "@mantine/core";

import classes from "./LoginButton.module.css";

type LoginButtonProps = {
  onClick: () => void;
  fullWidth?: boolean;
};

/**
 * Trigger only. The dialog itself is deliberately not rendered here: this
 * button also sits inside the mobile drawer, and the drawer unmounts its
 * children when it closes, which would take an owned modal down with it.
 */
export function LoginButton({ onClick, fullWidth }: LoginButtonProps) {
  return (
    <Button
      onClick={onClick}
      fullWidth={fullWidth}
      // An explicit variant is required: without one Mantine falls back to
      // the filled primary colour, which paints the button amber on hover.
      variant="outline"
      color="navy.9"
      size="md"
      radius="md"
      fw={700}
      className={classes.root}
    >
      Login
    </Button>
  );
}
