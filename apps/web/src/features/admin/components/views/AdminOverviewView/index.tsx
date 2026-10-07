"use client";

import {
  Alert,
  Anchor,
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { OVERVIEW_KINDS } from "@/features/admin/constants/contentKinds";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useAdminOverviewQuery } from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { AssessmentWorkloadPanel } from "../StaffHomeView";

type StatCardProps = {
  label: string;
  value: number;
  locale: string;
  hint?: string;
  icon: LucideIcon;
  color: string;
};

function StatCard({
  label,
  value,
  locale,
  hint,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Paper withBorder radius="lg" p="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4}>
          <Text size="sm" c="ink.6" fw={600}>
            {label}
          </Text>
          <Text fz={30} fw={800} c="navy.9" lh={1.1}>
            {value.toLocaleString(locale)}
          </Text>
          {hint && (
            <Text size="xs" c="ink.5">
              {hint}
            </Text>
          )}
        </Stack>
        <ThemeIcon size={42} radius="md" variant="light" color={color}>
          <Icon size={22} aria-hidden="true" />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

type TodoLinkProps = {
  href: string;
  tone: "orange" | "gray";
  count: number;
  text: string;
};

function TodoLink({ href, tone, count, text }: TodoLinkProps) {
  return (
    <Anchor component={Link} href={href} underline="never">
      <Paper withBorder radius="md" p="sm" bg={`${tone}.0`}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" c="ink.8">
            <b>{count}</b> {text}
          </Text>
          <ArrowRight size={16} aria-hidden="true" />
        </Group>
      </Paper>
    </Anchor>
  );
}

/**
 * Trang đầu của khu quản trị: việc gì đang chờ một quyết định, bao nhiêu nội
 * dung đang chạy, và có ai đang dùng không. Mọi con số đến từ một lần gọi.
 */
export function AdminOverviewView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const locale = isVi ? "vi-VN" : "en-GB";
  const { data, loading, error } = useAdminOverviewQuery({
    fetchPolicy: "cache-and-network",
  });
  const overview = data?.adminOverview;

  if (!overview) {
    return (
      <Page>
        <Stack gap="lg">
          <PageHeader title={tr("Tổng quan", "Overview")} />
          {error && !loading ? (
            <Alert
              color="warn"
              title={tr("Không tải được số liệu", "Could not load the figures")}
            >
              {tr(
                "Kiểm tra kết nối rồi tải lại trang.",
                "Check the connection and reload the page.",
              )}
            </Alert>
          ) : (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height={116} radius="lg" />
                ))}
              </SimpleGrid>
              <Skeleton height={260} radius="lg" />
            </>
          )}
        </Stack>
      </Page>
    );
  }

  const published = overview.content.reduce(
    (sum, row) => sum + row.published,
    0,
  );
  const drafts = overview.content.reduce((sum, row) => sum + row.drafts, 0);
  const waiting = overview.content.filter((row) => row.pendingReview > 0);
  const withDrafts = overview.content.filter((row) => row.drafts > 0);

  return (
    <Page>
      <Stack gap="lg">
        <PageHeader title={tr("Tổng quan", "Overview")} />

        <AssessmentWorkloadPanel />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <StatCard
            label={tr("Đang chờ duyệt", "Awaiting review")}
            value={overview.pendingReviewTotal}
            locale={locale}
            hint={
              drafts > 0
                ? tr(
                    `${drafts} bản nháp chưa gửi duyệt`,
                    `${drafts} drafts not yet submitted`,
                  )
                : undefined
            }
            icon={Clock}
            color="orange"
          />
          <StatCard
            label={tr("Người học", "Learners")}
            value={overview.learners}
            locale={locale}
            hint={tr(
              `+${overview.newLearners} trong ${overview.periodDays} ngày qua`,
              `+${overview.newLearners} in the last ${overview.periodDays} days`,
            )}
            icon={Users}
            color="navy"
          />
          <StatCard
            label={tr("Đang hoạt động", "Active")}
            value={overview.activeLearners}
            locale={locale}
            hint={tr(
              `người học trong ${overview.periodDays} ngày qua`,
              `learners in the last ${overview.periodDays} days`,
            )}
            icon={Activity}
            color="teal"
          />
          <StatCard
            label={tr("Nội dung đã phát hành", "Published content")}
            value={published}
            locale={locale}
            icon={FileCheck2}
            color="grape"
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <Paper withBorder radius="lg" p="lg">
            <Stack gap="md">
              <Title order={2} size="h4" c="navy.9">
                {tr("Việc cần làm", "To do")}
              </Title>
              {waiting.length === 0 && withDrafts.length === 0 ? (
                <Group gap="xs" c="teal.7">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <Text size="sm">
                    {tr(
                      "Không có đề chờ duyệt trong các nhóm nội dung bên dưới.",
                      "Nothing is waiting for review in the content below.",
                    )}
                  </Text>
                </Group>
              ) : (
                <Stack gap="xs">
                  {waiting.map((row) => {
                    const kind = OVERVIEW_KINDS[row.kind];
                    const href =
                      row.kind === "EXAM"
                        ? kind.href
                        : `${kind.href}&status=PENDING_REVIEW`;
                    return (
                      <TodoLink
                        key={`pending-${row.kind}`}
                        href={href}
                        tone="orange"
                        count={row.pendingReview}
                        text={tr(
                          `${kind.unit.vi} đang chờ duyệt`,
                          `${kind.unit.en} awaiting review`,
                        )}
                      />
                    );
                  })}
                  {/* Nội dung nhập từ pipeline nằm ở bản nháp tới khi có người
                      gửi duyệt hoặc phát hành - việc của chính trang này. */}
                  {withDrafts.map((row) => {
                    const kind = OVERVIEW_KINDS[row.kind];
                    const href =
                      row.kind === "EXAM"
                        ? kind.href
                        : `${kind.href}&status=DRAFT`;
                    return (
                      <TodoLink
                        key={`draft-${row.kind}`}
                        href={href}
                        tone="gray"
                        count={row.drafts}
                        text={tr(
                          `${kind.unit.vi} còn ở bản nháp`,
                          `${kind.unit.en} still in draft`,
                        )}
                      />
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Paper>

          <Paper withBorder radius="lg" p="lg">
            <Stack gap="md">
              <Title order={2} size="h4" c="navy.9">
                {tr(
                  `Hoạt động ${overview.periodDays} ngày qua`,
                  `Activity, last ${overview.periodDays} days`,
                )}
              </Title>
              <SimpleGrid cols={2} spacing="md">
                {[
                  [tr("Lượt ôn thẻ", "Card reviews"), overview.cardReviews],
                  [
                    tr("Câu nghe chép", "Dictation sentences"),
                    overview.dictationSentences,
                  ],
                  [
                    tr("Bài trắc nghiệm đã nộp", "Quizzes submitted"),
                    overview.quizzesSubmitted,
                  ],
                  [
                    tr("Đề thi đã nộp", "Exams submitted"),
                    overview.examsSubmitted,
                  ],
                ].map(([label, value]) => (
                  <Stack key={label as string} gap={2}>
                    <Text fz={24} fw={800} c="navy.9">
                      {(value as number).toLocaleString(locale)}
                    </Text>
                    <Text size="xs" c="ink.6">
                      {label}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Paper withBorder radius="lg" p="lg">
          <Stack gap="md">
            <Title order={2} size="h4" c="navy.9">
              {tr("Nội dung", "Content")}
            </Title>
            <Table.ScrollContainer minWidth={520}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{tr("Loại", "Kind")}</Table.Th>
                    <Table.Th ta="right">{tr("Bản nháp", "Drafts")}</Table.Th>
                    <Table.Th ta="right">
                      {tr("Chờ duyệt", "Awaiting review")}
                    </Table.Th>
                    <Table.Th ta="right">
                      {tr("Đã phát hành", "Published")}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {overview.content.map((row) => (
                    <Table.Tr key={row.kind}>
                      <Table.Td>
                        <Anchor
                          component={Link}
                          href={OVERVIEW_KINDS[row.kind].href}
                          fw={600}
                          c="navy.8"
                        >
                          {isVi
                            ? OVERVIEW_KINDS[row.kind].label.vi
                            : OVERVIEW_KINDS[row.kind].label.en}
                        </Anchor>
                      </Table.Td>
                      <Table.Td ta="right">{row.drafts}</Table.Td>
                      <Table.Td ta="right">
                        {row.pendingReview > 0 ? (
                          <Badge color="orange" variant="light">
                            {row.pendingReview}
                          </Badge>
                        ) : (
                          0
                        )}
                      </Table.Td>
                      <Table.Td ta="right">{row.published}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>
        </Paper>
      </Stack>
    </Page>
  );
}
