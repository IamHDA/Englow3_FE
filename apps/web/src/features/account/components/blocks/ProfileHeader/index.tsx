import {
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { CheckCircle2, Copy, Hash, Mail, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  GENDER_OPTIONS,
  ONBOARDING_STEP_LABELS,
} from "../../../constants/profile";
import type { AccountProfile } from "../../../types";

import classes from "./ProfileHeader.module.css";

type ProfileHeaderProps = {
  profile: NonNullable<AccountProfile>;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { isVi } = useLanguage();

  const genderLabel = isVi
    ? GENDER_OPTIONS.find((opt) => opt.value === profile.gender)?.label ?? null
    : profile.gender === "MALE"
    ? "Male"
    : profile.gender === "FEMALE"
    ? "Female"
    : profile.gender
    ? "Other"
    : null;

  const isOnboardingComplete = profile.onboardingStep === "COMPLETED";

  function handleCopyId() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profile.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Paper radius="lg" withBorder className={classes.headerPaper}>
      {/* Decorative Brand Banner */}
      <Box
        className={classes.banner}
        style={
          profile.bannerUrl
            ? { backgroundImage: `url(${profile.bannerUrl})` }
            : undefined
        }
      >
        <Box className={classes.bannerOverlay} />
      </Box>

      {/* User Avatar & Info */}
      <Stack gap="md" p="xl" pt={0}>
        <Group justify="space-between" align="flex-end" wrap="nowrap">
          <Box className={classes.avatarWrapper}>
            <Avatar
              src={profile.avatarUrl}
              name={profile.displayName || profile.fullName}
              radius="xl"
              className={classes.avatar}
            />
            <Box className={classes.onlineDot} title={isVi ? "Đang hoạt động" : "Online"} />
          </Box>

          <Badge
            color={isOnboardingComplete ? "teal" : "orange"}
            variant="light"
            size="sm"
            leftSection={
              isOnboardingComplete ? (
                <CheckCircle2 size={12} />
              ) : (
                <Sparkles size={12} />
              )
            }
          >
            {isOnboardingComplete
              ? isVi ? "Đã sẵn sàng học" : "Ready to Learn"
              : isVi ? ONBOARDING_STEP_LABELS[profile.onboardingStep] ?? "Đang thiết lập" : "Setting up"}
          </Badge>
        </Group>

        <Stack gap={4}>
          <Group gap="xs" align="center">
            <Title order={2} fz={20} fw={800} c="ink.9">
              {profile.fullName || profile.displayName}
            </Title>
            <UserCheck size={18} className={classes.verifiedIcon} />
          </Group>

          <Text size="sm" fw={600} c="ink.5">
            @{profile.displayName}
          </Text>
        </Stack>

        <Divider />

        {/* Details list */}
        <Stack gap="xs">
          <Group gap="xs" align="center" wrap="nowrap">
            <Mail size={15} className={classes.infoIcon} />
            <Text size="xs" c="ink.7" truncate>
              {profile.email}
            </Text>
            <Badge color="teal" variant="dot" size="xs" ml="auto">
              {isVi ? "Đã xác thực" : "Verified"}
            </Badge>
          </Group>

          {genderLabel && (
            <Group gap="xs" align="center" justify="space-between">
              <Text size="xs" c="ink.5">
                {isVi ? "Giới tính:" : "Gender:"}
              </Text>
              <Text size="xs" fw={600} c="ink.8">
                {genderLabel}
              </Text>
            </Group>
          )}

          <Group gap="xs" align="center" justify="space-between">
            <Group gap={4} align="center">
              <Hash size={13} className={classes.infoIcon} />
              <Text size="xs" c="ink.5">
                {isVi ? "Mã học viên:" : "Student ID:"}
              </Text>
            </Group>
            <Group
              gap={4}
              align="center"
              className={classes.clickableId}
              onClick={handleCopyId}
              title={isVi ? "Nhấn để sao chép mã" : "Click to copy ID"}
            >
              <Text size="xs" fw={600} c="ink.7">
                {profile.id.slice(0, 8)}...
              </Text>
              <Copy size={12} className={classes.infoIcon} />
              {copied && (
                <Text size="xs" c="teal.7" fw={700}>
                  {isVi ? "Đã chép!" : "Copied!"}
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}
