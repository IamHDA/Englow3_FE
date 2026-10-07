"use client";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useAssessmentText } from "../hooks/useAssessmentText";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { PracticeAttempt } from "../types";
import { criterionLabels, parseReport } from "../types";
export function AssessmentReport({ attempt }: { attempt: PracticeAttempt }) {
  const { isVi } = useLanguage();
  const tx = useAssessmentText();
  const report = parseReport(attempt.report);
  if (!report)
    return (
      <Alert color="orange">
        {isVi
          ? "Kết quả chưa đầy đủ. Vui lòng tải lại hoặc liên hệ giáo viên."
          : "The result is incomplete. Reload or contact your teacher."}
      </Alert>
    );
  return (
    <Stack>
      <Card withBorder radius="lg" p="xl">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              {isVi ? "Điểm luyện tập ước lượng" : "Estimated practice score"}
            </Text>
            <Title order={2}>{report.overall.toFixed(1)} / 9</Title>
          </div>
          <Badge color={attempt.source === "HUMAN" ? "teal" : "indigo"}>
            {attempt.source === "HUMAN"
              ? isVi
                ? "Giáo viên đã chấm"
                : "Teacher assessed"
              : isVi
                ? "AI đánh giá"
                : "AI assessed"}
          </Badge>
        </Group>
        <Text mt="md">{report.summary}</Text>
        <Text size="xs" c="dimmed" mt="sm">
          {isVi
            ? "Đánh giá cho bài luyện tập này; không phải kết quả IELTS chính thức."
            : "An estimate for this practice response, not an official IELTS result."}
        </Text>
      </Card>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {report.criteria.map((c) => (
          <Card key={c.key} withBorder radius="md">
            <Group justify="space-between">
              <Text fw={600}>{tx(criterionLabels[c.key] ?? c.key)}</Text>
              <Badge size="lg">{c.score.toFixed(1)}</Badge>
            </Group>
            <Text size="sm" mt="sm" style={{ whiteSpace: "pre-wrap" }}>
              {c.feedback}
            </Text>
            {c.quote &&
              typeof c.quote === "string" &&
              attempt.answerText?.includes(c.quote) && (
                <Text
                  component="blockquote"
                  mt="sm"
                  style={{
                    borderLeft: "3px solid var(--mantine-color-blue-5)",
                    paddingLeft: 12,
                    marginLeft: 0,
                  }}
                >
                  {c.quote}
                </Text>
              )}
            {attempt.audioUrl &&
              typeof c.audioStart === "number" &&
              typeof c.audioEnd === "number" &&
              c.audioEnd > c.audioStart && (
                <Stack mt="sm" gap="xs">
                  <Text size="sm">
                    {isVi ? "Đoạn được nhận xét" : "Reviewed segment"}:{" "}
                    {c.audioStart}–{c.audioEnd}s
                  </Text>
                  <audio
                    controls
                    src={`${attempt.audioUrl}#t=${c.audioStart},${c.audioEnd}`}
                    style={{ width: "100%" }}
                  />
                </Stack>
              )}
          </Card>
        ))}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Card withBorder>
          <Text fw={700} mb="sm">
            {isVi ? "Điểm làm tốt" : "Strengths"}
          </Text>
          <List>
            {report.strengths.map((s, i) => (
              <List.Item key={i}>{s}</List.Item>
            ))}
          </List>
        </Card>
        <Card withBorder>
          <Text fw={700} mb="sm">
            {isVi ? "Bước cải thiện tiếp theo" : "Next improvements"}
          </Text>
          <List>
            {report.improvements.map((s, i) => (
              <List.Item key={i}>{s}</List.Item>
            ))}
          </List>
        </Card>
      </SimpleGrid>
      <Card withBorder>
        <Stack>
          <Title order={3}>
            {isVi ? "Luyện tiếp từ nhận xét" : "Practice from this feedback"}
          </Title>
          <Text>
            {isVi
              ? "Ưu tiên tiêu chí cần cải thiện: "
              : "Start with the criterion needing most improvement: "}
            {tx(
              criterionLabels[
                [...report.criteria].sort((a, b) => a.score - b.score)[0].key
              ],
            )}
            .
          </Text>
          <Group>
            <Button
              component={Link}
              href={
                attempt.skill === "SPEAKING" &&
                [...report.criteria].sort((a, b) => a.score - b.score)[0]
                  .key === "PRONUNCIATION"
                  ? "/study/pronunciation"
                  : `/study/${attempt.skill === "WRITING" ? "writing" : "speaking"}`
              }
            >
              {isVi ? "Chọn bài luyện tiếp" : "Choose your next practice"}
            </Button>
          </Group>
        </Stack>
      </Card>
      {attempt.recognizedText && (
        <Card withBorder>
          <Text fw={700}>
            {isVi ? "Bản nhận dạng giọng nói" : "Recognized transcript"}
          </Text>
          <Text mt="xs" style={{ whiteSpace: "pre-wrap" }}>
            {attempt.recognizedText}
          </Text>
        </Card>
      )}
      {attempt.task.sampleAnswer && (
        <Card withBorder>
          <Text fw={700}>{isVi ? "Bài tham khảo" : "Reference answer"}</Text>
          <Text mt="xs" style={{ whiteSpace: "pre-wrap" }}>
            {attempt.task.sampleAnswer}
          </Text>
        </Card>
      )}
    </Stack>
  );
}
