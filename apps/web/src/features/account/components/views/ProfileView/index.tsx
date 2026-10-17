"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  User,
  UserX,
} from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { type Gender } from "@/lib/graphql/generated";
import { useUpdateProfileMutation } from "@/lib/graphql/generated/hooks";
import { useAccountProfile } from "../../../hooks/useAccountProfile";
import { ProfileForm } from "../../blocks/ProfileForm";
import type { ProfileFormValues } from "../../blocks/ProfileForm/schema";
import { ProfileHeader } from "../../blocks/ProfileHeader";
import { ProfileLearningTab } from "../../blocks/ProfileLearningTab";
import { ProfileSecurityTab } from "../../blocks/ProfileSecurityTab";
import { ProfileSkeleton } from "../../blocks/ProfileSkeleton";
import { ProfileTargetCard } from "../../blocks/ProfileTargetCard";

import classes from "./ProfileView.module.css";
import { PageHeader } from "@/shared/components/Page";

function validTab(tab: string | null) {
  return tab === "learning" || tab === "security" ? tab : "info";
}

export function ProfileView({ initialTab = "info" }: { initialTab?: string }) {
  const [tab, setTab] = useState(validTab(initialTab));
  useEffect(() => {
    const restore = () =>
      setTab(validTab(new URL(window.location.href).searchParams.get("tab")));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const changeTab = (next: string | null) => {
    const selected = validTab(next);
    setTab(selected);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", selected);
    window.history.replaceState(null, "", url);
  };
  const { profile, loading, hasError, refresh } = useAccountProfile();
  const [updateProfile, { loading: isSubmitting }] = useUpdateProfileMutation();
  const { t } = useLanguage();

  if (loading && !profile) {
    return <ProfileSkeleton />;
  }

  if (hasError) {
    return (
      <Paper radius="lg" withBorder p="xl" className={classes.errorPaper}>
        <Alert
          icon={<AlertCircle size={20} />}
          title={t.account.profileLoadErrorTitle}
          color="warn"
          radius="md"
        >
          {t.account.profileLoadErrorDescription}
          <Button
            variant="light"
            mt="md"
            loading={loading}
            onClick={() => void refresh().catch(() => {})}
          >
            {t.common.retry}
          </Button>
        </Alert>
      </Paper>
    );
  }

  if (!profile) {
    return (
      <Paper radius="lg" withBorder p="xl" className={classes.unauthPaper}>
        <Stack align="center" gap="md" py="xl">
          <UserX size={48} className={classes.unauthIcon} />
          <Title order={3} fw={700} c="ink.9">
            {t.account.notSignedInTitle}
          </Title>
          <Text size="sm" c="ink.6" ta="center">
            {t.account.notSignedInDescription}
          </Text>
        </Stack>
      </Paper>
    );
  }

  async function handleUpdate(values: ProfileFormValues) {
    try {
      const result = await updateProfile({
        variables: {
          input: {
            fullName: values.fullName,
            displayName: values.displayName,
            gender: values.gender ? (values.gender as Gender) : null,
            birthDate: values.birthDate ? values.birthDate : null,
          },
        },
      });

      if (result.data?.updateProfile) {
        notifications.show({
          color: "teal",
          icon: <CheckCircle2 size={18} />,
          title: t.account.updateSuccessTitle,
          message: t.account.updateSuccessMessage,
        });
        await refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t.account.saveErrorFallback;
      notifications.show({
        color: "warn",
        icon: <AlertCircle size={18} />,
        title: t.account.updateErrorTitle,
        message,
      });
    }
  }

  return (
    <Stack gap="lg" className={classes.viewContainer}>
      <PageHeader title={t.account.title} />

      {/* 2-Column Responsive Layout */}
      <Grid gap="xl" align="flex-start">
        {/* Left Column: Profile Card & Target Snapshot */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <ProfileHeader profile={profile} />
            <ProfileTargetCard profile={profile} />
          </Stack>
        </Grid.Col>

        {/* Right Column: Interactive Tabs */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Tabs
            value={tab}
            onChange={changeTab}
            variant="pills"
            radius="md"
            keepMounted
          >
            <Tabs.List mb="md" className={classes.tabsList}>
              <Tabs.Tab
                value="info"
                leftSection={<User size={16} />}
                className={classes.tabItem}
              >
                {t.account.personalInfoTab}
              </Tabs.Tab>
              <Tabs.Tab
                value="learning"
                leftSection={<GraduationCap size={16} />}
                className={classes.tabItem}
              >
                {t.account.learningTab}
              </Tabs.Tab>
              <Tabs.Tab
                value="security"
                leftSection={<ShieldCheck size={16} />}
                className={classes.tabItem}
              >
                {t.account.securityTab}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="info">
              <ProfileForm
                profile={profile}
                isSubmitting={isSubmitting}
                onSubmit={handleUpdate}
              />
            </Tabs.Panel>

            <Tabs.Panel value="learning">
              <ProfileLearningTab profile={profile} />
            </Tabs.Panel>

            <Tabs.Panel value="security">
              <ProfileSecurityTab profile={profile} />
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
