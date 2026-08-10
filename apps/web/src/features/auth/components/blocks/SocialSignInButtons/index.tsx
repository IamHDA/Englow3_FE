"use client";

import { Alert, Group, Loader, UnstyledButton } from "@mantine/core";
import { useState } from "react";

import {
  oauthProviderLabels,
  signInWithProvider,
  type OAuthProvider,
} from "@/features/auth/signInWithProvider";

import { FacebookIcon } from "./FacebookIcon";
import { GoogleIcon } from "./GoogleIcon";
import classes from "./SocialSignInButtons.module.css";

const providers: { provider: OAuthProvider; Icon: typeof GoogleIcon }[] = [
  { provider: "google", Icon: GoogleIcon },
  { provider: "facebook", Icon: FacebookIcon },
];

type SocialSignInButtonsProps = {
  /** In-app path to return to after the provider round trip. */
  next?: string;
};

export function SocialSignInButtons({ next }: SocialSignInButtonsProps) {
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (provider: OAuthProvider) => {
    setError(null);
    setPending(provider);

    // On success the browser leaves for the provider and never comes back to
    // this component, so `pending` is only ever cleared on failure.
    const result = await signInWithProvider(provider, next);
    if (result) {
      setError(result.message ?? null);
      setPending(null);
    }
  };

  return (
    <>
      {error ? (
        <Alert color="red" role="alert" variant="light">
          {error}
        </Alert>
      ) : null}

      <Group gap="sm" justify="center">
        {providers.map(({ provider, Icon }) => (
          <UnstyledButton
            key={provider}
            component="button"
            type="button"
            onClick={() => start(provider)}
            disabled={pending !== null}
            className={classes.button}
            aria-label={`Continue with ${oauthProviderLabels[provider]}`}
          >
            {pending === provider ? (
              <Loader size={18} color="slate.5" />
            ) : (
              <Icon width={22} height={22} />
            )}
          </UnstyledButton>
        ))}
      </Group>
    </>
  );
}
