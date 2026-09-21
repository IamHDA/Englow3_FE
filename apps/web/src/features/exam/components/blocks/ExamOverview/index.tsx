"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  Clock,
  HelpCircle,
  Award,
  BookOpen,
  ArrowLeft,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { ExamSummary } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";
import classes from "./ExamOverview.module.css";

export interface ExamOverviewProps {
  /**
   * Bản tóm tắt đề, không phải đề đầy đủ: đề chỉ về sau khi mở lượt thi, mà
   * mở lượt là backend bắt đầu tính giờ - màn giới thiệu phải đọc được trước
   * khi đồng hồ chạy.
   */
  exam: ExamSummary;
  starting: boolean;
  onStart: () => void;
}

export function ExamOverview({ exam, starting, onStart }: ExamOverviewProps) {
  const { t } = useLanguage();

  const durationMinutes = Math.round(exam.durationSeconds / 60);

  return (
    <Box py="xl" px={{ base: "md", md: "xl" }} maw={1100} mx="auto">
      {/* Breadcrumb Navigation */}
      <Flex align="center" gap="xs" mb="lg">
        <Text component={Link} href="/exams" className={classes.breadcrumbLink}>
          <ArrowLeft size={16} />
          {t.exam.backToLibrary}
        </Text>
        <Text c="ink.3" size="sm">
          /
        </Text>
        <Text c="navy.9" size="sm" fw={600}>
          {exam.title}
        </Text>
      </Flex>

      {/* Main Hero Card */}
      <Card
        radius="lg"
        p={{ base: "lg", md: "xl" }}
        withBorder
        className={classes.heroCard}
      >
        <Stack gap="lg">
          {/* Header Badges */}
          <Group justify="space-between" align="flex-start">
            <Stack gap={6}>
              <Group gap="xs">
                {exam.certificateType && (
                  <Badge color="navy" variant="light" size="md" radius="sm">
                    {exam.certificateType}{" "}
                    {exam.certificateVariant ? exam.certificateVariant : ""}
                  </Badge>
                )}
                {exam.targetLevel && (
                  <Badge color="orange" variant="light" size="md" radius="sm">
                    Level {exam.targetLevel}
                  </Badge>
                )}
              </Group>
              <Title
                order={1}
                size="h2"
                c="navy.9"
                lh={1.2}
                style={{ letterSpacing: "-0.02em" }}
              >
                {exam.title}
              </Title>
              <Text c="ink.6" size="sm">
                {exam.description || t.exam.defaultDescription}
              </Text>
            </Stack>
          </Group>

          {/* Key Metrics Grid */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <Card p="md" radius="md" className={classes.metricCard}>
              <Group gap="xs">
                <ThemeIcon size="md" radius="xl" color="navy.1" c="navy.9">
                  <Clock size={18} />
                </ThemeIcon>
                <Stack gap={1}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {t.exam.examTimeLabel}
                  </Text>
                  <Text size="md" fw={700} c="navy.9">
                    {durationMinutes} {t.exam.minutesUnit}
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Card p="md" radius="md" className={classes.metricCard}>
              <Group gap="xs">
                <ThemeIcon size="md" radius="xl" color="navy.1" c="navy.9">
                  <HelpCircle size={18} />
                </ThemeIcon>
                <Stack gap={1}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {t.exam.questionQuantityLabel}
                  </Text>
                  <Text size="md" fw={700} c="navy.9">
                    {exam.questionCount} {t.exam.questionsUnitFull}
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Card p="md" radius="md" className={classes.metricCard}>
              <Group gap="xs">
                <ThemeIcon size="md" radius="xl" color="navy.1" c="navy.9">
                  <Award size={18} />
                </ThemeIcon>
                <Stack gap={1}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {t.exam.maxScoreScaleLabel}
                  </Text>
                  <Text size="md" fw={700} c="navy.9">
                    {exam.maxRawScore} {t.exam.pointsUnit}
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Card p="md" radius="md" className={classes.metricCard}>
              <Group gap="xs">
                <ThemeIcon size="md" radius="xl" color="navy.1" c="navy.9">
                  <BookOpen size={18} />
                </ThemeIcon>
                <Stack gap={1}>
                  <Text size="xs" c="ink.5" fw={600}>
                    {t.exam.passScoreLabel}
                  </Text>
                  <Text size="md" fw={700} c="navy.9">
                    {exam.passScore === null
                      ? t.exam.passScoreUnset
                      : `${exam.passScore} ${t.exam.pointsUnit}`}
                  </Text>
                </Stack>
              </Group>
            </Card>
          </SimpleGrid>

          {/* Guidelines Box */}
          <Paper
            p="md"
            radius="md"
            withBorder
            className={classes.guidelinesBox}
          >
            <Group gap="xs" mb="xs">
              <AlertCircle size={18} color="var(--mantine-color-navy-9)" />
              <Text fw={700} size="sm" c="navy.9">
                {t.exam.rulesTitle}
              </Text>
            </Group>
            <Stack gap={8}>
              <Flex gap="xs" align="flex-start">
                <CheckCircle2
                  size={16}
                  color="var(--mantine-color-navy-9)"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Text size="xs" c="ink.6">
                  {t.exam.rule1}
                </Text>
              </Flex>
              <Flex gap="xs" align="flex-start">
                <CheckCircle2
                  size={16}
                  color="var(--mantine-color-navy-9)"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Text size="xs" c="ink.6">
                  {t.exam.rule2}
                </Text>
              </Flex>
              <Flex gap="xs" align="flex-start">
                <CheckCircle2
                  size={16}
                  color="var(--mantine-color-navy-9)"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Text size="xs" c="ink.6">
                  {t.exam.rule3}
                </Text>
              </Flex>
              <Flex gap="xs" align="flex-start">
                <CheckCircle2
                  size={16}
                  color="var(--mantine-color-navy-9)"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Text size="xs" c="ink.6">
                  {t.exam.rule4}
                </Text>
              </Flex>
            </Stack>
          </Paper>

          {/* Action CTA */}
          <Group justify="flex-end" pt="sm">
            <Button
              component={Link}
              href="/exams"
              variant="default"
              radius="xl"
              size="md"
            >
              {t.exam.returnToLibrary}
            </Button>
            <Button
              onClick={onStart}
              loading={starting}
              radius="xl"
              size="md"
              rightSection={<Play size={16} />}
              className={classes.startBtn}
            >
              {t.exam.startExam}
            </Button>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
}
