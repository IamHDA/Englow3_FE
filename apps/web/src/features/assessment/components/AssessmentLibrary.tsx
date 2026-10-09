"use client";

import { paginationControlProps } from "@/shared/a11y/paginationControls";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { AssessmentSkill } from "@/lib/graphql/generated";
import { useAssessmentCatalogQuery } from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { taskTypeLabel } from "../types";
import { instructionsPreview } from "./TaskInstructions";
export function AssessmentLibrary({ skill }: { skill: AssessmentSkill }) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const [page, setPage] = useState(1);
  const query = useAssessmentCatalogQuery({
    variables: { skill, page: page - 1 },
    fetchPolicy: "cache-and-network",
  });
  const automatic =
    skill === "WRITING"
      ? query.data?.assessmentCapabilities.automaticWriting
      : query.data?.assessmentCapabilities.automaticSpeaking;
  return (
    <Page>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={1}>
              {t("Luyện ", "Practice ")}
              {skill === "WRITING" ? "Writing" : "Speaking"}
            </Title>
            <Text c="dimmed">
              {skill === "SPEAKING"
                ? t(
                    "Trả lời đề bằng lời của bạn. Phát âm — đọc theo mẫu có thư viện riêng.",
                    "Respond in your own words. Read-aloud pronunciation has its own library.",
                  )
                : t(
                    "Viết theo đề, nhận phản hồi và chọn bước luyện tiếp.",
                    "Write a response, review feedback and plan your next practice.",
                  )}
            </Text>
          </div>
          <Button component={Link} href="/study/assessments" variant="light">
            {t("Bài của tôi và kết quả mới", "My work and new results")}
          </Button>
        </Group>
        {query.data && !automatic && (
          <Alert color="blue">
            {t(
              "Bài nộp được giáo viên chấm. Xem trạng thái và kết quả ở Bài của tôi.",
              "A teacher reviews your submission. Track your status and results in My work.",
            )}
          </Alert>
        )}
        {query.error && (
          <LoadErrorState
            error={query.error}
            thing={{ vi: "đề luyện tập", en: "practice prompts" }}
            back={{ href: "/", label: t("Trang chủ", "Home") }}
            onRetry={() => void query.refetch().catch(() => {})}
          />
        )}
        {query.loading && !query.data ? (
          <Loader />
        ) : query.data?.assessmentTasks.items.length ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {query.data.assessmentTasks.items.map((task) => (
              <Card key={task.id} withBorder radius="lg" p="lg">
                <Stack h="100%">
                  <Badge w="fit-content">{taskTypeLabel(task.taskType)}</Badge>
                  <Title order={3}>{task.title}</Title>
                  <Text size="sm" lineClamp={4}>
                    {instructionsPreview(task.instructions)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {Math.round(task.timeLimitSeconds / 60)}{" "}
                    {t("phút gợi ý", "suggested minutes")}
                    {task.minimumWords > 0
                      ? ` · ${task.minimumWords} ${t("từ khuyến nghị", "recommended words")}`
                      : ""}
                  </Text>
                  <Button
                    mt="auto"
                    component={Link}
                    href={`/study/${skill === "WRITING" ? "writing" : "speaking"}/${task.id}`}
                  >
                    {t("Xem đề và bắt đầu", "Open prompt")}
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          !query.error && (
            <Card withBorder>
              <Stack>
                <Text>
                  {t(
                    "Chưa có đề đã xuất bản cho kỹ năng này.",
                    "There are no published prompts for this skill yet.",
                  )}
                </Text>
                <Group>
                  <Button
                    component={Link}
                    href={`/study/${skill === "WRITING" ? "speaking" : "writing"}`}
                    variant="light"
                  >
                    {t("Luyện kỹ năng khác", "Try another skill")}
                  </Button>
                  {skill === "SPEAKING" && (
                    <Button
                      component={Link}
                      href="/study/pronunciation"
                      variant="default"
                    >
                      {t(
                        "Phát âm — đọc theo mẫu",
                        "Pronunciation — read aloud",
                      )}
                    </Button>
                  )}
                </Group>
              </Stack>
            </Card>
          )
        )}
        {(query.data?.assessmentTasks.totalPages ?? 0) > 1 && (
          <Pagination
            getControlProps={paginationControlProps(isVi)}
            value={page}
            onChange={setPage}
            total={query.data!.assessmentTasks.totalPages}
          />
        )}
      </Stack>
    </Page>
  );
}
