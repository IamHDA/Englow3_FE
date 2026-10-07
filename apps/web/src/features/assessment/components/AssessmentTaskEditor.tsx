"use client";
import { useAssessmentText } from "../hooks/useAssessmentText";
import {
  Alert,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useRef, useState } from "react";
import {
  AssessmentSkill,
  type AssessmentTaskInput,
} from "@/lib/graphql/generated";
import {
  useAssessmentCreateTaskMutation,
  useAssessmentEditTaskMutation,
} from "@/lib/graphql/generated/hooks";
import type { PracticeTask } from "../types";
import { assessmentTemplates } from "../templates";
import { useRecoverableForm } from "@/shared/hooks/useRecoverableForm";
import { EditorFrame } from "@/shared/components/EditorFrame";
import { notifications } from "@mantine/notifications";
export function AssessmentTaskEditor({
  task,
  close,
  done,
  standalone = false,
}: {
  standalone?: boolean;
  task: PracticeTask | null;
  close: () => void;
  done: () => Promise<unknown>;
}) {
  const tx = useAssessmentText();
  const draft = useRecoverableForm<AssessmentTaskInput>(
    `task:${task?.id ?? "new"}:${task?.version ?? 0}`,
    {
      skill: task?.skill ?? AssessmentSkill.WRITING,
      title: task?.title ?? "",
      taskType: task?.taskType ?? "TASK_2",
      instructions: task?.instructions ?? "",
      rubricNotes: task?.rubricNotes ?? "",
      sampleAnswer: task?.sampleAnswer ?? "",
      minimumWords: task?.minimumWords ?? 250,
      timeLimitSeconds: task?.timeLimitSeconds ?? 2400,
    },
  );
  const { value, setValue } = draft;
  const requestClose = () => {
    if (!busy) draft.confirmClose(close);
  };
  const [create] = useAssessmentCreateTaskMutation();
  const [edit] = useAssessmentEditTaskMutation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  function field<K extends keyof AssessmentTaskInput>(
    key: K,
    next: AssessmentTaskInput[K],
  ) {
    setValue((v) => ({ ...v, [key]: next }));
  }
  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const r = task
        ? await edit({
            variables: { id: task.id, version: task.version, input: value },
          })
        : await create({ variables: { input: value } });
      if (!r.data) throw new Error("No result");
      draft.markSaved();
      notifications.show({
        color: "teal",
        message: tx("Đã lưu đề vào bản nháp."),
      });
      close();
      await done().catch(() =>
        notifications.show({
          color: "orange",
          message: tx("Đề đã lưu nhưng danh sách chưa cập nhật. Hãy tải lại."),
        }),
      );
    } catch {
      setError(
        tx(
          "Chưa lưu được đề. Nội dung vẫn được giữ. Nếu đề đã bị thay đổi ở tab khác, đóng cửa sổ và tải lại danh sách.",
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <EditorFrame
      onClose={requestClose}
      busy={busy}
      standalone={standalone}
      title={task ? tx("Chỉnh sửa đề luyện") : tx("Tạo đề Writing / Speaking")}
    >
      <Stack>
        {draft.restored && (
          <Alert color="blue">
            {tx("Đã khôi phục bản nháp trên thiết bị. Chưa lưu lên máy chủ.")}
          </Alert>
        )}
        {draft.storageError && (
          <Alert color="orange">
            {tx(
              "Không lưu được nháp trên thiết bị. Hãy lưu đề trước khi rời trang.",
            )}
          </Alert>
        )}
        {!task && (
          <Select
            label={tx("Điền nhanh từ đề mẫu")}
            description={tx(
              "Chọn mẫu sẽ điền lại các trường bên dưới. Bạn có thể chỉnh sửa trước khi lưu.",
            )}
            placeholder={tx("Chọn Writing Task 1/2 hoặc Speaking Part 1/2/3")}
            data={assessmentTemplates.map((template) => ({
              value: template.id,
              label: tx(template.label),
            }))}
            disabled={busy}
            onChange={(id) => {
              const template = assessmentTemplates.find(
                (item) => item.id === id,
              );
              if (
                template &&
                (!draft.dirty ||
                  window.confirm(
                    tx("Thay đề mẫu sẽ ghi đè nội dung đang nhập. Tiếp tục?"),
                  ))
              )
                setValue({ ...template.input });
            }}
          />
        )}
        <Select
          label={tx("Kỹ năng")}
          data={[
            { value: AssessmentSkill.WRITING, label: "Writing" },
            { value: AssessmentSkill.SPEAKING, label: "Speaking" },
          ]}
          value={value.skill}
          disabled={busy || Boolean(task)}
          onChange={(v) => {
            if (v)
              setValue((current) => ({
                ...current,
                skill: v as AssessmentSkill,
                taskType: v === "WRITING" ? "TASK_2" : "PART_2",
                minimumWords: v === "WRITING" ? 250 : 0,
                timeLimitSeconds: v === "WRITING" ? 2400 : 120,
              }));
          }}
        />
        <Select
          label={tx("Dạng bài")}
          data={
            value.skill === AssessmentSkill.WRITING
              ? ["TASK_1", "TASK_2"]
              : ["PART_1", "PART_2", "PART_3"]
          }
          value={value.taskType}
          disabled={busy}
          onChange={(v) => {
            if (v) field("taskType", v);
          }}
        />
        <TextInput
          label={tx("Tên đề")}
          required
          maxLength={200}
          value={value.title}
          disabled={busy}
          onChange={(e) => field("title", e.currentTarget.value)}
        />
        <Textarea
          label={tx("Đề và hướng dẫn")}
          description={tx(
            "Người học sẽ thấy nội dung này trước khi làm bài. Với Task 1, cung cấp đầy đủ số liệu hoặc mô tả nguồn trong đề.",
          )}
          required
          minRows={5}
          maxLength={12000}
          value={value.instructions}
          disabled={busy}
          onChange={(e) => field("instructions", e.currentTarget.value)}
        />
        <Group grow>
          <NumberInput
            label={tx("Số từ khuyến nghị")}
            min={0}
            max={1000}
            value={value.minimumWords}
            disabled={busy}
            onChange={(v) => field("minimumWords", Number(v) || 0)}
          />
          <NumberInput
            label={tx("Thời gian gợi ý (giây)")}
            min={30}
            max={3600}
            value={value.timeLimitSeconds}
            disabled={busy}
            onChange={(v) => field("timeLimitSeconds", Number(v) || 0)}
          />
        </Group>
        <Textarea
          label={tx("Ghi chú chấm bài")}
          description={tx(
            "Chỉ người soạn, người duyệt và bộ chấm xem trước khi nộp; không thay đổi 4 tiêu chí của rubric.",
          )}
          minRows={3}
          maxLength={8000}
          value={value.rubricNotes ?? ""}
          disabled={busy}
          onChange={(e) => field("rubricNotes", e.currentTarget.value)}
        />
        <Textarea
          label={tx("Bài tham khảo")}
          description={tx("Chỉ hiện cho người học sau khi đã có kết quả.")}
          minRows={4}
          maxLength={12000}
          value={value.sampleAnswer ?? ""}
          disabled={busy}
          onChange={(e) => field("sampleAnswer", e.currentTarget.value)}
        />
        <Text size="xs" c="dimmed">
          {tx(
            "Đề được lưu thành bản nháp. Gửi duyệt sau khi kiểm tra; admin sẽ quyết định xuất bản.",
          )}
        </Text>
        {error && <Alert color="red">{error}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" disabled={busy} onClick={requestClose}>
            {tx("Hủy")}
          </Button>
          <Button
            loading={busy}
            disabled={
              !value.title.trim() ||
              !value.instructions.trim() ||
              value.timeLimitSeconds < 30
            }
            onClick={() => void save()}
          >
            {tx("Lưu đề")}
          </Button>
        </Group>
      </Stack>
    </EditorFrame>
  );
}
