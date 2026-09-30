"use client";

import { Button, SimpleGrid } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRef, useState } from "react";
import { authErrorMessage } from "@/features/auth/authErrorMessage";

import { AuthProvider } from "@/features/auth/constants/authOptions";
import { supabase } from "@/lib/supabase/client";

export function AuthSocialButtons() {
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
          title: "Không thể đăng nhập",
          message: authErrorMessage(error),
        });
      }
    } catch {
      notifications.show({ color: "warn", message: authErrorMessage(null) });
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
