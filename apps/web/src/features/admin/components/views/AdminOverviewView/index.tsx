"use client";

import {
  Alert,
  Anchor,
  Badge,
  Container,
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

type StatCardProps = {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  color: string;
};

function StatCard({ label, value, hint, icon: Icon, color }: StatCardProps) {
  return (
    <Paper withBorder radius="lg" p="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4}>
          <Text size="sm" c="ink.6" fw={600}>
            {label}
          </Text>
          <Text fz={30} fw={800} c="navy.9" lh={1.1}>
            {value.toLocaleString("vi-VN")}
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
  const { data, loading, error } = useAdminOverviewQuery({
    fetchPolicy: "cache-and-network",
  });
  const overview = data?.adminOverview;

  if (!overview) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Title order={1} size="h2" c="navy.9">
            Tổng quan
          </Title>
          {error && !loading ? (
            <Alert color="warn" title="Không tải được số liệu">
              Kiểm tra kết nối rồi tải lại trang.
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
      </Container>
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
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={1} size="h2" c="navy.9">
          Tổng quan
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <StatCard
            label="Đang chờ duyệt"
            value={overview.pendingReviewTotal}
            hint={drafts > 0 ? `${drafts} bản nháp chưa gửi duyệt` : undefined}
            icon={Clock}
            color="orange"
          />
          <StatCard
            label="Người học"
            value={overview.learners}
            hint={`+${overview.newLearners} trong ${overview.periodDays} ngày qua`}
            icon={Users}
            color="navy"
          />
          <StatCard
            label="Đang hoạt động"
            value={overview.activeLearners}
            hint={`người học trong ${overview.periodDays} ngày qua`}
            icon={Activity}
            color="teal"
          />
          <StatCard
            label="Nội dung đã phát hành"
            value={published}
            icon={FileCheck2}
            color="grape"
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <Paper withBorder radius="lg" p="lg">
            <Stack gap="md">
              <Title order={2} size="h4" c="navy.9">
                Việc cần làm
              </Title>
              {waiting.length === 0 && withDrafts.length === 0 ? (
                <Group gap="xs" c="teal.7">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <Text size="sm">Không có việc gì đang chờ.</Text>
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
                        text={`${kind.unit} đang chờ duyệt`}
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
                        text={`${kind.unit} còn ở bản nháp`}
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
                Hoạt động {overview.periodDays} ngày qua
              </Title>
              <SimpleGrid cols={2} spacing="md">
                {[
                  ["Lượt ôn thẻ", overview.cardReviews],
                  ["Câu nghe chép", overview.dictationSentences],
                  ["Bài trắc nghiệm đã nộp", overview.quizzesSubmitted],
                  ["Đề thi đã nộp", overview.examsSubmitted],
                ].map(([label, value]) => (
                  <Stack key={label as string} gap={2}>
                    <Text fz={24} fw={800} c="navy.9">
                      {(value as number).toLocaleString("vi-VN")}
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
              Nội dung
            </Title>
            <Table.ScrollContainer minWidth={520}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Loại</Table.Th>
                    <Table.Th ta="right">Bản nháp</Table.Th>
                    <Table.Th ta="right">Chờ duyệt</Table.Th>
                    <Table.Th ta="right">Đã phát hành</Table.Th>
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
                          {OVERVIEW_KINDS[row.kind].label}
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
    </Container>
  );
}
