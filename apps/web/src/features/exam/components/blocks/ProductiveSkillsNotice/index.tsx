"use client";

import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Mic, PenLine } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

/**
 * Shown when a learner looks for Writing or Speaking among the mock exams.
 * Those skills are not multiple choice: they are written or recorded and
 * graded against a rubric, in their own module - so the library points there
 * instead of showing an empty list or a paper that turns an essay into a quiz.
 */
export function ProductiveSkillsNotice() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <Paper withBorder radius="lg" p="lg" bg="navy.0">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={2} size="h4" c="navy.9">
            {tr(
              "Writing và Speaking luyện ở mục riêng",
              "Writing and Speaking have their own practice",
            )}
          </Title>
          <Text size="sm" c="ink.7">
            {tr(
              "Bạn viết bài luận hoặc ghi âm câu trả lời, rồi được chấm theo rubric 4 tiêu chí (thang 0–9) kèm nhận xét chi tiết. Đề thi thử ở đây chỉ gồm Listening và Reading.",
              "You write an essay or record your answer, then it is graded against a four-criterion rubric (0–9) with detailed feedback. Mock exams here cover Listening and Reading only.",
            )}
          </Text>
        </Stack>
        <Group gap="sm">
          <Button
            component={Link}
            href="/study/writing"
            leftSection={<PenLine size={16} aria-hidden="true" />}
          >
            {tr("Luyện Writing", "Practise Writing")}
          </Button>
          <Button
            component={Link}
            href="/study/speaking"
            variant="default"
            leftSection={<Mic size={16} aria-hidden="true" />}
          >
            {tr("Luyện Speaking", "Practise Speaking")}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
