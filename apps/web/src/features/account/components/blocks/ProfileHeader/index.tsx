"use client";

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
import {
  CheckCircle2,
  Copy,
  Hash,
  Mail,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { OnboardingStep, Role } from "@/lib/graphql/generated";
import type { AppTranslations } from "@/shared/constants/translations";

import type { AccountProfile } from "../../../types";

import classes from "./ProfileHeader.module.css";

type ProfileHeaderProps = {
  profile: NonNullable<AccountProfile>;
};

/**
 * The badge only ever shows this for a step that isn't COMPLETED (see
 * isOnboardingComplete below), but the switch stays exhaustive so a new step
 * added to the enum fails to compile here instead of falling through silently.
 */
function onboardingStepLabel(step: OnboardingStep, t: AppTranslations): string {
  switch (step) {
    case OnboardingStep.LEARNING_PURPOSES:
      return t.account.onboardingStepLearningPurposes;
    case OnboardingStep.CERTIFICATE_TARGET:
      return t.account.onboardingStepCertificateTarget;
    case OnboardingStep.CURRENT_LEVEL:
      return t.account.currentLevelLabel;
    case OnboardingStep.LEARNING_GOAL:
      return t.account.onboardingStepLearningGoal;
    case OnboardingStep.TARGET_SKILLS:
      return t.account.targetSkillsLabel;
    case OnboardingStep.COMPLETED:
      return t.account.onboardingReady;
  }
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const genderLabel =
    profile.gender === "MALE"
      ? t.account.male
      : profile.gender === "FEMALE"
        ? t.account.female
        : profile.gender === "OTHER"
          ? t.account.otherGender
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
            <Box className={classes.onlineDot} title={t.account.activeNow} />
          </Box>

          {/* Chỉ LEARNER mới có onboarding - badge này báo đúng một việc đó,
              nên STAFF/ADMIN không có gì để báo. */}
          {profile.role === Role.LEARNER && (
            <Badge
              color={isOnboardingComplete ? "teal" : "orange"}
              variant="light"
              size="sm"
              // Never shrunk to "ĐÃ SẴN SÀNG ..." beside the avatar.
              style={{ flexShrink: 0 }}
              styles={{ label: { overflow: "visible" } }}
              leftSection={
                isOnboardingComplete ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <Sparkles size={12} />
                )
              }
            >
              {isOnboardingComplete
                ? t.account.onboardingReady
                : onboardingStepLabel(profile.onboardingStep, t)}
            </Badge>
          )}
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
            {/* The whole row goes to the address: a "verified" badge sat
                beside it, the same for every account, and cut the address
                itself short. */}
            <Text size="xs" c="ink.7" truncate title={profile.email}>
              {profile.email}
            </Text>
          </Group>

          {genderLabel && (
            <Group gap="xs" align="center" justify="space-between">
              <Text size="xs" c="ink.5">
                {t.account.gender}:
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
                {t.account.studentId}:
              </Text>
            </Group>
            <Group
              gap={4}
              align="center"
              className={classes.clickableId}
              onClick={handleCopyId}
              title={t.account.clickToCopyId}
            >
              <Text size="xs" fw={600} c="ink.7">
                {profile.id.slice(0, 8)}...
              </Text>
              <Copy size={12} className={classes.infoIcon} />
              {copied && (
                <Text size="xs" c="teal.7" fw={700}>
                  {t.common.copied}
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}
