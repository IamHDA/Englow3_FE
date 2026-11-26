import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert } from "react-native";

import { TASK_ERRORS } from "@/features/assessment/admin/labels";
import { TaskChart } from "@/features/assessment/admin/TaskChart";
import { assessmentTemplates } from "@/features/assessment/admin/templates";
import { skillLabel, taskTypeLabel } from "@/features/assessment/report";
import { errorMessage } from "@/lib/errors";
import {
  AssessmentSkill,
  AssessmentTaskPurpose,
  CefrLevel,
  CertificateType,
  useAssessmentAuthoringTaskDetailQuery,
  useAssessmentCreateTaskMutation,
  useAssessmentEditTaskMutation,
  type AssessmentTaskFieldsFragment,
  type AssessmentTaskInput,
} from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  Chip,
  ChipRow,
  Notice,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { OptionPicker } from "@/ui/OptionPicker";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

/** Writing Task 1 - the task type that comes with a chart. */
const TASK_1 = "TASK_1";

/** Creates (`new`) or edits a Writing/Speaking task. As the web's AssessmentTaskEditor. */
export default function AssessmentTaskEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const creating = id === "new";
  const detail = useAssessmentAuthoringTaskDetailQuery({
    variables: { id },
    skip: creating,
    fetchPolicy: "network-only",
  });

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: creating ? "Tạo đề Writing / Speaking" : "Chỉnh sửa đề luyện",
        }}
      />
      {creating ? (
        <TaskForm task={null} />
      ) : (
        <QueryView
          loading={detail.loading}
          error={detail.error}
          data={detail.data?.authoringAssessmentTask}
          onRetry={() => void detail.refetch()}
        >
          {(task) => <TaskForm key={task.version} task={task} />}
        </QueryView>
      )}
    </Screen>
  );
}

function initialInput(task: AssessmentTaskFieldsFragment | null) {
  return {
    skill: task?.skill ?? AssessmentSkill.WRITING,
    title: task?.title ?? "",
    taskType: task?.taskType ?? "TASK_2",
    instructions: task?.instructions ?? "",
    rubricNotes: task?.rubricNotes ?? "",
    sampleAnswer: task?.sampleAnswer ?? "",
    minimumWords: task?.minimumWords ?? 250,
    timeLimitSeconds: task?.timeLimitSeconds ?? 2400,
    targetLevel: task?.targetLevel ?? null,
    purpose: task?.purpose ?? AssessmentTaskPurpose.PRACTICE,
    certificateType: task?.certificateType ?? null,
  } satisfies AssessmentTaskInput;
}

function TaskForm({ task }: { task: AssessmentTaskFieldsFragment | null }) {
  const [value, setValue] = useState<AssessmentTaskInput>(() =>
    initialInput(task),
  );
  const [dirty, setDirty] = useState(false);
  // Changing the chart saves the task on its own and moves its version on.
  const [saved, setSaved] = useState({
    version: task?.version ?? 0,
    imageUrl: task?.imageUrl ?? null,
  });
  const [create] = useAssessmentCreateTaskMutation({
    refetchQueries: ["AssessmentAuthoring"],
  });
  const [edit] = useAssessmentEditTaskMutation({
    refetchQueries: ["AssessmentAuthoring"],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  // Numbers are typed as text and read on save, so a field can be cleared.
  const [minimumWords, setMinimumWords] = useState(String(value.minimumWords));
  const [timeLimit, setTimeLimit] = useState(String(value.timeLimitSeconds));

  function update(patch: Partial<AssessmentTaskInput>) {
    setDirty(true);
    setValue((current) => ({ ...current, ...patch }));
  }

  function applyTemplate(id: string) {
    const template = assessmentTemplates.find((item) => item.id === id);
    if (!template) return;
    const apply = () => {
      setValue({ ...template.input });
      setMinimumWords(String(template.input.minimumWords));
      setTimeLimit(String(template.input.timeLimitSeconds));
      setDirty(true);
    };
    if (!dirty) return apply();
    Alert.alert("Dùng đề mẫu?", "Thay đề mẫu sẽ ghi đè nội dung đang nhập.", [
      { text: "Huỷ", style: "cancel" },
      { text: "Ghi đè", style: "destructive", onPress: apply },
    ]);
  }

  const words = Number(minimumWords);
  const seconds = Number(timeLimit);
  const numbersOk =
    Number.isInteger(words) &&
    words >= 0 &&
    words <= 1000 &&
    Number.isInteger(seconds) &&
    seconds >= 30 &&
    seconds <= 3600;

  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const input: AssessmentTaskInput = {
      ...value,
      minimumWords: words,
      timeLimitSeconds: seconds,
    };
    try {
      const result = task
        ? await edit({
            variables: { id: task.id, version: saved.version, input },
          })
        : await create({ variables: { input } });
      if (!result.data) throw new Error("No result");
      router.back();
    } catch (failure) {
      setError(
        errorMessage(failure, TASK_ERRORS) +
          " Nội dung vẫn được giữ. Nếu đề đã bị thay đổi ở nơi khác, quay lại và tải lại danh sách.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const writing = value.skill === AssessmentSkill.WRITING;
  return (
    <>
      {!task ? (
        <OptionPicker
          label="Điền nhanh từ đề mẫu"
          hint="Chọn mẫu sẽ điền lại các trường bên dưới. Bạn có thể chỉnh sửa trước khi lưu."
          placeholder="Chọn Writing Task 1/2 hoặc Speaking Part 1/2/3"
          value=""
          options={assessmentTemplates.map((template) => ({
            value: template.id,
            label: template.label,
          }))}
          onChange={applyTemplate}
          disabled={busy}
        />
      ) : null}

      <AppText variant="label">Kỹ năng</AppText>
      <ChipRow>
        {[AssessmentSkill.WRITING, AssessmentSkill.SPEAKING].map((skill) => (
          <Chip
            key={skill}
            label={skillLabel(skill)}
            selected={value.skill === skill}
            onPress={() => {
              if (busy || task || value.skill === skill) return;
              const isWriting = skill === AssessmentSkill.WRITING;
              update({
                skill,
                taskType: isWriting ? "TASK_2" : "PART_2",
                // Only a spoken task can be the level check's spoken part.
                purpose: AssessmentTaskPurpose.PRACTICE,
              });
              setMinimumWords(isWriting ? "250" : "0");
              setTimeLimit(isWriting ? "2400" : "120");
            }}
          />
        ))}
      </ChipRow>
      {task ? (
        <AppText variant="caption" tone="muted">
          Không đổi được kỹ năng của đề đã tạo.
        </AppText>
      ) : null}

      <AppText variant="label" style={{ marginTop: spacing.sm }}>
        Dạng bài
      </AppText>
      <ChipRow>
        {(writing ? ["TASK_1", "TASK_2"] : ["PART_1", "PART_2", "PART_3"]).map(
          (type) => (
            <Chip
              key={type}
              label={taskTypeLabel(type)}
              selected={value.taskType === type}
              onPress={() => !busy && update({ taskType: type })}
            />
          ),
        )}
      </ChipRow>

      <TextField
        label="Tên đề"
        value={value.title}
        onChangeText={(title) => update({ title })}
        maxLength={200}
        editable={!busy}
      />
      <TextField
        label="Đề và hướng dẫn"
        hint="Người học sẽ thấy nội dung này trước khi làm bài. Với Task 1, cung cấp đầy đủ số liệu hoặc mô tả nguồn trong đề."
        value={value.instructions}
        onChangeText={(instructions) => update({ instructions })}
        maxLength={12_000}
        multiline
        editable={!busy}
        style={{ minHeight: 160 }}
      />

      {writing && value.taskType === TASK_1 ? (
        task ? (
          <TaskChart
            taskId={task.id}
            imageUrl={saved.imageUrl}
            disabled={busy}
            onChange={(change) =>
              setSaved({
                version: change.version,
                imageUrl: change.imageUrl ?? null,
              })
            }
          />
        ) : (
          <AppText
            variant="caption"
            tone="muted"
            style={{ marginBottom: spacing.md }}
          >
            Lưu đề trước, sau đó mở lại để tải ảnh biểu đồ.
          </AppText>
        )
      ) : null}

      <Row gap={spacing.sm}>
        <TextField
          label="Số từ khuyến nghị"
          value={minimumWords}
          onChangeText={(text) => {
            setDirty(true);
            setMinimumWords(text.replace(/\D/g, ""));
          }}
          keyboardType="number-pad"
          editable={!busy}
          error={
            Number.isInteger(words) && words <= 1000 ? undefined : "0–1000"
          }
          style={{ minWidth: 140 }}
        />
        <TextField
          label="Thời gian gợi ý (giây)"
          value={timeLimit}
          onChangeText={(text) => {
            setDirty(true);
            setTimeLimit(text.replace(/\D/g, ""));
          }}
          keyboardType="number-pad"
          editable={!busy}
          error={
            Number.isInteger(seconds) && seconds >= 30 && seconds <= 3600
              ? undefined
              : "30–3600"
          }
          style={{ minWidth: 140 }}
        />
      </Row>

      <AppText variant="label">Trình độ CEFR</AppText>
      <AppText variant="caption" tone="muted">
        Lộ trình chọn đề theo trình độ.
      </AppText>
      <ChipRow>
        <Chip
          label="Không đặt"
          selected={!value.targetLevel}
          onPress={() => update({ targetLevel: null })}
        />
        {Object.values(CefrLevel).map((level) => (
          <Chip
            key={level}
            label={level}
            selected={value.targetLevel === level}
            onPress={() => update({ targetLevel: level })}
          />
        ))}
      </ChipRow>

      <AppText variant="label" style={{ marginTop: spacing.sm }}>
        Mục đích
      </AppText>
      <AppText variant="caption" tone="muted">
        Đề đo trình độ không hiện trong thư viện luyện tập.
      </AppText>
      <ChipRow>
        <Chip
          label="Luyện tập"
          selected={value.purpose !== AssessmentTaskPurpose.LEVEL_CHECK}
          onPress={() => update({ purpose: AssessmentTaskPurpose.PRACTICE })}
        />
        {!writing ? (
          <Chip
            label="Phần nói của bài đo trình độ"
            selected={value.purpose === AssessmentTaskPurpose.LEVEL_CHECK}
            onPress={() =>
              update({ purpose: AssessmentTaskPurpose.LEVEL_CHECK })
            }
          />
        ) : null}
      </ChipRow>

      <AppText variant="label" style={{ marginTop: spacing.sm }}>
        Chứng chỉ (tùy chọn)
      </AppText>
      <ChipRow>
        <Chip
          label="Không"
          selected={!value.certificateType}
          onPress={() => update({ certificateType: null })}
        />
        {Object.values(CertificateType).map((type) => (
          <Chip
            key={type}
            label={type}
            selected={value.certificateType === type}
            onPress={() => update({ certificateType: type })}
          />
        ))}
      </ChipRow>

      <TextField
        label="Ghi chú chấm bài"
        hint="Chỉ người soạn, người duyệt và bộ chấm xem trước khi nộp; không thay đổi 4 tiêu chí của rubric."
        value={value.rubricNotes ?? ""}
        onChangeText={(rubricNotes) => update({ rubricNotes })}
        maxLength={8000}
        multiline
        editable={!busy}
      />
      <TextField
        label="Bài tham khảo"
        hint="Chỉ hiện cho người học sau khi đã có kết quả."
        value={value.sampleAnswer ?? ""}
        onChangeText={(sampleAnswer) => update({ sampleAnswer })}
        maxLength={12_000}
        multiline
        editable={!busy}
      />
      <AppText
        variant="caption"
        tone="muted"
        style={{ marginBottom: spacing.md }}
      >
        Đề được lưu thành bản nháp. Gửi duyệt sau khi kiểm tra; admin sẽ quyết
        định xuất bản.
      </AppText>
      <Notice message={error} />
      <Button
        title="Lưu đề"
        loading={busy}
        disabled={
          !value.title.trim() || !value.instructions.trim() || !numbersOk
        }
        onPress={() => void save()}
      />
    </>
  );
}
