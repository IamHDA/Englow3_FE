"use client";
import { useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconBook, IconFlag, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useAuth } from "@/features/auth";
import { useAccountProfile } from "@/features/account";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { Page, PageHeader } from "@/shared/components/Page";
import {
  useTutorOperationsQuery,
  useTutorResourcesQuery,
  useTutorReportsQuery,
  useTutorReportLazyQuery,
  useTutorStaffMembersQuery,
  useCreateTutorResourceMutation,
  useUpdateTutorResourceMutation,
  useReviewTutorResourceMutation,
  useReviewTutorReportMutation,
} from "@/lib/graphql/generated/hooks";
import type { TutorResourcesQuery } from "@/lib/graphql/generated/documents";
import type { TutorReviewInput } from "@/lib/graphql/generated/schemaTypes";

import { TutorPolicyControls } from "../../blocks/TutorPolicyControls";

type Resource = TutorResourcesQuery["tutorResources"]["items"][number];
export function TutorManagementView() {
  const { isVi } = useLanguage();
  const { session } = useAuth();
  const { profile } = useAccountProfile();
  const admin = session?.role === "ADMIN";
  const operations = useTutorOperationsQuery({
    skip: !admin,
    fetchPolicy: "cache-and-network",
  });
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const metrics = operations.data?.tutorOperations.metrics;
  const seconds = (ms?: number | null) =>
    ms == null
      ? tr("Chưa có mẫu", "No samples")
      : `${(ms / 1000).toFixed(1)} s`;
  const [tab, setTab] = useState<string | null>("reports");
  const [resourceStatus, setResourceStatus] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [resourcePage, setResourcePage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const guard = useRef(false);
  const [editor, setEditor] = useState<Resource | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [decision, setDecision] = useState<{
    id: string;
    action: string;
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [correction, setCorrection] = useState("");
  const resources = useTutorResourcesQuery({
    variables: { status: resourceStatus, page: resourcePage - 1 },
    fetchPolicy: "cache-and-network",
    skip: tab !== "resources",
  });
  const reports = useTutorReportsQuery({
    variables: { status: reportStatus, page: reportPage - 1 },
    fetchPolicy: "cache-and-network",
    skip: tab !== "reports",
  });
  const staff = useTutorStaffMembersQuery({
    skip: !admin,
    fetchPolicy: "cache-and-network",
  });
  const [getReport, detail] = useTutorReportLazyQuery({
    fetchPolicy: "network-only",
  });
  const [createResource] = useCreateTutorResourceMutation();
  const [updateResource] = useUpdateTutorResourceMutation();
  const [reviewResource] = useReviewTutorResourceMutation();
  const [reviewReport] = useReviewTutorReportMutation();
  const report =
    detail.data?.tutorReport.id === selected ? detail.data.tutorReport : null;
  const resourceData = resources.data?.tutorResources;
  const reportData = reports.data?.tutorReports;
  const labels: Record<string, string> = {
    DRAFT: tr("Bản nháp", "Draft"),
    SUBMITTED: tr("Chờ duyệt", "Submitted"),
    PUBLISHED: tr("Đã xuất bản", "Published"),
    REJECTED: tr("Cần sửa", "Rejected"),
    ARCHIVED: tr("Đã lưu trữ", "Archived"),
    OPEN: tr("Mới nhận", "New"),
    ASSIGNED: tr("Đã phân công", "Assigned"),
    PROPOSED: tr("Chờ kết luận", "Awaiting decision"),
    RESOLVED: tr("Đã xử lý", "Resolved"),
    DISMISSED: tr("Đã đóng", "Dismissed"),
  };
  async function run(task: () => Promise<unknown>) {
    if (guard.current) return false;
    guard.current = true;
    setBusy(true);
    setError(null);
    try {
      await task();
      return true;
    } catch {
      setError(
        tr(
          "Chưa hoàn tất. Kiểm tra quyền, trạng thái hiện tại rồi thử lại; nội dung đang nhập vẫn được giữ.",
          "Could not finish. Check access and current status before retrying. Your draft is kept.",
        ),
      );
      return false;
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }
  function edit(resource: Resource | "new") {
    setEditor(resource);
    setTitle(resource === "new" ? "" : resource.title);
    setBody(resource === "new" ? "" : resource.body);
    setError(null);
  }
  async function openReport(id: string) {
    setSelected(id);
    setError(null);
    setAssignee(null);
    setReviewNote("");
    setCorrection("");
    try {
      const r = await getReport({ variables: { id } });
      setAssignee(r.data?.tutorReport.assignedTo ?? null);
      setReviewNote(r.data?.tutorReport.reviewerNote ?? "");
      setCorrection(r.data?.tutorReport.correction ?? "");
    } catch {
      setError(
        tr(
          "Không mở được báo cáo. Báo cáo có thể đã được phân công lại.",
          "Could not open this report. Its assignment may have changed.",
        ),
      );
    }
  }
  async function reportAction(input: TutorReviewInput) {
    if (!selected) return;
    await run(async () => {
      await reviewReport({ variables: { id: selected, input } });
      await openReport(selected);
      await reports.refetch();
    });
  }
  return (
    <Page>
      <Stack gap="lg">
        <PageHeader
          title={tr("Quản lý Gia sư AI", "AI Tutor management")}
          actions={
            <Button
              variant="default"
              leftSection={<IconRefresh size={16} />}
              onClick={() =>
                void run(() =>
                  tab === "resources" ? resources.refetch() : reports.refetch(),
                )
              }
            >
              {tr("Làm mới", "Refresh")}
            </Button>
          }
        />
        <Text c="dimmed" size="sm">
          {admin
            ? tr(
                "Duyệt học liệu và kết luận các báo cáo về câu trả lời của gia sư.",
                "Publish reviewed learning resources and resolve tutor answer reports.",
              )
            : tr(
                "Soạn học liệu và xử lý các báo cáo được phân công. Bạn chỉ xem phần hội thoại liên quan đến báo cáo.",
                "Author learning resources and review assigned reports. Only report-related conversation excerpts are available.",
              )}
        </Text>
        {admin && <TutorPolicyControls />}
        {admin && (
          <Card withBorder radius="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700}>
                  {tr("Hàng đợi AI dùng chung", "Shared AI queue")}
                </Text>
                <Button
                  variant="subtle"
                  loading={operations.loading}
                  onClick={() =>
                    void operations.refetch().catch(() => undefined)
                  }
                >
                  {tr("Cập nhật trạng thái", "Refresh status")}
                </Button>
              </Group>
              {operations.data && (
                <Group gap="xl" wrap="wrap">
                  {[
                    [
                      tr("Đang chờ", "Pending"),
                      operations.data.tutorOperations.pending,
                    ],
                    [
                      tr("Đang xử lý", "Running"),
                      operations.data.tutorOperations.running,
                    ],
                    [
                      tr("Hoàn tất hôm nay", "Completed today"),
                      operations.data.tutorOperations.completedToday,
                    ],
                    [
                      tr("Lỗi hôm nay", "Failed today"),
                      operations.data.tutorOperations.failedToday,
                    ],
                  ].map(([label, value]) => (
                    <Stack key={label} gap={2}>
                      <Text size="xs" c="dimmed">
                        {label}
                      </Text>
                      <Text size="xl" fw={700}>
                        {value}
                      </Text>
                    </Stack>
                  ))}
                </Group>
              )}
              {operations.error && (
                <Text c="orange.8" size="sm">
                  {tr(
                    "Chưa tải được trạng thái hàng đợi",
                    "Could not load queue status",
                  )}
                </Text>
              )}
              {metrics && (
                <Stack gap="sm">
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    <div>
                      <Text size="xs" c="dimmed">
                        {tr("Chờ hàng đợi p95", "Queue wait p95")}
                      </Text>
                      <Text fw={700}>{seconds(metrics.queueP95Ms)}</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        {tr("Hoàn tất p95", "Completion p95")}
                      </Text>
                      <Text fw={700}>{seconds(metrics.completionP95Ms)}</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        {tr(
                          "Token Tutor đã biết · vào/ra",
                          "Known Tutor tokens · in/out",
                        )}
                      </Text>
                      <Text fw={700}>
                        {metrics.knownInputTokens.toLocaleString()} /{" "}
                        {metrics.knownOutputTokens.toLocaleString()}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        {tr(
                          "Lượt Tutor thiếu usage",
                          "Tutor jobs missing usage",
                        )}
                      </Text>
                      <Text fw={700}>{metrics.unknownUsageJobs}</Text>
                    </div>
                  </SimpleGrid>
                  <Text size="xs" c="dimmed">
                    {tr(
                      "Thống kê từ đầu ngày. p95 hoàn tất tính từ lúc tiếp nhận đến khi có kết quả thành công, gồm thời gian chờ. Token thiếu không được tính là 0; chưa cấu hình bảng giá nên chưa ước tính chi phí.",
                      "Since the start of today. Completion p95 includes queue time and covers successful jobs. Missing usage is unknown, not zero. Cost estimates are unavailable without a configured price table.",
                    )}
                  </Text>
                  {metrics.failures.length > 0 && (
                    <Alert
                      color="orange"
                      title={tr("Mã lỗi cuối cùng", "Terminal error codes")}
                    >
                      <Stack gap={4}>
                        {metrics.failures.map((failure) => (
                          <Text size="sm" key={failure.code}>
                            <code>{failure.code}</code> · {failure.count}
                          </Text>
                        ))}
                      </Stack>
                    </Alert>
                  )}
                </Stack>
              )}
              <Text size="xs" c="dimmed">
                {tr(
                  "Số liệu gồm Tutor, Viết và Nói trong cùng môi trường; không hiển thị nội dung riêng tư.",
                  "Includes Tutor, Writing and Speaking in this environment; no private content is shown.",
                )}
              </Text>
            </Stack>
          </Card>
        )}
        {error && (
          <Alert color="orange" role="alert">
            {error}
          </Alert>
        )}
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            <Tabs.Tab value="reports" leftSection={<IconFlag size={18} />}>
              {tr("Báo cáo câu trả lời", "Answer reports")}
            </Tabs.Tab>
            <Tabs.Tab value="resources" leftSection={<IconBook size={18} />}>
              {tr("Kho kiến thức", "Knowledge library")}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="reports" pt="lg">
            <Stack>
              <Select
                label={tr("Trạng thái báo cáo", "Report status")}
                value={reportStatus}
                onChange={(value) => {
                  setReportStatus(value ?? "");
                  setReportPage(1);
                }}
                data={[
                  { value: "", label: tr("Tất cả", "All") },
                  ...[
                    "OPEN",
                    "ASSIGNED",
                    "PROPOSED",
                    "RESOLVED",
                    "DISMISSED",
                  ].map((value) => ({ value, label: labels[value] })),
                ]}
                maw={300}
              />
              {reports.loading && !reportData && <Loader size="sm" />}
              {reports.error && (
                <Alert color="orange">
                  {tr(
                    "Chưa tải được báo cáo. Bấm Làm mới để thử lại.",
                    "Could not load reports. Refresh to retry.",
                  )}
                </Alert>
              )}
              {reportData &&
                reportData.items.length === 0 &&
                !reports.loading && (
                  <Card withBorder p="xl">
                    <Text>
                      {admin
                        ? tr(
                            "Chưa có báo cáo phù hợp bộ lọc.",
                            "No reports match this filter.",
                          )
                        : tr(
                            "Chưa có báo cáo phù hợp được phân công cho bạn.",
                            "No matching reports have been assigned to you.",
                          )}
                    </Text>
                  </Card>
                )}
              {reportData && reportData.items.length > 0 && (
                <Table.ScrollContainer minWidth={580}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{tr("Báo cáo", "Report")}</Table.Th>
                        <Table.Th>{tr("Trạng thái", "Status")}</Table.Th>
                        <Table.Th>{tr("Tiếp nhận", "Received")}</Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {reportData.items.map((r, index) => (
                        <Table.Tr key={r.id}>
                          <Table.Td>
                            {tr("Câu trả lời cần kiểm tra", "Answer to review")}{" "}
                            {(reportPage - 1) * 15 + index + 1}
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light">
                              {labels[r.status] ?? r.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {new Date(r.createdAt).toLocaleString(
                              isVi ? "vi-VN" : "en-GB",
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Button
                              variant="light"
                              onClick={() => void openReport(r.id)}
                            >
                              {tr("Xem báo cáo", "Review")}
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
              {reportData && reportData.totalPages > 1 && (
                <Pagination
                  total={reportData.totalPages}
                  value={reportPage}
                  onChange={setReportPage}
                />
              )}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="resources" pt="lg">
            <Stack>
              <Group justify="space-between" align="end">
                <Select
                  label={tr("Trạng thái học liệu", "Resource status")}
                  value={resourceStatus}
                  onChange={(value) => {
                    setResourceStatus(value ?? "");
                    setResourcePage(1);
                  }}
                  data={[
                    { value: "", label: tr("Tất cả", "All") },
                    ...[
                      "DRAFT",
                      "SUBMITTED",
                      "PUBLISHED",
                      "REJECTED",
                      "ARCHIVED",
                    ].map((value) => ({ value, label: labels[value] })),
                  ]}
                  maw={300}
                />
                <Button
                  leftSection={<IconPlus size={18} />}
                  onClick={() => edit("new")}
                >
                  {tr("Soạn học liệu", "New resource")}
                </Button>
              </Group>
              <Text size="sm" c="dimmed">
                {tr(
                  "Chỉ học liệu đã được Admin duyệt và xuất bản mới được đưa vào câu trả lời AI. Học liệu đã xuất bản phải tạo phiên bản mới để sửa.",
                  "Only administrator-approved, published resources are used by the tutor. Create a new version to change a published resource.",
                )}
              </Text>
              {resources.loading && !resourceData && <Loader size="sm" />}
              {resources.error && (
                <Alert color="orange">
                  {tr(
                    "Chưa tải được học liệu. Bấm Làm mới để thử lại.",
                    "Could not load resources. Refresh to retry.",
                  )}
                </Alert>
              )}
              {resourceData &&
                resourceData.items.length === 0 &&
                !resources.loading && (
                  <Card withBorder p="xl">
                    <Text>
                      {tr(
                        "Chưa có học liệu phù hợp. Bạn có thể soạn học liệu đầu tiên để gửi duyệt.",
                        "No matching resources. Create a resource to submit for review.",
                      )}
                    </Text>
                  </Card>
                )}
              {resourceData?.items.map((resource) => (
                <Card withBorder radius="md" p="md" key={resource.id}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={700}>{resource.title}</Text>
                      <Badge variant="light">
                        {labels[resource.status] ?? resource.status} · v
                        {resource.versionNumber}
                      </Badge>
                    </Group>
                    {resource.reviewNote && (
                      <Alert color="orange">{resource.reviewNote}</Alert>
                    )}
                    <Text
                      size="sm"
                      lineClamp={3}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {resource.body}
                    </Text>
                    <Group>
                      <Button variant="default" onClick={() => edit(resource)}>
                        {(admin || profile?.id === resource.authorId) &&
                        ["DRAFT", "REJECTED"].includes(resource.status)
                          ? tr("Mở và chỉnh sửa", "Open and edit")
                          : tr("Đọc học liệu", "Read resource")}
                      </Button>
                      {(admin || profile?.id === resource.authorId) &&
                        resource.status === "DRAFT" && (
                          <Button
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await reviewResource({
                                  variables: {
                                    id: resource.id,
                                    input: { action: "SUBMIT" },
                                  },
                                });
                                await resources.refetch();
                              })
                            }
                          >
                            {tr("Gửi duyệt", "Submit for review")}
                          </Button>
                        )}
                      {admin && resource.status === "SUBMITTED" && (
                        <>
                          <Button
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await reviewResource({
                                  variables: {
                                    id: resource.id,
                                    input: { action: "PUBLISH" },
                                  },
                                });
                                await resources.refetch();
                              })
                            }
                          >
                            {tr("Duyệt và xuất bản", "Approve and publish")}
                          </Button>
                          <Button
                            variant="light"
                            color="orange"
                            onClick={() => {
                              setDecision({
                                id: resource.id,
                                action: "REJECT",
                              });
                              setDecisionNote("");
                            }}
                          >
                            {tr("Yêu cầu sửa", "Request changes")}
                          </Button>
                        </>
                      )}
                      {resource.status === "PUBLISHED" && (
                        <>
                          <Button
                            variant="light"
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                const result = await reviewResource({
                                  variables: {
                                    id: resource.id,
                                    input: { action: "REVISION" },
                                  },
                                });
                                setResourceStatus("DRAFT");
                                setResourcePage(1);
                                if (result.data)
                                  edit(result.data.reviewTutorResource);
                                await resources.refetch();
                              })
                            }
                          >
                            {tr("Tạo phiên bản mới", "Create revision")}
                          </Button>
                          {admin && (
                            <Button
                              variant="subtle"
                              color="orange"
                              onClick={() => {
                                setDecision({
                                  id: resource.id,
                                  action: "ARCHIVE",
                                });
                                setDecisionNote("");
                              }}
                            >
                              {tr("Thu hồi", "Withdraw")}
                            </Button>
                          )}
                        </>
                      )}
                    </Group>
                  </Stack>
                </Card>
              ))}
              {resourceData && resourceData.totalPages > 1 && (
                <Pagination
                  total={resourceData.totalPages}
                  value={resourcePage}
                  onChange={setResourcePage}
                />
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
        <Modal
          opened={editor !== null}
          onClose={() => !busy && setEditor(null)}
          title={
            editor === "new"
              ? tr("Soạn học liệu", "New resource")
              : tr("Học liệu", "Resource")
          }
          size="lg"
        >
          <Stack>
            {error && <Alert color="orange">{error}</Alert>}
            <TextInput
              label={tr("Tiêu đề", "Title")}
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              readOnly={
                editor !== null &&
                editor !== "new" &&
                (!["DRAFT", "REJECTED"].includes(editor.status) ||
                  (!admin && profile?.id !== editor.authorId))
              }
            />
            <Textarea
              label={tr("Nội dung và ví dụ", "Explanation and examples")}
              minRows={12}
              autosize
              maxRows={22}
              maxLength={12000}
              value={body}
              onChange={(event) => setBody(event.currentTarget.value)}
              readOnly={
                editor !== null &&
                editor !== "new" &&
                (!["DRAFT", "REJECTED"].includes(editor.status) ||
                  (!admin && profile?.id !== editor.authorId))
              }
            />
            <Text size="xs" c="dimmed">
              {tr(
                "Dùng nội dung bạn được phép sử dụng. Không đưa thông tin cá nhân hoặc đáp án đề thi chưa công bố vào đây.",
                "Use authorized material. Do not include personal information or unpublished exam answers.",
              )}
            </Text>
            {editor !== null &&
              (editor === "new" ||
                (["DRAFT", "REJECTED"].includes(editor.status) &&
                  (admin || profile?.id === editor.authorId))) && (
                <Button
                  loading={busy}
                  disabled={!title.trim() || !body.trim()}
                  onClick={() =>
                    void run(async () => {
                      if (editor === "new")
                        await createResource({
                          variables: { input: { title, body, rowVersion: 0 } },
                        });
                      else if (editor)
                        await updateResource({
                          variables: {
                            id: editor.id,
                            input: {
                              title,
                              body,
                              rowVersion: editor.rowVersion,
                            },
                          },
                        });
                      setEditor(null);
                      await resources.refetch();
                    })
                  }
                >
                  {tr("Lưu bản nháp", "Save draft")}
                </Button>
              )}
          </Stack>
        </Modal>
        <Modal
          opened={decision !== null}
          onClose={() => !busy && setDecision(null)}
          title={tr("Ghi lý do quyết định", "Explain your decision")}
        >
          <Stack>
            <Textarea
              label={tr("Lý do", "Reason")}
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.currentTarget.value)}
              maxLength={2000}
            />
            <Button
              loading={busy}
              disabled={!decisionNote.trim()}
              onClick={() => {
                if (decision)
                  void run(async () => {
                    await reviewResource({
                      variables: {
                        id: decision.id,
                        input: { action: decision.action, note: decisionNote },
                      },
                    });
                    setDecision(null);
                    await resources.refetch();
                  });
              }}
            >
              {tr("Xác nhận", "Confirm")}
            </Button>
          </Stack>
        </Modal>
        <Modal
          opened={selected !== null}
          onClose={() => !busy && setSelected(null)}
          title={tr("Kiểm tra câu trả lời", "Review answer")}
          size="lg"
        >
          <Stack>
            {error && <Alert color="orange">{error}</Alert>}
            {detail.loading && !report && <Loader size="sm" />}
            {report && (
              <>
                <Badge variant="light">
                  {labels[report.status] ?? report.status}
                </Badge>
                <Card withBorder>
                  <Text fw={700} size="sm">
                    {tr("Câu hỏi liên quan", "Related question")}
                  </Text>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {report.question}
                  </Text>
                </Card>
                <Card withBorder>
                  <Text fw={700} size="sm">
                    {tr("Câu trả lời được báo cáo", "Reported answer")}
                  </Text>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {report.answer}
                  </Text>
                </Card>
                <Text size="sm">
                  {tr("Phản ánh của người học: ", "Learner note: ")}
                  {report.learnerNote || tr("Không có ghi chú", "No note")}
                </Text>
                {!["RESOLVED", "DISMISSED"].includes(report.status) && (
                  <>
                    {admin && (
                      <Group align="end">
                        <Select
                          label={tr("Người phụ trách", "Assigned reviewer")}
                          value={assignee}
                          onChange={setAssignee}
                          data={
                            staff.data?.tutorStaffMembers.map((user) => ({
                              value: user.id,
                              label: user.displayName,
                            })) ?? []
                          }
                          error={
                            staff.error
                              ? tr(
                                  "Chưa tải được danh sách",
                                  "Could not load reviewers",
                                )
                              : undefined
                          }
                          searchable
                          style={{ flex: 1 }}
                        />
                        <Button
                          disabled={!assignee || busy}
                          onClick={() =>
                            void reportAction({
                              action: "ASSIGN",
                              assignedTo: assignee,
                            })
                          }
                        >
                          {tr("Phân công", "Assign")}
                        </Button>
                      </Group>
                    )}
                    <Textarea
                      label={tr("Nhận xét xử lý", "Review note")}
                      value={reviewNote}
                      onChange={(event) =>
                        setReviewNote(event.currentTarget.value)
                      }
                      maxLength={2000}
                    />
                    <Textarea
                      label={tr(
                        "Đề xuất đính chính (nếu cần)",
                        "Proposed correction (optional)",
                      )}
                      value={correction}
                      onChange={(event) =>
                        setCorrection(event.currentTarget.value)
                      }
                      minRows={4}
                      maxLength={8000}
                    />
                    <Group>
                      {["ASSIGNED", "PROPOSED"].includes(report.status) && (
                        <Button
                          disabled={!reviewNote.trim() || busy}
                          onClick={() =>
                            void reportAction({
                              action: "PROPOSE",
                              note: reviewNote,
                              correction,
                            })
                          }
                        >
                          {tr("Lưu đề xuất", "Save proposal")}
                        </Button>
                      )}
                      {admin && (
                        <>
                          <Button
                            disabled={
                              !reviewNote.trim() ||
                              report.status !== "PROPOSED" ||
                              busy
                            }
                            onClick={() =>
                              void reportAction({
                                action: "RESOLVE",
                                note: reviewNote,
                              })
                            }
                          >
                            {tr("Duyệt kết luận", "Approve resolution")}
                          </Button>
                          <Button
                            variant="light"
                            color="orange"
                            disabled={!reviewNote.trim() || busy}
                            onClick={() =>
                              void reportAction({
                                action: "DISMISS",
                                note: reviewNote,
                              })
                            }
                          >
                            {tr("Đóng và ghi lý do", "Dismiss with reason")}
                          </Button>
                        </>
                      )}
                    </Group>
                  </>
                )}
                {["RESOLVED", "DISMISSED"].includes(report.status) && (
                  <Alert color="brand">
                    <Text size="sm">{report.reviewerNote}</Text>
                    {report.correction && (
                      <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                        {report.correction}
                      </Text>
                    )}
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </Modal>
      </Stack>
    </Page>
  );
}
