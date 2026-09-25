"use client";

import { Button, type ButtonProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AuthModal, useAuth } from "@/features/auth";
import { useOnboarding } from "@/features/onboarding";

/** Where the button goes once the learner is signed in and set up. */
const READY_LEARNER_HREF = "/study/daily-path";

type HomeCtaButtonProps = Omit<ButtonProps, "children"> & {
  label: string;
};

/**
 * The landing page's one call to action, used in the hero and again at the
 * foot of the page. It opens whatever the visitor is missing: the login form,
 * then goal setup (a popup on every page, not a page of its own), then their
 * daily path once both are done.
 */
export function HomeCtaButton({ label, ...buttonProps }: HomeCtaButtonProps) {
  const { session } = useAuth();
  const { requiresOnboarding, open: openOnboarding } = useOnboarding();
  const [authOpened, auth] = useDisclosure(false);

  const arrow = <ArrowRight aria-hidden="true" size={22} strokeWidth={2.5} />;

  if (session && !requiresOnboarding) {
    return (
      <Button
        component={Link}
        href={READY_LEARNER_HREF}
        rightSection={arrow}
        {...buttonProps}
      >
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => (session ? openOnboarding() : auth.open())}
        rightSection={arrow}
        {...buttonProps}
      >
        {label}
      </Button>
      <AuthModal opened={authOpened} onClose={auth.close} />
    </>
  );
}
