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
  Progress,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AssessmentAttemptStatus,
  AssessmentSkill,
} from "@/lib/graphql/generated";
import {
  useAssessmentHistoryQuery,
  useAssessmentNotificationsQuery,
} from "@/lib/graphql/generated/hooks";
import { Page } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { parseReport, statusLabels, statusLabelsEn } from "../types";
export function AssessmentHistory({
  initial = {},
}: {
  initial?: Record<string, string>;
}) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const [skill, setSkill] = useState<AssessmentSkill | null>(
    Object.values(AssessmentSkill).includes(initial.skill as AssessmentSkill)
      ? (initial.skill as AssessmentSkill)
      : null,
  );
  const [status, setStatus] = useState<AssessmentAttemptStatus | null>(
    Object.values(AssessmentAttemptStatus).includes(
      initial.status as AssessmentAttemptStatus,
    )
      ? (initial.status as AssessmentAttemptStatus)
      : null,
  );
  const [title, setTitle] = useState(initial.title ?? "");
  const [page, setPage] = useState(
    Math.min(10000, Math.max(1, Number.parseInt(initial.page ?? "1", 10) || 1)),
  );
  const [term] = useDebouncedValue(title, 300);
  useEffect(() => {
    const params = new URLSearchParams();
    if (skill) params.set("skill", skill);
    if (status) params.set("status", status);
    if (title) params.set("title", title);
    if (page > 1) params.set("page", String(page));
    window.history.replaceState(
      null,
      "",
      `/study/assessments${params.size ? `?${params}` : ""}`,
    );
  }, [skill, status, title, page]);
  const query = useAssessmentHistoryQuery({
    variables: { skill, status, title: term || null, page: page - 1 },
    fetchPolicy: "cache-and-network",
  });
  const items = query.data?.assessmentHistory.items ?? [];
  const completed = items.filter(
    (a) => a.status === "COMPLETED" && parseReport(a.report),
  );
  return (
    <Page>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={1}>{t("Bài của tôi", "My work")}</Title>
            <Text c="dimmed">
              {t(
                "Tiếp tục nháp, theo dõi bài chờ chấm và xem kết quả Writing/Speaking.",
                "Resume drafts, track reviews and read Writing/Speaking results.",
              )}
            </Text>
          </div>
          <Group>
            <Button component={Link} href="/study/writing" variant="light">
              Writing
            </Button>
            <Button component={Link} href="/study/speaking" variant="light">
              Speaking
            </Button>
          </Group>
        </Group>
        <AssessmentNotifications full />
        <Card withBorder>
          <Group align="flex-end">
            <TextInput
              style={{ flex: 1, minWidth: 200 }}
              label={t("Tìm theo đề", "Search prompts")}
              value={title}
              onChange={(e) => {
                setTitle(e.currentTarget.value);
                setPage(1);
              }}
            />
            <Select
              label={t("Kỹ năng", "Skill")}
              data={["WRITING", "SPEAKING"]}
              clearable
              value={skill}
              onChange={(v) => {
                setSkill(v as AssessmentSkill | null);
                setPage(1);
              }}
            />
            <Select
              label={t("Trạng thái", "Status")}
              clearable
              data={Object.values(AssessmentAttemptStatus).map((value) => ({
                value,
                label: (isVi ? statusLabels : statusLabelsEn)[value],
              }))}
              value={status}
              onChange={(v) => {
                setStatus(v as AssessmentAttemptStatus | null);
                setPage(1);
              }}
            />
          </Group>
        </Card>
        {query.error && (
          <Alert color="orange">
            {t(
              "Không cập nhật được danh sách.",
              "Could not refresh your work.",
            )}{" "}
            <Button
              variant="light"
              onClick={() => void query.refetch().catch(() => {})}
            >
              {t("Thử lại", "Retry")}
            </Button>
          </Alert>
        )}
        {query.loading && !query.data ? (
          <Loader />
        ) : items.length ? (
          <Stack>
            {items.map((a) => (
              <Card key={a.id} withBorder radius="lg">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} style={{ flex: 1, minWidth: 180 }}>
                    <Text fw={600}>{a.task.title}</Text>
                    <Text size="sm" c="dimmed">
                      {a.skill} ·{" "}
                      {new Date(a.createdAt).toLocaleString(
                        isVi ? "vi-VN" : "en-US",
                      )}
                    </Text>
                    <Group>
                      <Badge variant="light">
                        {(isVi ? statusLabels : statusLabelsEn)[a.status]}
                      </Badge>
                      {a.report && (
                        <Text fw={700}>
                          {parseReport(a.report)?.overall.toFixed(1)} / 9
                        </Text>
                      )}
                    </Group>
                  </Stack>
                  <Button
                    component={Link}
                    href={`/study/assessments/attempts/${a.id}`}
                    variant={a.status === "DRAFT" ? "filled" : "light"}
                  >
                    {a.status === "DRAFT"
                      ? t("Tiếp tục", "Resume")
                      : a.status === "COMPLETED"
                        ? t("Xem kết quả", "Read result")
                        : t("Xem trạng thái", "View status")}
                  </Button>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          !query.error && (
            <Card withBorder>
              <Stack>
                <Text>
                  {skill || status || title
                    ? t(
                        "Không có bài khớp bộ lọc.",
                        "No work matches these filters.",
                      )
                    : t(
                        "Bạn chưa có bài luyện. Chọn đề Writing hoặc Speaking để bắt đầu.",
                        "Choose a Writing or Speaking prompt to begin.",
                      )}
                </Text>
                {(skill || status || title) && (
                  <Button
                    variant="light"
                    onClick={() => {
                      setSkill(null);
                      setStatus(null);
                      setTitle("");
                      setPage(1);
                    }}
                  >
                    {t("Xóa bộ lọc", "Clear filters")}
                  </Button>
                )}
              </Stack>
            </Card>
          )
        )}
        {(query.data?.assessmentHistory.totalPages ?? 0) > 1 && (
          <Pagination
            getControlProps={paginationControlProps(isVi)}
            value={page}
            onChange={setPage}
            total={query.data!.assessmentHistory.totalPages}
          />
        )}
        {completed.length > 0 && (
          <Card withBorder>
            <Stack>
              <Title order={2}>
                {t(
                  "Điểm các bài đang hiển thị",
                  "Scores for the displayed work",
                )}
              </Title>
              <Text size="sm" c="dimmed">
                {t(
                  "Theo thứ tự thời gian. Các đề và người chấm có thể khác nhau; dùng nhận xét từng tiêu chí để chọn bước luyện tiếp.",
                  "In chronological order. Tasks and reviewers may differ; use criterion feedback to guide your next practice.",
                )}
              </Text>
              {[...completed].reverse().map((a) => (
                <Stack key={a.id} gap={4}>
                  <Group justify="space-between">
                    <Text size="sm">{a.task.title}</Text>
                    <Text fw={600}>
                      {parseReport(a.report)!.overall.toFixed(1)}/9
                    </Text>
                  </Group>
                  <Progress
                    value={(parseReport(a.report)!.overall / 9) * 100}
                    aria-label={a.task.title}
                  />
                </Stack>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Page>
  );
}
export function AssessmentNotifications({ full = false }: { full?: boolean }) {
  const { isVi } = useLanguage();
  const [page, setPage] = useState(1);
  const query = useAssessmentNotificationsQuery({
    variables: { page: page - 1 },
    fetchPolicy: "cache-and-network",
  });
  const items = query.data?.assessmentNotifications.items ?? [];
  if (!items.length)
    return query.error ? (
      <Alert color="orange">
        {isVi
          ? "Không tải được thông báo kết quả."
          : "Could not load result notifications."}{" "}
        <Button
          variant="subtle"
          onClick={() => void query.refetch().catch(() => {})}
        >
          {isVi ? "Thử lại" : "Retry"}
        </Button>
      </Alert>
    ) : null;
  return (
    <Card withBorder radius="lg" bg="var(--mantine-color-blue-0)">
      <Stack>
        <Group justify="space-between">
          <Title order={3}>
            {isVi ? "Kết quả chưa đọc" : "Unread results"} ·{" "}
            {query.data!.assessmentNotifications.totalItems}
          </Title>
          {!full && (
            <Button component={Link} href="/study/assessments" variant="subtle">
              {isVi ? "Xem tất cả" : "View all"}
            </Button>
          )}
        </Group>
        {(full ? items : items.slice(0, 3)).map((n) => (
          <Group key={n.attemptId} justify="space-between">
            <Text style={{ flex: 1, minWidth: 160 }}>
              {n.skill} · {n.title}
            </Text>
            <Badge variant="light">v{n.version}</Badge>
            <Button
              component={Link}
              variant="light"
              href={`/study/assessments/attempts/${n.attemptId}`}
            >
              {isVi ? "Đọc kết quả" : "Read result"}
            </Button>
          </Group>
        ))}
        {full && query.data!.assessmentNotifications.totalPages > 1 && (
          <Pagination
            getControlProps={paginationControlProps(isVi)}
            value={page}
            total={query.data!.assessmentNotifications.totalPages}
            onChange={setPage}
          />
        )}
      </Stack>
    </Card>
  );
}
export function AssessmentResumeCard() {
  const { isVi } = useLanguage();
  const query = useAssessmentHistoryQuery({
    variables: { status: AssessmentAttemptStatus.DRAFT, page: 0 },
    fetchPolicy: "cache-and-network",
  });
  const drafts = query.data?.assessmentHistory.items ?? [];
  if (!drafts.length) return null;
  return (
    <Card withBorder radius="lg">
      <Stack>
        <Group justify="space-between">
          <Title order={3}>
            {isVi ? "Tiếp tục bản nháp" : "Resume your drafts"}
          </Title>
          <Badge variant="light">
            {query.data!.assessmentHistory.totalItems}
          </Badge>
        </Group>
        {drafts.slice(0, 2).map((a) => (
          <Group key={a.id} justify="space-between">
            <Text style={{ flex: 1, minWidth: 160 }}>
              {a.skill} · {a.task.title}
            </Text>
            <Button
              component={Link}
              href={`/study/assessments/attempts/${a.id}`}
              variant="light"
            >
              {isVi ? "Tiếp tục" : "Resume"}
            </Button>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}
