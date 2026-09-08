"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { KeyRound, Laptop, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { supabase } from "@/lib/supabase/client";
import type { AccountProfile } from "../../../types";

import classes from "./ProfileSecurityTab.module.css";

type ProfileSecurityTabProps = {
  profile: NonNullable<AccountProfile>;
};

export function ProfileSecurityTab({ profile }: ProfileSecurityTabProps) {
  const { t } = useLanguage();
  const [isSendingReset, setIsSendingReset] = useState(false);

  async function handleResetPassword() {
    setIsSendingReset(true);
    const notificationId = notifications.show({
      loading: true,
      autoClose: false,
      withCloseButton: false,
      title: t.account.sendingEmail,
      message: t.account.sendingEmailDesc,
    });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
      });

      if (error) {
        notifications.update({
          id: notificationId,
          loading: false,
          autoClose: true,
          withCloseButton: true,
          color: "warn",
          title: t.account.resetEmailErrorTitle,
          message: error.message,
        });
        return;
      }

      notifications.update({
        id: notificationId,
        loading: false,
        autoClose: true,
        withCloseButton: true,
        color: "teal",
        title: t.account.resetEmailSentTitle,
        message: `${t.account.resetEmailSentDesc} (${profile.email})`,
      });
    } catch {
      notifications.update({
        id: notificationId,
        loading: false,
        autoClose: true,
        withCloseButton: true,
        color: "warn",
        title: t.account.connectionErrorTitle,
        message: t.account.connectionErrorDesc,
      });
    } finally {
      setIsSendingReset(false);
    }
  }

  return (
    <Stack gap="lg" className={classes.tabContainer}>
      {/* Password Reset Card */}
      <Paper radius="lg" withBorder p="xl" className={classes.paper}>
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="xs">
              <ThemeIcon color="orange.5" variant="light" size="lg" radius="md">
                <KeyRound size={20} />
              </ThemeIcon>
              <Stack gap={2}>
                <Title order={3} fz={18} fw={700} c="ink.9">
                  {t.account.accountPasswordTitle}
                </Title>
                <Text size="xs" c="ink.6">
                  {t.account.accountPasswordDesc}
                </Text>
              </Stack>
            </Group>

            <Button
              variant="light"
              color="orange"
              radius="md"
              leftSection={<Mail size={16} />}
              loading={isSendingReset}
              onClick={handleResetPassword}
            >
              {t.account.sendResetEmail}
            </Button>
          </Group>

          <Divider />

          <Paper p="md" radius="md" withBorder className={classes.securityAdvice}>
            <Group gap="xs" align="flex-start">
              <ShieldAlert size={18} className={classes.warningIcon} />
              <Text size="xs" c="ink.7" style={{ flex: 1 }}>
                {t.account.resetLinkValidNotice}
              </Text>
            </Group>
          </Paper>
        </Stack>
      </Paper>

      {/* Active Session Card */}
      <Paper radius="lg" withBorder p="xl" className={classes.paper}>
        <Stack gap="md">
          <Group gap="xs">
            <ThemeIcon color="teal.6" variant="light" size="lg" radius="md">
              <ShieldCheck size={20} />
            </ThemeIcon>
            <Stack gap={2}>
              <Title order={3} fz={18} fw={700} c="ink.9">
                {t.account.activeSessionsTitle}
              </Title>
              <Text size="xs" c="ink.6">
                {t.account.activeSessionsDesc}
              </Text>
            </Stack>
          </Group>

          <Divider />

          <Group justify="space-between" align="center" wrap="wrap" p="xs">
            <Group gap="sm">
              <Laptop size={22} className={classes.deviceIcon} />
              <Stack gap={2}>
                <Group gap="xs">
                  <Text size="sm" fw={700} c="ink.9">
                    {t.account.currentBrowser}
                  </Text>
                  <Badge color="teal" size="xs" variant="dot">
                    {t.account.activeNow}
                  </Badge>
                </Group>
                <Text size="xs" c="ink.5">
                  {t.account.supabaseAuthNotice}
                </Text>
              </Stack>
            </Group>

            <Badge color="blue" variant="light" size="sm">
              {t.account.secureSession}
            </Badge>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
