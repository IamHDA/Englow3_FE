"use client";

import {
  Alert,
  Grid,
  Group,
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
  ChevronRight,
  GraduationCap,
  Home,
  ShieldCheck,
  User,
  UserX,
} from "lucide-react";
import Link from "next/link";

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

export function ProfileView() {
  const { profile, loading, hasError, refresh } = useAccountProfile();
  const [updateProfile, { loading: isSubmitting }] = useUpdateProfileMutation();
  const { t, isVi } = useLanguage();

  if (loading && !profile) {
    return <ProfileSkeleton />;
  }

  if (hasError) {
    return (
      <Paper radius="lg" withBorder p="xl" className={classes.errorPaper}>
        <Alert
          icon={<AlertCircle size={20} />}
          title={isVi ? "Không thể tải hồ sơ" : "Could not load profile"}
          color="warn"
          radius="md"
        >
          {isVi
            ? "Đã có lỗi xảy ra khi tải thông tin hồ sơ. Vui lòng kiểm tra lại kết nối mạng hoặc đăng nhập lại."
            : "An error occurred while loading profile details. Please verify your connection or sign in again."}
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
            {isVi ? "Chưa đăng nhập" : "Not Signed In"}
          </Title>
          <Text size="sm" c="ink.6" ta="center">
            {isVi
              ? "Vui lòng đăng nhập để xem và chỉnh sửa thông tin hồ sơ cá nhân của bạn."
              : "Please sign in to view and edit your profile settings."}
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
        err instanceof Error ? err.message : isVi ? "Đã có lỗi xảy ra khi lưu hồ sơ" : "Error saving profile";
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
      {/* Breadcrumbs Navigation */}
      <Group gap={6} align="center" className={classes.breadcrumb}>
        <Link href="/" className={classes.breadcrumbLink}>
          <Home size={14} />
          <span>{t.nav.home}</span>
        </Link>
        <ChevronRight size={14} className={classes.breadcrumbSeparator} />
        <Text size="xs" fw={600} c="ink.5">
          {t.nav.account}
        </Text>
        <ChevronRight size={14} className={classes.breadcrumbSeparator} />
        <Text size="xs" fw={700} c="navy.8">
          {t.account.title}
        </Text>
      </Group>

      {/* Page Heading */}
      <Stack gap={2}>
        <Title order={1} fz={{ base: 24, md: 28 }} fw={800} c="ink.9">
          {t.account.title}
        </Title>
        <Text size="sm" c="ink.6">
          {t.account.subtitle}
        </Text>
      </Stack>

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
          <Tabs defaultValue="info" variant="outline" radius="md">
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
