"use client";
import { useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Stack,
  Switch,
  Text,
  Textarea,
} from "@mantine/core";
import {
  useTutorPolicyQuery,
  useUpdateTutorPolicyMutation,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function TutorPolicyControls() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const query = useTutorPolicyQuery({ fetchPolicy: "network-only" });
  const [save, mutation] = useUpdateTutorPolicyMutation();
  const [edit, setEdit] = useState<{
    accepting: boolean;
    allowedModes: string[];
    version: number;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const guard = useRef(false);
  const policy = query.data?.tutorPolicy;
  const value = edit ?? policy;
  async function submit() {
    if (!edit || guard.current) return;
    guard.current = true;
    setError(false);
    setSaved(false);
    try {
      await save({ variables: { input: { ...edit, reason: reason.trim() } } });
      setEdit(null);
      setReason("");
      setSaved(true);
      await query.refetch();
    } catch {
      setError(true);
    } finally {
      guard.current = false;
    }
  }
  return (
    <Card withBorder radius="md">
      <Stack>
        <Group justify="space-between">
          <Text fw={700}>
            {tr("Điều khiển Gia sư AI", "Tutor availability")}
          </Text>
          <Button
            variant="default"
            mih={44}
            loading={query.loading}
            disabled={mutation.loading}
            onClick={() =>
              void query
                .refetch()
                .then(() => {
                  setEdit(null);
                  setError(false);
                  setSaved(false);
                })
                .catch(() => setError(true))
            }
          >
            {tr("Tải cấu hình hiện tại", "Load current settings")}
          </Button>
        </Group>
        {(query.error || error) && (
          <Alert color="orange">
            {tr(
              "Chưa lưu được cấu hình. Bản nháp vẫn được giữ; nếu có Admin khác vừa sửa, hãy tải cấu hình hiện tại rồi nhập lại thay đổi.",
              "Could not save settings. Your draft is kept. If another administrator changed them, load current settings and reapply your changes.",
            )}
          </Alert>
        )}
        {saved && (
          <Alert color="brand">
            {tr("Đã lưu cấu hình.", "Settings saved.")}
          </Alert>
        )}
        {policy && value && (
          <>
            {!policy.environmentEnabled && (
              <Alert color="orange">
                {tr(
                  "AI đang tắt trong cấu hình triển khai. Bật tiếp nhận ở đây chưa đủ để khởi chạy dịch vụ.",
                  "AI is disabled in deployment configuration. Admission settings alone cannot enable the service.",
                )}
              </Alert>
            )}
            <Switch
              label={tr(
                "Tiếp nhận câu hỏi và phiên âm mới",
                "Accept new questions and transcriptions",
              )}
              checked={value.accepting}
              disabled={mutation.loading}
              onChange={(e) => {
                setSaved(false);
                setEdit({
                  allowedModes: value.allowedModes,
                  version: value.version,
                  accepting: e.currentTarget.checked,
                });
              }}
            />
            <Text size="sm" c="dimmed">
              {tr(
                "Tạm dừng vẫn giữ lịch sử và để các yêu cầu đã nhận hoàn tất. Các chế độ áp dụng cho cả hỏi tiếp trong hội thoại cũ.",
                "Pausing preserves history and allows accepted requests to finish. Mode settings also apply to follow-ups in existing conversations.",
              )}
            </Text>
            <Checkbox.Group
              label={tr("Chế độ được sử dụng", "Available learning modes")}
              value={value.allowedModes}
              onChange={(allowedModes) => {
                setSaved(false);
                setEdit({
                  accepting: value.accepting,
                  version: value.version,
                  allowedModes,
                });
              }}
            >
              <Group mt="xs">
                {[
                  ["GENERAL", tr("Hỏi đáp", "Questions")],
                  ["CORRECTION", tr("Sửa câu", "Correction")],
                  ["CONVERSATION", tr("Hội thoại", "Conversation")],
                  ["PRACTICE", tr("Luyện tập", "Practice")],
                ].map(([mode, label]) => (
                  <Checkbox
                    key={mode}
                    value={mode}
                    label={label}
                    disabled={mutation.loading}
                  />
                ))}
              </Group>
            </Checkbox.Group>
            <Group gap="xs">
              <Badge variant="light">
                {policy.model ||
                  tr("Chưa cấu hình model", "Model not configured")}
              </Badge>
              <Text size="xs" c="dimmed">
                {tr("Hạn mức AI dùng chung", "Shared AI allowance")}:{" "}
                {policy.dailyLimit}/{tr("ngày", "day")}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {tr(
                "Model, hạn mức, streaming và voice do cấu hình triển khai quản lý.",
                "Model, limits, streaming and voice are managed by deployment configuration.",
              )}
            </Text>
            <Textarea
              label={tr("Lý do thay đổi", "Reason for change")}
              minRows={2}
              maxLength={500}
              value={reason}
              disabled={mutation.loading}
              onChange={(e) => setReason(e.currentTarget.value)}
            />
            <Button
              mih={44}
              loading={mutation.loading}
              disabled={
                !edit ||
                reason.trim().length < 5 ||
                (value.accepting && value.allowedModes.length === 0)
              }
              onClick={() => void submit()}
            >
              {tr("Lưu điều khiển Tutor", "Save Tutor settings")}
            </Button>
          </>
        )}
      </Stack>
    </Card>
  );
}
