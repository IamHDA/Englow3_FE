"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";

import { useOnboarding } from "@/features/onboarding";
import { skillLabel } from "../../../constants/profile";
import type { AccountProfile } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./ProfileLearningTab.module.css";

type ProfileLearningTabProps = {
  profile: NonNullable<AccountProfile>;
};

export function ProfileLearningTab({ profile }: ProfileLearningTabProps) {
  const { open } = useOnboarding();
  const { t } = useLanguage();
  const state = profile.onboardingState;

  const certificate = state?.targetCertificateType ?? t.account.notConfigured;
  const targetScore =
    state?.targetScore != null
      ? String(state.targetScore)
      : t.account.targetScoreEmpty;
  const currentLevel = state?.currentLevel ?? t.account.levelNotAssessed;
  const targetDate = state?.targetDate ? String(state.targetDate) : null;
  const targetSkills = state?.targetSkills ?? [];

  return (
    <Stack gap="lg" className={classes.tabContainer}>
      <Paper radius="lg" withBorder p="xl" className={classes.paper}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Stack gap={4}>
              <Title order={3} fz={20} fw={700} c="ink.9">
                {t.account.learningRoadmapTitle}
              </Title>
            </Stack>

            <Button
              variant="light"
              color="navy"
              radius="md"
              leftSection={<Sparkles size={16} />}
              onClick={open}
            >
              {t.account.updateLearningGoalsButton}
            </Button>
          </Group>

          <Divider />

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {/* Card 1: Certificate */}
            <Paper
              radius="md"
              withBorder
              p="md"
              className={classes.highlightBox}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon
                  color="orange.5"
                  variant="light"
                  size="lg"
                  radius="md"
                >
                  <Award size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {t.account.targetCertificateLabel}
                  </Text>
                  <Text size="md" fw={700} c="ink.9">
                    {certificate}
                  </Text>
                </Stack>
              </Group>
              <Badge color="orange" variant="light" size="sm">
                {t.account.goalPrefix}: {targetScore}
              </Badge>
            </Paper>

            {/* Card 2: CEFR Level */}
            <Paper
              radius="md"
              withBorder
              p="md"
              className={classes.highlightBox}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon color="teal.6" variant="light" size="lg" radius="md">
                  <BookOpen size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {t.account.currentLevelLabel}
                  </Text>
                  <Text size="md" fw={700} c="ink.9">
                    CEFR {currentLevel}
                  </Text>
                </Stack>
              </Group>
              <Badge color="teal" variant="light" size="sm">
                {t.account.cefrEvaluationBadge}
              </Badge>
            </Paper>

            {/* Card 3: Target Date */}
            <Paper
              radius="md"
              withBorder
              p="md"
              className={classes.highlightBox}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon color="blue.6" variant="light" size="lg" radius="md">
                  <Calendar size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {t.account.targetDeadlineLabel}
                  </Text>
                  <Text size="md" fw={700} c="ink.9">
                    {targetDate ?? t.account.flexibleDeadline}
                  </Text>
                </Stack>
              </Group>
              <Badge color="blue" variant="light" size="sm">
                {t.account.adaptiveScheduleBadge}
              </Badge>
            </Paper>
          </SimpleGrid>

          {/* Target Skills Section */}
          <Stack gap="sm">
            <Group gap="xs" align="center">
              <GraduationCap size={18} className={classes.sectionIcon} />
              <Title order={4} fz={15} fw={700} c="ink.8">
                {t.account.prioritySkillsTitle}
              </Title>
            </Group>

            {targetSkills.length > 0 ? (
              <Group gap="sm" wrap="wrap">
                {targetSkills.map((skill) => (
                  <Paper
                    key={skill}
                    radius="md"
                    withBorder
                    px="md"
                    py="xs"
                    className={classes.skillPill}
                  >
                    <Group gap="xs" align="center">
                      <Target size={14} className={classes.skillIcon} />
                      <Text size="sm" fw={600} c="ink.9">
                        {skillLabel(skill, t)}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Group>
            ) : (
              <Text size="sm" c="ink.5">
                {t.account.noSkillsSelectedHint}
              </Text>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
