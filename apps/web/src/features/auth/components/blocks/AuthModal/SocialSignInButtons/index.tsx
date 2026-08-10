"use client";

import { ActionIcon, Alert, Group, Stack } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import type { IconType } from "react-icons";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { usePageRestore } from "@/features/auth/hooks/usePageRestore";
import {
  oauthProviderLabels,
  signInWithProvider,
  type OAuthProvider,
} from "@/features/auth/signInWithProvider";

import classes from "./SocialSignInButtons.module.css";

const ICON_SIZE = 20;

/**
 * FcGoogle ships its own colours; FaFacebook is a single shape following
 * currentColor, so only it needs a class to carry the brand blue.
 */
const providers: {
  provider: OAuthProvider;
  Icon: IconType;
  className?: string;
}[] = [
  { provider: "google", Icon: FcGoogle },
  { provider: "facebook", Icon: FaFacebook, className: classes.facebookMark },
];

export function SocialSignInButtons() {
  const pathname = usePathname();
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pressing Back from the provider restores this page from the bfcache with
  // its state intact, which would otherwise leave the button spinning forever.
  usePageRestore(useCallback(() => setPending(null), []));

  async function start(provider: OAuthProvider) {
    setError(null);
    setPending(provider);

    // On success the browser leaves for the provider, so the only paths that
    // clear `pending` are a failure here and a back-navigation restore above.
    const result = await signInWithProvider(provider, pathname);
    if (result) {
      setError(result.message ?? null);
      setPending(null);
    }
  }

  return (
    <Stack gap={10}>
      {error && (
        <Alert
          color="red"
          role="alert"
          variant="light"
          p="xs"
          classNames={{ message: classes.alertMessage }}
        >
          {error}
        </Alert>
      )}

      <Group justify="center" gap={10}>
        {providers.map(({ provider, Icon, className }) => (
          <ActionIcon
            key={provider}
            variant="default"
            size={40}
            radius="md"
            type="button"
            onClick={() => start(provider)}
            loading={pending === provider}
            disabled={pending !== null && pending !== provider}
            aria-label={`Continue with ${oauthProviderLabels[provider]}`}
          >
            <Icon size={ICON_SIZE} className={className} />
          </ActionIcon>
        ))}
      </Group>
    </Stack>
  );
}
