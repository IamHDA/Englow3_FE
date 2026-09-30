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
import { Award, BookOpen, ChevronRight, Sparkles, Target } from "lucide-react";

import { useOnboarding } from "@/features/onboarding";
import { skillLabel } from "../../../constants/profile";
import type { AccountProfile } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./ProfileTargetCard.module.css";

type ProfileTargetCardProps = {
  profile: NonNullable<AccountProfile>;
};

export function ProfileTargetCard({ profile }: ProfileTargetCardProps) {
  const { open } = useOnboarding();
  const { t } = useLanguage();
  const state = profile.onboardingState;

  const certificate =
    state?.targetCertificateType ?? t.account.certificateNotSelected;
  const targetScore = state?.targetScore ?? "--";
  const currentLevel = state?.currentLevel ?? t.account.levelNotAssessed;
  const targetSkills = state?.targetSkills ?? [];

  return (
    <Paper radius="lg" withBorder p="lg" className={classes.cardPaper}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon color="orange.5" variant="light" size="md" radius="md">
              <Target size={16} />
            </ThemeIcon>
            <Title order={3} fz={16} fw={700} c="ink.9">
              {t.account.learningTargetsCardTitle}
            </Title>
          </Group>

          <Badge color="orange" variant="outline" size="xs">
            {certificate}
          </Badge>
        </Group>

        <Divider />

        <SimpleGrid cols={2} spacing="xs">
          <Paper p="xs" radius="md" withBorder className={classes.statBox}>
            <Group gap={6} align="center">
              <Award size={14} className={classes.statIcon} />
              <Text size="xs" c="ink.5">
                {t.account.targetScoreLabel}
              </Text>
            </Group>
            <Text size="sm" fw={800} c="navy.9" mt={2}>
              {targetScore}
            </Text>
          </Paper>

          <Paper p="xs" radius="md" withBorder className={classes.statBox}>
            <Group gap={6} align="center">
              <BookOpen size={14} className={classes.statIcon} />
              <Text size="xs" c="ink.5">
                {t.account.currentLevelLabel}
              </Text>
            </Group>
            <Text size="sm" fw={800} c="teal.8" mt={2}>
              {currentLevel}
            </Text>
          </Paper>
        </SimpleGrid>

        {targetSkills.length > 0 && (
          <Stack gap={6}>
            <Text size="xs" fw={600} c="ink.6">
              {t.account.targetSkillsLabel}:
            </Text>
            <Group gap={6} wrap="wrap">
              {targetSkills.map((skill) => (
                <Badge
                  key={skill}
                  color="navy"
                  variant="subtle"
                  size="sm"
                  radius="sm"
                  leftSection={<Sparkles size={10} />}
                >
                  {skillLabel(skill, t)}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}

        <Button
          variant="light"
          color="navy"
          size="xs"
          radius="md"
          fullWidth
          rightSection={<ChevronRight size={14} />}
          onClick={open}
          className={classes.tuneButton}
        >
          {t.account.updateLearningGoalsButton}
        </Button>
      </Stack>
    </Paper>
  );
}
