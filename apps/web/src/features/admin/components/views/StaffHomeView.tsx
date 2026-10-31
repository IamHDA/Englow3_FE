"use client";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useAssessmentWorkloadQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function AssessmentWorkloadPanel({
  staff = false,
}: {
  staff?: boolean;
}) {
  const { isVi } = useLanguage();
  const query = useAssessmentWorkloadQuery({
    fetchPolicy: "cache-and-network",
  });
  const data = query.data?.assessmentWorkload;
  if (!data)
    return query.error ? (
      <Alert color="orange">
        <Stack>
          <Text>
            {isVi
              ? "Chưa tải được công việc Writing/Speaking."
              : "Could not load Writing/Speaking workload."}
          </Text>
          <Button
            variant="light"
            loading={query.loading}
            onClick={() => void query.refetch().catch(() => {})}
          >
            {isVi ? "Thử lại" : "Retry"}
          </Button>
        </Stack>
      </Alert>
    ) : (
      <Skeleton height={200} />
    );
  const items = [
    {
      label: isVi ? "Bài chờ chấm" : "Awaiting grading",
      count: data.needsReview,
      url: "tab=submissions&attemptStatus=NEEDS_REVIEW",
    },
    {
      label: isVi ? "Bài xử lý lỗi" : "Failed assessments",
      count: data.failed,
      url: "tab=submissions&attemptStatus=FAILED",
    },
    staff
      ? {
          label: isVi ? "Đề cần chỉnh sửa" : "Changes requested",
          count: data.rejected,
          url: "taskStatus=REJECTED",
        }
      : {
          label: isVi ? "Đề chờ duyệt" : "Tasks awaiting approval",
          count: data.pendingReview,
          url: "taskStatus=PENDING_REVIEW",
        },
    {
      label: isVi ? "Nháp chưa gửi" : "Unsubmitted drafts",
      count: data.drafts,
      url: "taskStatus=DRAFT",
    },
  ];
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={700}>
          Writing & Speaking ·{" "}
          {staff
            ? isVi
              ? "Đề bạn phụ trách"
              : "Your tasks"
            : isVi
              ? "Toàn hệ thống"
              : "All authors"}
        </Text>
        <Button component={Link} href="/admin/assessments/new" variant="light">
          {isVi ? "Soạn đề mới" : "Create task"}
        </Button>
      </Group>
      {query.error && (
        <Alert color="orange">
          {isVi
            ? "Đang hiển thị số liệu cũ; tải lại để kiểm tra."
            : "Showing previous counts; refresh to verify."}
        </Alert>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {items.map((item) => (
          <Card
            key={item.url}
            component={Link}
            href={`/admin/assessments?${item.url}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                {item.label}
              </Text>
              <Text fz={30} fw={700} c="navy.9">
                {item.count}
              </Text>
              <Text size="sm" c="navy.8">
                {isVi ? "Mở danh sách →" : "Open queue →"}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
export function StaffHomeView() {
  const { isVi } = useLanguage();
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Badge w="fit-content" color="teal">
            Staff
          </Badge>
          <Title>{isVi ? "Công việc của tôi" : "My work"}</Title>
          <Text c="dimmed">
            {isVi
              ? "Ưu tiên bài đang chờ chấm và đề cần sửa. Tiếp tục từ đúng nơi bạn đã dừng."
              : "Start with waiting submissions and requested changes. Continue where you left off."}
          </Text>
        </Stack>
        <AssessmentWorkloadPanel staff />
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card>
            <Stack>
              <Text fw={700}>
                {isVi ? "Soạn nội dung học" : "Author learning content"}
              </Text>
              <Text size="sm" c="dimmed">
                Flashcard · Quiz · Dictation · Pronunciation
              </Text>
              <Button component={Link} href="/admin/content" variant="default">
                {isVi ? "Quản lý nội dung" : "Manage content"}
              </Button>
            </Stack>
          </Card>
          <Card>
            <Stack>
              <Text fw={700}>
                {isVi ? "Soạn và kiểm tra đề thi" : "Author and preview exams"}
              </Text>
              <Text size="sm" c="dimmed">
                {isVi
                  ? "Cấu trúc đề, câu hỏi, đáp án và media trước khi gửi duyệt."
                  : "Paper structure, questions, answers and media before review."}
              </Text>
              <Button component={Link} href="/admin/exams" variant="default">
                {isVi ? "Mở đề thi" : "Open exams"}
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
