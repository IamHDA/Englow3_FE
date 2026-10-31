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
  SegmentedControl,
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
import {
  parseReport,
  skillLabel,
  statusLabels,
  statusLabelsEn,
} from "../types";
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
  // "Chưa đọc" là một cách xem của cùng danh sách này, không phải một khối thứ
  // hai với thanh phân trang riêng giữa trang.
  const [view, setView] = useState<"all" | "unread">(
    initial.view === "unread" ? "unread" : "all",
  );
  const [page, setPage] = useState(
    Math.min(10000, Math.max(1, Number.parseInt(initial.page ?? "1", 10) || 1)),
  );
  const [term] = useDebouncedValue(title, 300);
  useEffect(() => {
    const params = new URLSearchParams();
    if (skill) params.set("skill", skill);
    if (status) params.set("status", status);
    if (title) params.set("title", title);
    if (view === "unread") params.set("view", "unread");
    if (page > 1) params.set("page", String(page));
    window.history.replaceState(
      null,
      "",
      `/study/assessments${params.size ? `?${params}` : ""}`,
    );
  }, [skill, status, title, view, page]);
  const query = useAssessmentHistoryQuery({
    variables: { skill, status, title: term || null, page: page - 1 },
    fetchPolicy: "cache-and-network",
  });
  const items = query.data?.assessmentHistory.items ?? [];
  const unreadQuery = useAssessmentNotificationsQuery({
    variables: { page: view === "unread" ? page - 1 : 0 },
    fetchPolicy: "cache-and-network",
  });
  const unread = unreadQuery.data?.assessmentNotifications;
  const unreadCount = unread?.totalItems ?? 0;
  const showingUnread = view === "unread";
  const totalPages = showingUnread
    ? (unread?.totalPages ?? 0)
    : (query.data?.assessmentHistory.totalPages ?? 0);

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
        <SegmentedControl
          value={view}
          onChange={(next) => {
            setView(next as "all" | "unread");
            setPage(1);
          }}
          data={[
            { value: "all", label: t("Tất cả bài", "All work") },
            {
              value: "unread",
              label:
                t("Chưa đọc", "Unread") +
                (unreadCount > 0 ? ` · ${unreadCount}` : ""),
            },
          ]}
          w="fit-content"
        />
        {showingUnread ? (
          <UnreadResults
            items={unread?.items ?? []}
            loading={unreadQuery.loading && !unread}
            error={Boolean(unreadQuery.error)}
            onRetry={() => void unreadQuery.refetch().catch(() => {})}
          />
        ) : (
          <>
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
                          {skillLabel(a.skill, isVi)} ·{" "}
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
          </>
        )}
        {totalPages > 1 && (
          <Pagination
            getControlProps={paginationControlProps(isVi)}
            value={page}
            onChange={setPage}
            total={totalPages}
          />
        )}
      </Stack>
    </Page>
  );
}
/** Gọn cho trang chủ: ba kết quả mới nhất chưa đọc, và lối sang danh sách đầy đủ. */
export function AssessmentNotifications() {
  const { isVi } = useLanguage();
  const query = useAssessmentNotificationsQuery({
    variables: { page: 0 },
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
          <Button
            component={Link}
            href="/study/assessments?view=unread"
            variant="subtle"
          >
            {isVi ? "Xem tất cả" : "View all"}
          </Button>
        </Group>
        {items.slice(0, 3).map((n) => (
          <Group key={n.attemptId} justify="space-between">
            <Text style={{ flex: 1, minWidth: 160 }}>
              {skillLabel(n.skill, isVi)} · {n.title}
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
      </Stack>
    </Card>
  );
}

/** Các kết quả chưa đọc, dựng cùng kiểu thẻ với lịch sử để hai cách xem trông như một danh sách. */
function UnreadResults({
  items,
  loading,
  error,
  onRetry,
}: {
  items: Array<{
    attemptId: string;
    title: string;
    skill: AssessmentSkill;
    version: number;
    assessedAt?: string | null;
  }>;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  if (loading) return <Loader />;
  if (error && !items.length)
    return (
      <Alert color="orange">
        {t(
          "Không tải được kết quả chưa đọc.",
          "Could not load unread results.",
        )}{" "}
        <Button variant="light" onClick={onRetry}>
          {t("Thử lại", "Retry")}
        </Button>
      </Alert>
    );
  if (!items.length)
    return (
      <Card withBorder>
        <Text>
          {t("Bạn đã đọc hết kết quả.", "You have read every result.")}
        </Text>
      </Card>
    );
  return (
    <Stack>
      {items.map((n) => (
        <Card key={n.attemptId} withBorder radius="lg">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{ flex: 1, minWidth: 180 }}>
              <Text fw={600}>{n.title}</Text>
              <Text size="sm" c="dimmed">
                {skillLabel(n.skill, isVi)}
                {n.assessedAt &&
                  ` · ${new Date(n.assessedAt).toLocaleString(
                    isVi ? "vi-VN" : "en-US",
                  )}`}
              </Text>
              <Group>
                <Badge variant="filled" color="blue">
                  {t("Chưa đọc", "Unread")}
                </Badge>
                <Badge variant="light">v{n.version}</Badge>
              </Group>
            </Stack>
            <Button
              component={Link}
              href={`/study/assessments/attempts/${n.attemptId}`}
              variant="light"
            >
              {t("Đọc kết quả", "Read result")}
            </Button>
          </Group>
        </Card>
      ))}
    </Stack>
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
              {skillLabel(a.skill, isVi)} · {a.task.title}
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
