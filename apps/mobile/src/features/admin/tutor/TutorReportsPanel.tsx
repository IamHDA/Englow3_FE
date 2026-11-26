import { useState } from "react";
import { View } from "react-native";

import { formatDateTime } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  useReviewTutorReportMutation,
  useTutorReportsQuery,
  useTutorStaffMembersQuery,
  type TutorReportsQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Notice,
  Pager,
  Row,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

import {
  REPORT_STATUSES,
  TUTOR_ADMIN_ERRORS,
  TUTOR_STATUS_LABELS,
} from "./labels";

type Report = TutorReportsQuery["tutorReports"]["items"][number];

/**
 * Reported tutor answers. Staff see the reports assigned to them and propose
 * a correction; an administrator assigns, then resolves a proposal or
 * dismisses the report. As the web's TutorManagementView, reports tab.
 */
export function TutorReportsPanel({ admin }: { admin: boolean }) {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const reports = useTutorReportsQuery({
    variables: { status, page },
    fetchPolicy: "cache-and-network",
  });

  return (
    <View>
      <ChipRow>
        <Chip
          label="Tất cả"
          selected={status === ""}
          onPress={() => {
            setStatus("");
            setPage(0);
          }}
        />
        {REPORT_STATUSES.map((value) => (
          <Chip
            key={value}
            label={TUTOR_STATUS_LABELS[value] ?? value}
            selected={status === value}
            onPress={() => {
              setStatus(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <QueryView
        loading={reports.loading}
        error={reports.error}
        data={reports.data?.tutorReports}
        onRetry={() => void reports.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="checkmark-done-outline"
            title={
              admin
                ? "Chưa có báo cáo phù hợp bộ lọc"
                : "Chưa có báo cáo nào được phân công cho bạn"
            }
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((report) =>
              openId === report.id ? (
                <ReportReview
                  key={report.id}
                  report={report}
                  admin={admin}
                  onClose={() => setOpenId(null)}
                  onChanged={() => void reports.refetch()}
                />
              ) : (
                <Card
                  key={report.id}
                  style={{ marginBottom: spacing.sm }}
                  onPress={() => setOpenId(report.id)}
                >
                  <Row style={{ justifyContent: "space-between" }}>
                    <AppText variant="caption" tone="muted">
                      {formatDateTime(report.createdAt)}
                    </AppText>
                    <Badge
                      label={
                        TUTOR_STATUS_LABELS[report.status] ?? report.status
                      }
                      tone={
                        ["RESOLVED", "DISMISSED"].includes(report.status)
                          ? "neutral"
                          : "accent"
                      }
                    />
                  </Row>
                  <AppText numberOfLines={2} style={{ marginTop: spacing.xs }}>
                    {report.question}
                  </AppText>
                  <AppText variant="caption" tone="primary">
                    Xem báo cáo
                  </AppText>
                </Card>
              ),
            )}
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              onChange={(next) => {
                setPage(next);
                setOpenId(null);
              }}
            />
          </>
        )}
      </QueryView>
    </View>
  );
}

function ReportReview({
  report,
  admin,
  onClose,
  onChanged,
}: {
  report: Report;
  admin: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [review, state] = useReviewTutorReportMutation();
  const staff = useTutorStaffMembersQuery({
    skip: !admin,
    fetchPolicy: "cache-and-network",
  });
  const [assignee, setAssignee] = useState(report.assignedTo ?? null);
  const [note, setNote] = useState(report.reviewerNote ?? "");
  const [correction, setCorrection] = useState(report.correction ?? "");
  const [error, setError] = useState<string | null>(null);
  const closed = ["RESOLVED", "DISMISSED"].includes(report.status);
  const busy = state.loading;

  async function act(input: {
    action: string;
    note?: string;
    correction?: string;
    assignedTo?: string | null;
  }) {
    if (busy) return;
    setError(null);
    try {
      await review({ variables: { id: report.id, input } });
      onChanged();
    } catch (failure) {
      setError(
        errorMessage(failure, TUTOR_ADMIN_ERRORS) +
          " Nội dung đang nhập vẫn được giữ.",
      );
    }
  }

  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Badge label={TUTOR_STATUS_LABELS[report.status] ?? report.status} />
        <Button title="Thu gọn" size="sm" variant="ghost" onPress={onClose} />
      </Row>
      <AppText variant="label" style={{ marginTop: spacing.sm }}>
        Câu hỏi liên quan
      </AppText>
      <AppText selectable>{report.question}</AppText>
      <AppText variant="label" style={{ marginTop: spacing.sm }}>
        Câu trả lời được báo cáo
      </AppText>
      <AppText selectable>{report.answer}</AppText>
      <AppText variant="caption" style={{ marginTop: spacing.sm }}>
        Phản ánh của người học: {report.learnerNote || "Không có ghi chú"}
      </AppText>
      <Notice message={error} />

      {closed ? (
        <View style={{ marginTop: spacing.sm }}>
          <Notice tone="info" message={report.reviewerNote ?? "Đã xử lý."} />
          {report.correction ? (
            <AppText selectable>{report.correction}</AppText>
          ) : null}
        </View>
      ) : (
        <View style={{ marginTop: spacing.md }}>
          {admin ? (
            <>
              <AppText variant="label">Người phụ trách</AppText>
              {staff.error && !staff.data ? (
                <Notice message="Chưa tải được danh sách người phụ trách." />
              ) : null}
              <ChipRow>
                {(staff.data?.tutorStaffMembers ?? []).map((user) => (
                  <Chip
                    key={user.id}
                    label={user.displayName}
                    selected={assignee === user.id}
                    onPress={() => setAssignee(user.id)}
                  />
                ))}
              </ChipRow>
              <Button
                title="Phân công"
                size="sm"
                variant="secondary"
                disabled={!assignee || busy}
                onPress={() =>
                  void act({ action: "ASSIGN", assignedTo: assignee })
                }
              />
            </>
          ) : null}
          <TextField
            label="Nhận xét xử lý"
            value={note}
            onChangeText={setNote}
            maxLength={2000}
            multiline
            style={{ minHeight: 80 }}
          />
          <TextField
            label="Đề xuất đính chính (nếu cần)"
            value={correction}
            onChangeText={setCorrection}
            maxLength={8000}
            multiline
          />
          <Row wrap gap={spacing.xs}>
            {["ASSIGNED", "PROPOSED"].includes(report.status) ? (
              <Button
                title="Lưu đề xuất"
                size="sm"
                disabled={!note.trim() || busy}
                onPress={() =>
                  void act({ action: "PROPOSE", note, correction })
                }
              />
            ) : null}
            {admin ? (
              <>
                <Button
                  title="Duyệt kết luận"
                  size="sm"
                  variant="secondary"
                  disabled={
                    !note.trim() || report.status !== "PROPOSED" || busy
                  }
                  onPress={() => void act({ action: "RESOLVE", note })}
                />
                <Button
                  title="Đóng và ghi lý do"
                  size="sm"
                  variant="danger"
                  disabled={!note.trim() || busy}
                  onPress={() => void act({ action: "DISMISS", note })}
                />
              </>
            ) : null}
          </Row>
        </View>
      )}
    </Card>
  );
}
