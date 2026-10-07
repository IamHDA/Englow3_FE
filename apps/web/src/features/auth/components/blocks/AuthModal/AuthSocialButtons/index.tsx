"use client";

import { Button, SimpleGrid } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRef, useState } from "react";
import { authErrorMessage } from "@/features/auth/authErrorMessage";

import { AuthProvider } from "@/features/auth/constants/authOptions";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function AuthSocialButtons() {
  const { isVi } = useLanguage();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function handleOAuthClick(provider: AuthProvider) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        notifications.show({
          color: "warn",
          title: isVi ? "Không thể đăng nhập" : "Could not sign in",
          message: authErrorMessage(error, isVi),
        });
      }
    } catch {
      notifications.show({
        color: "warn",
        message: authErrorMessage(null, isVi),
      });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <SimpleGrid cols={2} spacing={12}>
      <Button
        variant="default"
        h={48}
        fz={15}
        fw={600}
        leftSection={<FcGoogle aria-hidden="true" size={20} />}
        onClick={() => handleOAuthClick(AuthProvider.GOOGLE)}
        disabled={busy}
      >
        Google
      </Button>
      <Button
        variant="default"
        h={48}
        fz={15}
        fw={600}
        leftSection={
          <FaFacebook aria-hidden="true" size={20} color="#1877F2" />
        }
        onClick={() => handleOAuthClick(AuthProvider.FACEBOOK)}
        disabled={busy}
      >
        Facebook
      </Button>
    </SimpleGrid>
  );
}
