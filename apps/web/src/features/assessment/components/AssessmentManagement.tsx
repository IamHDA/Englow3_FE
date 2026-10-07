"use client";

import { paginationControlProps } from "@/shared/a11y/paginationControls";
import { useAssessmentText } from "../hooks/useAssessmentText";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useDebouncedValue } from "@mantine/hooks";
import { AssessmentSubmissionViewer } from "./AssessmentSubmissionViewer";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth";
import {
  AssessmentAttemptStatus,
  AssessmentSkill,
  AssessmentTaskStatus,
} from "@/lib/graphql/generated";
import {
  useAssessmentAuthoringQuery,
  useAssessmentReviewQueueQuery,
  useAssessmentTransitionTaskMutation,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { statusLabels, statusLabelsEn, type PracticeTask } from "../types";
export function AssessmentManagement({
  initial = {},
}: {
  initial?: Record<string, string | undefined>;
}) {
  const tx = useAssessmentText();
  const { isVi } = useLanguage();
  const { session } = useAuth();
  const admin = session?.role === "ADMIN";
  const [tab, setTab] = useState<string | null>(
    initial.tab === "submissions" ? "submissions" : "tasks",
  );
  const [page, setPage] = useState(Math.max(1, Number(initial.page) || 1));
  const [skill, setSkill] = useState<string | null>(
    Object.values(AssessmentSkill).includes(initial.skill as AssessmentSkill)
      ? initial.skill!
      : null,
  );
  const [taskStatus, setTaskStatus] = useState<string | null>(
    Object.values(AssessmentTaskStatus).includes(
      initial.taskStatus as AssessmentTaskStatus,
    )
      ? initial.taskStatus!
      : null,
  );
  const [term, setTerm] = useState(initial.term ?? "");
  const [debouncedTerm] = useDebouncedValue(term, 300);
  const [oldest, setOldest] = useState(initial.oldest !== "false");
  const [attemptStatus, setAttemptStatus] = useState<string | null>(
    initial.attemptStatus === "ALL"
      ? null
      : Object.values(AssessmentAttemptStatus).includes(
            initial.attemptStatus as AssessmentAttemptStatus,
          )
        ? initial.attemptStatus!
        : "NEEDS_REVIEW",
  );
  const tasks = useAssessmentAuthoringQuery({
    variables: {
      skill: skill as AssessmentSkill | null,
      status: taskStatus as AssessmentTaskStatus | null,
      page: page - 1,
    },
    skip: tab !== "tasks",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const queue = useAssessmentReviewQueueQuery({
    variables: {
      status: attemptStatus as AssessmentAttemptStatus | null,
      skill: skill as AssessmentSkill | null,
      term: debouncedTerm || null,
      oldest,
      page: page - 1,
    },
    skip: tab !== "submissions",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [preview, setPreview] = useState<PracticeTask | null>(null);
  const [viewResult, setViewResult] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PracticeTask | null>(null);
  const [note, setNote] = useState("");
  const [transition] = useAssessmentTransitionTaskMutation();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  async function action(task: PracticeTask, action: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (
        action === "archive" &&
        !window.confirm(
          `Lưu trữ “${task.title}”? Đề sẽ ẩn khỏi thư viện; bài đã nộp vẫn được giữ.`,
        )
      )
        return;
      const result = await transition({
        variables: {
          id: task.id,
          action,
          note: action === "reject" ? note : undefined,
        },
      });
      if (!result.data) throw new Error("No task result");
      setRejecting(null);
      setNote("");
      await tasks.refetch().catch(() => {
        setError(
          tx(
            "Thao tác đã thành công nhưng danh sách chưa cập nhật. Bấm Tải lại để xem trạng thái mới.",
          ),
        );
      });
    } catch {
      setError(
        tx(
          "Thao tác chưa thành công. Kiểm tra trạng thái đề và quyền truy cập, rồi thử lại.",
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const query = tab === "tasks" ? tasks : queue;
  const refreshQuery = query.refetch;
  useEffect(() => {
    const p = new URLSearchParams();
    p.set("tab", tab ?? "tasks");
    p.set("page", String(page));
    if (skill) p.set("skill", skill);
    if (taskStatus) p.set("taskStatus", taskStatus);
    if (tab === "submissions") {
      p.set("attemptStatus", attemptStatus ?? "ALL");
      p.set("oldest", String(oldest));
    }
    if (term) p.set("term", term);
    window.history.replaceState(null, "", `/admin/assessments?${p}`);
  }, [tab, page, skill, taskStatus, attemptStatus, oldest, term]);
  useEffect(() => {
    const refresh = () => {
      void refreshQuery().catch(() => {});
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refreshQuery]);
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={1}>Writing & Speaking</Title>
            <Text c="dimmed">
              {admin
                ? tx("Duyệt đề, theo dõi bài nộp và điều chỉnh kết quả.")
                : tx("Soạn đề luyện tập và chấm bài của các đề bạn phụ trách.")}
            </Text>
          </div>
          {tab === "tasks" && (
            <Button component={Link} href="/admin/assessments/new">
              {tx("Tạo đề luyện")}
            </Button>
          )}
        </Group>
        <Tabs
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
            setError(null);
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="tasks">{tx("Đề luyện tập")}</Tabs.Tab>
            <Tabs.Tab value="submissions">{tx("Bài nộp và kết quả")}</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Group align="flex-end">
          {tab === "tasks" ? (
            <>
              <Select
                label={tx("Kỹ năng")}
                placeholder={tx("Tất cả kỹ năng")}
                clearable
                data={["WRITING", "SPEAKING"]}
                value={skill}
                onChange={(v) => {
                  setSkill(v);
                  setPage(1);
                }}
              />
              <Select
                label={tx("Trạng thái đề")}
                placeholder={tx("Tất cả trạng thái")}
                clearable
                data={Object.values(AssessmentTaskStatus).map((value) => ({
                  value,
                  label: (isVi ? statusLabels : statusLabelsEn)[value],
                }))}
                value={taskStatus}
                onChange={(v) => {
                  setTaskStatus(v);
                  setPage(1);
                }}
              />
            </>
          ) : (
            <Select
              label={tx("Trạng thái bài nộp")}
              placeholder={tx("Tất cả bài đã nộp")}
              clearable
              data={["NEEDS_REVIEW", "QUEUED", "FAILED", "COMPLETED"].map(
                (value) => ({
                  value,
                  label: (isVi ? statusLabels : statusLabelsEn)[value],
                }),
              )}
              value={attemptStatus}
              onChange={(v) => {
                setAttemptStatus(v);
                setPage(1);
              }}
            />
          )}
          {tab === "submissions" && (
            <>
              <TextInput
                label={tx("Tìm bài")}
                placeholder={tx("Tên người học, đề hoặc mã bài")}
                value={term}
                maxLength={200}
                onChange={(e) => {
                  setTerm(e.currentTarget.value);
                  setPage(1);
                }}
              />
              <Select
                label={tx("Kỹ năng")}
                clearable
                data={["WRITING", "SPEAKING"]}
                value={skill}
                onChange={(v) => {
                  setSkill(v);
                  setPage(1);
                }}
              />
              <Select
                label={tx("Thứ tự")}
                value={oldest ? "oldest" : "newest"}
                data={[
                  { value: "oldest", label: tx("Chờ lâu nhất trước") },
                  { value: "newest", label: tx("Mới nhất trước") },
                ]}
                onChange={(v) => {
                  setOldest(v === "oldest");
                  setPage(1);
                }}
              />
            </>
          )}
          <Button
            variant="light"
            onClick={() =>
              void query
                .refetch()
                .catch(() => setError(tx("Chưa tải lại được danh sách.")))
            }
          >
            {tx("Tải lại")}
          </Button>
        </Group>
        {error && <Alert color="red">{error}</Alert>}
        {query.error && query.data && (
          <Alert color="orange">
            {tx(
              "Chưa tải được dữ liệu mới. Đang hiển thị danh sách đã tải trước đó; bấm Tải lại để thử lại.",
            )}
          </Alert>
        )}
        {query.loading && !query.data ? (
          <Stack role="status" aria-live="polite">
            <Text c="dimmed">
              Đang tải {tab === "tasks" ? tx("đề luyện tập") : tx("bài nộp")}…
            </Text>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} h={96} radius="md" />
            ))}
          </Stack>
        ) : query.error && !query.data ? (
          <LoadErrorState
            error={query.error}
            thing={{ vi: tx("nội dung luyện tập"), en: "practice content" }}
            back={{ href: "/", label: tx("Trang chủ") }}
            onRetry={() => void query.refetch().catch(() => {})}
          />
        ) : tab === "tasks" ? (
          tasks.data?.authoringAssessmentTasks.items.length ? (
            <Stack>
              {tasks.data.authoringAssessmentTasks.items.map((task) => (
                <Card withBorder radius="md" key={task.id}>
                  <Group justify="space-between">
                    <Stack gap={3}>
                      <Text fw={700}>{task.title}</Text>
                      <Text size="xs" c="dimmed">
                        {task.skill} · {task.taskType.replaceAll("_", " ")}
                      </Text>
                      <Badge w="fit-content">
                        {(isVi ? statusLabels : statusLabelsEn)[task.status]}
                      </Badge>
                      {task.reviewNote && (
                        <Text size="sm" c="red">
                          Yêu cầu chỉnh sửa: {task.reviewNote}
                        </Text>
                      )}
                    </Stack>
                    <Group>
                      <Button
                        variant="light"
                        disabled={busy}
                        onClick={() => setPreview(task)}
                      >
                        {tx("Xem trước")}
                      </Button>
                      {["DRAFT", "REJECTED"].includes(task.status) && (
                        <>
                          <Button
                            variant="default"
                            disabled={busy}
                            component={Link}
                            href={`/admin/assessments/tasks/${task.id}/edit`}
                          >
                            {tx("Sửa đề")}
                          </Button>
                          <Button
                            disabled={busy}
                            onClick={() => void action(task, "submit")}
                          >
                            {tx("Gửi duyệt")}
                          </Button>
                        </>
                      )}
                      {admin && task.status === "PENDING_REVIEW" && (
                        <>
                          <Button
                            color="teal"
                            disabled={busy}
                            onClick={() => void action(task, "approve")}
                          >
                            {tx("Duyệt và xuất bản")}
                          </Button>
                          <Button
                            color="red"
                            variant="light"
                            disabled={busy}
                            onClick={() => {
                              setRejecting(task);
                              setNote("");
                            }}
                          >
                            {tx("Trả lại")}
                          </Button>
                        </>
                      )}
                      {admin && task.status === "ARCHIVED" && (
                        <Button
                          variant="light"
                          disabled={busy}
                          onClick={() => void action(task, "restore")}
                        >
                          {tx("Khôi phục")}
                        </Button>
                      )}
                      {admin && task.status === "PUBLISHED" && (
                        <Button
                          variant="default"
                          disabled={busy}
                          onClick={() => void action(task, "archive")}
                        >
                          {tx("Lưu trữ")}
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card withBorder>
              <Stack>
                <Text fw={600}>
                  {skill || taskStatus || page > 1
                    ? tx("Không có đề phù hợp bộ lọc.")
                    : admin
                      ? tx("Chưa có đề Writing / Speaking.")
                      : tx("Bạn chưa có đề Writing / Speaking phụ trách.")}
                </Text>
                <Text size="sm" c="dimmed">
                  {tx(
                    "Tạo đề mới hoặc điền nhanh từ 5 đề mẫu. Sau khi lưu bản nháp, gửi duyệt; đề được admin xuất bản mới xuất hiện cho người học.",
                  )}
                </Text>
                {!admin && (
                  <Text size="sm" c="dimmed">
                    {tx("Staff chỉ thấy và chấm các đề do mình tạo.")}
                  </Text>
                )}
                <Button
                  w="fit-content"
                  variant="light"
                  component={Link}
                  href="/admin/assessments/new"
                >
                  {tx("Tạo đề và chọn mẫu")}
                </Button>
              </Stack>
            </Card>
          )
        ) : queue.data?.assessmentSubmissions.items.length ? (
          <Stack>
            {queue.data.assessmentSubmissions.items.map((attempt) => (
              <Card key={attempt.id} withBorder>
                <Group justify="space-between">
                  <div>
                    <Text fw={700}>
                      {attempt.learnerName ?? tx("Người học")}
                    </Text>
                    <Text size="sm">
                      {attempt.task.title} · {attempt.learnerId?.slice(0, 8)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {attempt.skill} ·{" "}
                      {attempt.submittedAt
                        ? new Date(attempt.submittedAt).toLocaleString("vi-VN")
                        : ""}{" "}
                      · mã {attempt.id.slice(0, 8)}
                    </Text>
                    <Badge mt="xs">
                      {(isVi ? statusLabels : statusLabelsEn)[attempt.status]}
                    </Badge>
                  </div>
                  <Group>
                    <Button
                      variant="light"
                      onClick={() => setViewResult(attempt.id)}
                    >
                      {tx("Xem bài")}
                    </Button>
                    {(["NEEDS_REVIEW", "FAILED"].includes(attempt.status) ||
                      (admin && attempt.status === "COMPLETED")) && (
                      <Button
                        component={Link}
                        href={`/admin/assessments/submissions/${attempt.id}/grade`}
                      >
                        {attempt.status === "COMPLETED"
                          ? tx("Điều chỉnh điểm")
                          : tx("Chấm bài")}
                      </Button>
                    )}
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card withBorder>
            <Text>
              {tx(
                "Chưa có bài nộp phù hợp bộ lọc. Bài sẽ xuất hiện sau khi người học nộp một đề đã xuất bản.",
              )}
            </Text>
          </Card>
        )}
        <Pagination
          getControlProps={paginationControlProps(isVi)}
          value={page}
          onChange={setPage}
          total={Math.max(
            1,
            (tab === "tasks"
              ? tasks.data?.authoringAssessmentTasks.totalPages
              : queue.data?.assessmentSubmissions.totalPages) ?? 1,
          )}
        />
        <Modal
          opened={Boolean(preview)}
          onClose={() => setPreview(null)}
          title={preview?.title}
          size="lg"
        >
          {preview && (
            <Stack>
              <Badge w="fit-content">
                {preview.skill} · {preview.taskType}
              </Badge>
              <Text fw={700}>{tx("Đề và hướng dẫn")}</Text>
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {preview.instructions}
              </Text>
              <Text fw={700}>{tx("Ghi chú chấm bài")}</Text>
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {preview.rubricNotes ||
                  tx("Chấm theo rubric 4 tiêu chí mặc định.")}
              </Text>
              <Text fw={700}>{tx("Bài tham khảo")}</Text>
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {preview.sampleAnswer || tx("Chưa có bài tham khảo.")}
              </Text>
            </Stack>
          )}
        </Modal>
        <Modal
          opened={Boolean(rejecting)}
          onClose={() => {
            if (!busy) setRejecting(null);
          }}
          title={tx("Yêu cầu chỉnh sửa đề")}
          closeOnClickOutside={!busy}
          closeOnEscape={!busy}
          withCloseButton={!busy}
        >
          <Stack>
            <Textarea
              label={tx("Lý do / nội dung cần sửa")}
              required
              value={note}
              maxLength={4000}
              disabled={busy}
              onChange={(e) => setNote(e.currentTarget.value)}
            />
            {error && <Alert color="red">{error}</Alert>}
            <Button
              color="red"
              loading={busy}
              disabled={!note.trim()}
              onClick={() => {
                if (rejecting) void action(rejecting, "reject");
              }}
            >
              {tx("Trả lại cho người soạn")}
            </Button>
          </Stack>
        </Modal>
        <Modal
          opened={Boolean(viewResult)}
          onClose={() => setViewResult(null)}
          title={tx("Bài nộp và lịch sử")}
          size="xl"
        >
          {viewResult && <AssessmentSubmissionViewer id={viewResult} />}
        </Modal>
      </Stack>
    </Container>
  );
}
