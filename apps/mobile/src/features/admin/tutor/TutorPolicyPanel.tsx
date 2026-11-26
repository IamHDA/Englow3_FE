import { useRef, useState } from "react";
import { Switch, View } from "react-native";

import { errorMessage } from "@/lib/errors";
import {
  useTutorOperationsQuery,
  useTutorPolicyQuery,
  useUpdateTutorPolicyMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Choice,
  Notice,
  Row,
  TextField,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

import { TUTOR_ADMIN_ERRORS } from "./labels";

const MODES: [string, string][] = [
  ["GENERAL", "Hỏi đáp"],
  ["CORRECTION", "Sửa câu"],
  ["CONVERSATION", "Hội thoại"],
  ["PRACTICE", "Luyện tập"],
];

type Draft = { accepting: boolean; allowedModes: string[]; version: number };

/** Whether the tutor takes new questions and in which modes. Administrators only. */
export function TutorPolicyPanel() {
  const query = useTutorPolicyQuery({ fetchPolicy: "network-only" });
  const [save, mutation] = useUpdateTutorPolicyMutation();
  const [edit, setEdit] = useState<Draft | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const guard = useRef(false);
  const policy = query.data?.tutorPolicy;
  const value = edit ?? policy;

  async function submit() {
    if (!edit || guard.current) return;
    guard.current = true;
    setError(null);
    setSaved(false);
    try {
      await save({ variables: { input: { ...edit, reason: reason.trim() } } });
      setEdit(null);
      setReason("");
      setSaved(true);
      await query.refetch();
    } catch (failure) {
      setError(
        errorMessage(failure, TUTOR_ADMIN_ERRORS) + " Bản nháp vẫn được giữ.",
      );
    } finally {
      guard.current = false;
    }
  }

  function change(next: Partial<Draft>) {
    if (!value) return;
    setSaved(false);
    setEdit({
      accepting: value.accepting,
      allowedModes: value.allowedModes,
      version: value.version,
      ...next,
    });
  }

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Row style={{ justifyContent: "space-between" }}>
        <AppText variant="label">Điều khiển Gia sư AI</AppText>
        <Button
          title="Tải cấu hình"
          size="sm"
          variant="ghost"
          loading={query.loading}
          disabled={mutation.loading}
          onPress={() =>
            void query
              .refetch()
              .then(() => {
                setEdit(null);
                setError(null);
                setSaved(false);
              })
              .catch(() => setError("Chưa tải được cấu hình."))
          }
        />
      </Row>
      <Notice
        message={query.error && !policy ? "Chưa tải được cấu hình." : error}
      />
      {saved ? <Notice tone="success" message="Đã lưu cấu hình." /> : null}
      {policy && value ? (
        <>
          {!policy.environmentEnabled ? (
            <Notice message="AI đang tắt trong cấu hình triển khai. Bật tiếp nhận ở đây chưa đủ để khởi chạy dịch vụ." />
          ) : null}
          <Row
            style={{
              justifyContent: "space-between",
              marginVertical: spacing.sm,
            }}
          >
            <AppText style={{ flex: 1 }}>
              Tiếp nhận câu hỏi và phiên âm mới
            </AppText>
            <Switch
              value={value.accepting}
              disabled={mutation.loading}
              onValueChange={(accepting) => change({ accepting })}
              trackColor={{ true: colors.primary }}
              accessibilityLabel="Tiếp nhận câu hỏi và phiên âm mới"
            />
          </Row>
          <AppText variant="caption" tone="muted">
            Tạm dừng vẫn giữ lịch sử và để các yêu cầu đã nhận hoàn tất. Các chế
            độ áp dụng cho cả hỏi tiếp trong hội thoại cũ.
          </AppText>
          <AppText variant="label" style={{ marginTop: spacing.md }}>
            Chế độ được sử dụng
          </AppText>
          <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
            {MODES.map(([mode, label]) => {
              const on = value.allowedModes.includes(mode);
              return (
                <Choice
                  key={mode}
                  label={label}
                  selected={on}
                  onPress={() =>
                    change({
                      allowedModes: on
                        ? value.allowedModes.filter((item) => item !== mode)
                        : [...value.allowedModes, mode],
                    })
                  }
                />
              );
            })}
          </View>
          <Row wrap gap={spacing.sm} style={{ marginVertical: spacing.sm }}>
            <Badge
              label={policy.model || "Chưa cấu hình model"}
              tone="neutral"
            />
            <AppText variant="caption" tone="muted">
              Hạn mức AI dùng chung: {policy.dailyLimit}/ngày
            </AppText>
          </Row>
          <AppText variant="caption" tone="muted">
            Model, hạn mức, streaming và voice do cấu hình triển khai quản lý.
          </AppText>
          <TextField
            label="Lý do thay đổi"
            value={reason}
            onChangeText={setReason}
            maxLength={500}
            multiline
            editable={!mutation.loading}
            style={{ minHeight: 70 }}
          />
          <Button
            title="Lưu điều khiển Tutor"
            loading={mutation.loading}
            disabled={
              !edit ||
              reason.trim().length < 5 ||
              (value.accepting && value.allowedModes.length === 0)
            }
            onPress={() => void submit()}
          />
        </>
      ) : null}
    </Card>
  );
}

function seconds(ms?: number | null) {
  return ms == null ? "Chưa có mẫu" : `${(ms / 1000).toFixed(1)} s`;
}

/** The shared AI queue (tutor, writing and speaking): counts and today's latency. */
export function TutorOperationsPanel() {
  const operations = useTutorOperationsQuery({
    fetchPolicy: "cache-and-network",
  });
  const data = operations.data?.tutorOperations;
  const metrics = data?.metrics;

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Row style={{ justifyContent: "space-between" }}>
        <AppText variant="label">Hàng đợi AI dùng chung</AppText>
        <Button
          title="Cập nhật"
          size="sm"
          variant="ghost"
          loading={operations.loading}
          onPress={() => void operations.refetch().catch(() => undefined)}
        />
      </Row>
      {operations.error && !data ? (
        <Notice message="Chưa tải được trạng thái hàng đợi." />
      ) : null}
      {data ? (
        <Row
          wrap
          style={{ justifyContent: "space-between", marginTop: spacing.sm }}
        >
          <Stat label="Đang chờ" value={data.pending} />
          <Stat label="Đang xử lý" value={data.running} />
          <Stat label="Xong hôm nay" value={data.completedToday} />
          <Stat label="Lỗi hôm nay" value={data.failedToday} />
        </Row>
      ) : null}
      {metrics ? (
        <View style={{ marginTop: spacing.sm, gap: 2 }}>
          <AppText variant="caption">
            Chờ hàng đợi p95: {seconds(metrics.queueP95Ms)} · Hoàn tất p95:{" "}
            {seconds(metrics.completionP95Ms)}
          </AppText>
          <AppText variant="caption">
            Token đã biết (vào/ra):{" "}
            {metrics.knownInputTokens.toLocaleString("vi-VN")} /{" "}
            {metrics.knownOutputTokens.toLocaleString("vi-VN")} · Thiếu usage:{" "}
            {metrics.unknownUsageJobs}
          </AppText>
          <AppText variant="caption" tone="muted">
            Thống kê từ đầu ngày. p95 hoàn tất tính cả thời gian chờ. Token
            thiếu không được tính là 0.
          </AppText>
          {metrics.failures.length > 0 ? (
            <View style={{ marginTop: spacing.xs }}>
              <AppText variant="caption" tone="danger">
                Mã lỗi cuối cùng:
              </AppText>
              {metrics.failures.map((failure) => (
                <AppText key={failure.code} variant="caption" tone="danger">
                  {failure.code} · {failure.count}
                </AppText>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <AppText variant="caption" tone="faint" style={{ marginTop: spacing.xs }}>
        Gồm Tutor, Viết và Nói trong cùng môi trường; không hiển thị nội dung
        riêng tư.
      </AppText>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: "center", minWidth: 70 }}>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}
