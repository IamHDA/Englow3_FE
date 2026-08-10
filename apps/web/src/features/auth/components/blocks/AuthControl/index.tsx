"use client";

import { AccountMenu } from "@/features/auth/components/blocks/AccountMenu";
import { LoginButton } from "@/features/auth/components/blocks/LoginButton";
import { displayName } from "@/features/auth/displayName";
import { useSession } from "@/features/auth/hooks/useSession";

import { AuthControlSkeleton } from "./AuthControlSkeleton";

type AuthControlProps = {
  onLogin: () => void;
  fullWidth?: boolean;
};

/**
 * The header's auth slot. Holds its shape while the session resolves so the
 * bar does not jump from Login to an account menu on every load.
 */
export function AuthControl({ onLogin, fullWidth }: AuthControlProps) {
  const { session, loading } = useSession();

  if (loading) {
    return <AuthControlSkeleton fullWidth={fullWidth} />;
  }

  if (!session?.user) {
    return <LoginButton onClick={onLogin} fullWidth={fullWidth} />;
  }

  return <AccountMenu name={displayName(session.user)} fullWidth={fullWidth} />;
}
