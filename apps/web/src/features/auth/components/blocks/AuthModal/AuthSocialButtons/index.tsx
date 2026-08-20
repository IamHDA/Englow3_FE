"use client";

import { Button, SimpleGrid } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { AuthProvider } from "@/features/auth/constants/authOptions";
import { supabase } from "@/lib/supabase/client";

async function handleOAuthClick(provider: AuthProvider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) {
    notifications.show({
      color: "warn",
      title: "Không thể đăng nhập",
      message: error.message,
    });
  }
}

export function AuthSocialButtons() {
  return (
    <SimpleGrid cols={2} spacing={12}>
      <Button
        variant="default"
        h={48}
        fz={15}
        fw={600}
        leftSection={<FcGoogle aria-hidden="true" size={20} />}
        onClick={() => handleOAuthClick(AuthProvider.GOOGLE)}
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
      >
        Facebook
      </Button>
    </SimpleGrid>
  );
}
