"use client";

import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MOCK_MISTAKE_REVIEW_ITEMS } from "../../../constants/dictationData";
import { DictationMistakeQueue } from "../../blocks/DictationMistakeQueue";

interface DictationReviewViewProps {
  lessonTitle: string;
}

export function DictationReviewView({ lessonTitle }: DictationReviewViewProps) {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        {/* Top Navigation */}
        <Paper radius="md" p="md" withBorder bg="white">
          <Group justify="space-between" align="center">
            <Button
              component={Link}
              href="/study/dictation"
              variant="subtle"
              color="navy"
              size="xs"
              radius="md"
              leftSection={<ArrowLeft size={14} />}
            >
              Về thư viện bài học
            </Button>

            <Title order={2} size="h5" fw={700} c="ink.9">
              Ôn tập câu sai — {lessonTitle}
            </Title>
          </Group>
        </Paper>

        <DictationMistakeQueue
          mistakes={MOCK_MISTAKE_REVIEW_ITEMS}
          lessonTitle={lessonTitle}
        />
      </Stack>
    </Container>
  );
}
