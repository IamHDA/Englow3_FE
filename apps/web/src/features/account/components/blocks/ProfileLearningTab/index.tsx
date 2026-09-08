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
import { SKILL_LABELS } from "../../../constants/profile";
import type { AccountProfile } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./ProfileLearningTab.module.css";

type ProfileLearningTabProps = {
  profile: NonNullable<AccountProfile>;
};

export function ProfileLearningTab({ profile }: ProfileLearningTabProps) {
  const { open } = useOnboarding();
  const { isVi } = useLanguage();
  const state = profile.onboardingState;

  const certificate = state?.targetCertificateType ?? (isVi ? "Chưa thiết lập" : "Not configured");
  const targetScore = state?.targetScore != null ? String(state.targetScore) : (isVi ? "Chưa có" : "None");
  const currentLevel = state?.currentLevel ?? (isVi ? "Chưa đánh giá" : "Not assessed");
  const targetDate = state?.targetDate ? String(state.targetDate) : null;
  const targetSkills = state?.targetSkills ?? [];

  return (
    <Stack gap="lg" className={classes.tabContainer}>
      <Paper radius="lg" withBorder p="xl" className={classes.paper}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Stack gap={4}>
              <Title order={3} fz={20} fw={700} c="ink.9">
                {isVi ? "Lộ trình & Mục tiêu học tập" : "Learning Roadmap & Targets"}
              </Title>
              <Text size="sm" c="ink.6">
                {isVi
                  ? "Các mục tiêu được AI sử dụng để đề xuất bài tập, đề thi thử và chủ đề luyện nói phù hợp"
                  : "Goals used by AI to recommend tailored exercises, mock tests, and speaking topics"}
              </Text>
            </Stack>

            <Button
              variant="light"
              color="navy"
              radius="md"
              leftSection={<Sparkles size={16} />}
              onClick={open}
            >
              {isVi ? "Thiết lập lại mục tiêu" : "Update Learning Goals"}
            </Button>
          </Group>

          <Divider />

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {/* Card 1: Certificate */}
            <Paper radius="md" withBorder p="md" className={classes.highlightBox}>
              <Group gap="xs" mb="xs">
                <ThemeIcon color="orange.5" variant="light" size="lg" radius="md">
                  <Award size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {isVi ? "Chứng chỉ hướng tới" : "Target Certificate"}
                  </Text>
                  <Text size="md" fw={800} c="ink.9">
                    {certificate}
                  </Text>
                </Stack>
              </Group>
              <Badge color="orange" variant="light" size="sm">
                {isVi ? `Mục tiêu: ${targetScore}` : `Goal: ${targetScore}`}
              </Badge>
            </Paper>

            {/* Card 2: CEFR Level */}
            <Paper radius="md" withBorder p="md" className={classes.highlightBox}>
              <Group gap="xs" mb="xs">
                <ThemeIcon color="teal.6" variant="light" size="lg" radius="md">
                  <BookOpen size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {isVi ? "Trình độ hiện tại" : "Current Proficiency"}
                  </Text>
                  <Text size="md" fw={800} c="ink.9">
                    CEFR {currentLevel}
                  </Text>
                </Stack>
              </Group>
              <Badge color="teal" variant="light" size="sm">
                {isVi ? "Đánh giá năng lực" : "CEFR Evaluation"}
              </Badge>
            </Paper>

            {/* Card 3: Target Date */}
            <Paper radius="md" withBorder p="md" className={classes.highlightBox}>
              <Group gap="xs" mb="xs">
                <ThemeIcon color="blue.6" variant="light" size="lg" radius="md">
                  <Calendar size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {isVi ? "Thời hạn mục tiêu" : "Target Deadline"}
                  </Text>
                  <Text size="md" fw={800} c="ink.9">
                    {targetDate ?? (isVi ? "Linh hoạt" : "Flexible")}
                  </Text>
                </Stack>
              </Group>
              <Badge color="blue" variant="light" size="sm">
                {isVi ? "Lộ trình thích ứng" : "Adaptive Schedule"}
              </Badge>
            </Paper>
          </SimpleGrid>

          {/* Target Skills Section */}
          <Stack gap="sm">
            <Group gap="xs" align="center">
              <GraduationCap size={18} className={classes.sectionIcon} />
              <Title order={4} fz={15} fw={700} c="ink.8">
                {isVi ? "Kỹ năng tập trung rèn luyện" : "Priority Focus Skills"}
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
                        {isVi ? SKILL_LABELS[skill] ?? skill : skill}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Group>
            ) : (
              <Text size="sm" c="ink.5">
                {isVi
                  ? 'Chưa chọn kỹ năng cụ thể. Bạn có thể bấm nút "Thiết lập lại mục tiêu" để chọn.'
                  : 'No specific skills selected yet. Click "Update Learning Goals" to configure.'}
              </Text>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
