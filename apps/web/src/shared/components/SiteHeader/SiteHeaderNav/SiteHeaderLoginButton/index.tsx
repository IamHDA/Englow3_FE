"use client";

import { Button } from "@mantine/core";
import Link from "next/link";

import classes from "./SiteHeaderLoginButton.module.css";

type SiteHeaderLoginButtonProps = {
  /** Called after the link is followed, so the mobile drawer can close itself. */
  onNavigate?: () => void;
  fullWidth?: boolean;
};

export function SiteHeaderLoginButton({
  onNavigate,
  fullWidth,
}: SiteHeaderLoginButtonProps) {
  return (
    <Button
      component={Link}
      href="/login"
      onClick={onNavigate}
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
      Login
    </Button>
  );
}
