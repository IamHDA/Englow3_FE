"use client";

import { Button } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./SiteHeaderLoginButton.module.css";

type SiteHeaderLoginButtonProps = {
  /**
   * Opens the login form. The header owns the one modal: a modal rendered in
   * here would live inside the mobile drawer and close along with it, which
   * made signing in on a phone impossible.
   */
  onClick: () => void;
  fullWidth?: boolean;
};

export function SiteHeaderLoginButton({
  onClick,
  fullWidth,
}: SiteHeaderLoginButtonProps) {
  const { t } = useLanguage();

  return (
    <Button
      onClick={onClick}
      fullWidth={fullWidth}
      variant="outline"
      color="navy.9"
      size="md"
      radius="md"
      fw={700}
      className={classes.root}
    >
      {t.nav.login}
    </Button>
  );
}
