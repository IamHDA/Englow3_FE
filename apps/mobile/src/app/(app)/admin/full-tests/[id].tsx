import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";

import {
  FULL_TEST_DESCRIPTION_MAX_LENGTH,
  FULL_TEST_ERRORS,
  FULL_TEST_TITLE_MAX_LENGTH,
  IELTS_CERTIFICATE,
  SLOT_TASKS,
} from "@/features/admin/fullTestAdmin";
import { SLOT_LABELS } from "@/features/fullTest/labels";
import { errorMessage } from "@/lib/errors";
import {
  CertificateVariant,
  FullTestSlot,
  useAdminFullTestsQuery,
  useFullTestComponentsQuery,
  useSaveFullTestMutation,
  type AdminFullTestFieldsFragment,
  type FullTestComponentsQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  Choice,
  ErrorState,
  LoadingState,
  Notice,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { OptionPicker, type PickerOption } from "@/ui/OptionPicker";
import { spacing } from "@/ui/theme";

type Values = {
  title: string;
  description: string;
  certificateVariant: CertificateVariant;
  examId: string;
  writingTask1Id: string;
  writingTask2Id: string;
  speakingPart1Id: string;
  speakingPart2Id: string;
  speakingPart3Id: string;
};

const EMPTY: Values = {
  title: "",
  description: "",
  certificateVariant: CertificateVariant.ACADEMIC,
  examId: "",
  writingTask1Id: "",
  writingTask2Id: "",
  speakingPart1Id: "",
  speakingPart2Id: "",
  speakingPart3Id: "",
};

function valuesOf(fullTest: AdminFullTestFieldsFragment): Values {
  return {
    title: fullTest.title,
    description: fullTest.description,
    certificateVariant:
      fullTest.certificateVariant === CertificateVariant.GENERAL
        ? CertificateVariant.GENERAL
        : CertificateVariant.ACADEMIC,
    examId: fullTest.examId,
    writingTask1Id: fullTest.writingTask1Id,
    writingTask2Id: fullTest.writingTask2Id,
    speakingPart1Id: fullTest.speakingPart1Id,
    speakingPart2Id: fullTest.speakingPart2Id,
    speakingPart3Id: fullTest.speakingPart3Id,
  };
}

/** Creates (`new`) or edits a draft full test. As the web's FullTestForm. */
export default function FullTestEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const creating = id === "new";
  const list = useAdminFullTestsQuery({
    skip: creating,
    fetchPolicy: "cache-first",
  });
  const components = useFullTestComponentsQuery({
    fetchPolicy: "cache-and-network",
  });
  const existing = list.data?.adminFullTests.find((item) => item.id === id);

  let body;
  if (!creating && !existing) {
    body = list.loading ? (
      <LoadingState />
    ) : (
      <ErrorState
        message="Không tìm thấy full test này."
        onRetry={() => void list.refetch()}
      />
    );
  } else {
    body = (
      <FullTestForm
        key={existing?.version ?? "new"}
        fullTest={existing ?? null}
        components={components.data}
        componentsFailed={Boolean(components.error) && !components.data}
      />
    );
  }

  return (
    <Screen>
      <Stack.Screen
        options={{ title: creating ? "Tạo full test" : "Sửa full test" }}
      />
      {body}
    </Screen>
  );
}

/** Keeps a saved pick visible even when it is no longer a published component. */
function withCurrent(options: PickerOption[], current: string) {
  return !current || options.some((option) => option.value === current)
    ? options
    : [{ value: current, label: "(không còn là đề đã phát hành)" }, ...options];
}

function FullTestForm({
  fullTest,
  components,
  componentsFailed,
}: {
  fullTest: AdminFullTestFieldsFragment | null;
  components: FullTestComponentsQuery | undefined;
  componentsFailed: boolean;
}) {
  const [values, setValues] = useState<Values>(
    fullTest ? valuesOf(fullTest) : EMPTY,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>(
    {},
  );
  const [failure, setFailure] = useState<string | null>(null);
  const [save, saving] = useSaveFullTestMutation({
    refetchQueries: ["AdminFullTests"],
  });
  const pending = useRef(false);

  const set = (patch: Partial<Values>) =>
    setValues((current) => ({ ...current, ...patch }));

  const papers: PickerOption[] = (components?.papers.items ?? [])
    .filter(
      (paper) =>
        paper.certificateType === IELTS_CERTIFICATE &&
        paper.certificateVariant === values.certificateVariant,
    )
    .map((paper) => ({ value: paper.id, label: paper.title }));
  const ielts = <T extends { certificateType?: string | null }>(list: T[]) =>
    list.filter((task) => task.certificateType === IELTS_CERTIFICATE);
  const tasksBySkill = {
    WRITING: ielts(components?.writingTasks.items ?? []),
    SPEAKING: ielts(components?.speakingTasks.items ?? []).map((task) => ({
      ...task,
      imageUrl: null as string | null,
    })),
  };

  function validate() {
    const next: Partial<Record<keyof Values, string>> = {};
    const title = values.title.trim();
    if (!title) next.title = "Nhập tên full test.";
    else if (title.length > FULL_TEST_TITLE_MAX_LENGTH)
      next.title = `Tên tối đa ${FULL_TEST_TITLE_MAX_LENGTH} ký tự.`;
    if (values.description.trim().length > FULL_TEST_DESCRIPTION_MAX_LENGTH)
      next.description = `Mô tả tối đa ${FULL_TEST_DESCRIPTION_MAX_LENGTH} ký tự.`;
    if (!values.examId) next.examId = "Chọn một đề.";
    for (const slot of SLOT_TASKS)
      if (!values[slot.field]) next[slot.field] = "Chọn một đề.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (pending.current || !validate()) return;
    pending.current = true;
    setFailure(null);
    try {
      await save({
        variables: {
          id: fullTest?.id ?? null,
          input: {
            ...values,
            title: values.title.trim(),
            description: values.description.trim(),
            version: fullTest?.version ?? null,
          },
        },
      });
      router.back();
    } catch (cause) {
      setFailure(errorMessage(cause, FULL_TEST_ERRORS));
    } finally {
      pending.current = false;
    }
  }

  const busy = saving.loading;
  return (
    <>
      {componentsFailed ? (
        <Notice message="Chưa tải được danh sách đề đã phát hành. Kéo xuống để thử lại." />
      ) : null}
      <TextField
        label="Tên full test"
        value={values.title}
        onChangeText={(title) => set({ title })}
        maxLength={FULL_TEST_TITLE_MAX_LENGTH}
        editable={!busy}
        error={errors.title}
      />
      <TextField
        label="Mô tả"
        value={values.description}
        onChangeText={(description) => set({ description })}
        maxLength={FULL_TEST_DESCRIPTION_MAX_LENGTH}
        multiline
        editable={!busy}
        error={errors.description}
      />
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        Loại đề
      </AppText>
      <Row gap={spacing.sm}>
        <Choice label="Academic" selected />
        <Choice label="General Training (sắp có)" selected={false} />
      </Row>
      <AppText
        variant="caption"
        tone="muted"
        style={{ marginVertical: spacing.xs }}
      >
        Hiện hỗ trợ bộ IELTS Academic.
      </AppText>
      <OptionPicker
        label="Đề Listening + Reading"
        hint="Đề thi thử IELTS đã phát hành, cùng loại Academic/General."
        value={values.examId}
        options={withCurrent(papers, values.examId)}
        onChange={(examId) => set({ examId })}
        disabled={busy}
        error={errors.examId}
        emptyMessage="Chưa có đề phù hợp"
      />
      {SLOT_TASKS.map((slot) => (
        <OptionPicker
          key={slot.slot}
          label={SLOT_LABELS[slot.slot].title}
          value={values[slot.field]}
          options={withCurrent(
            tasksBySkill[slot.skill]
              .filter((task) => task.taskType === slot.taskType)
              .map((task) => ({
                value: task.id,
                label:
                  slot.slot === FullTestSlot.WRITING_TASK_1 &&
                  values.certificateVariant === CertificateVariant.ACADEMIC &&
                  !task.imageUrl
                    ? `${task.title} (chưa có biểu đồ)`
                    : task.title,
              })),
            values[slot.field],
          )}
          onChange={(value) => set({ [slot.field]: value })}
          disabled={busy}
          error={errors[slot.field]}
          emptyMessage="Chưa có đề phù hợp"
        />
      ))}
      <AppText
        variant="caption"
        tone="muted"
        style={{ marginBottom: spacing.md }}
      >
        Lưu thành bản nháp. Khi gửi duyệt, hệ thống kiểm tra từng thành phần đã
        phát hành và đúng loại.
      </AppText>
      <Notice message={failure} />
      <Button title="Lưu" loading={busy} onPress={() => void submit()} />
    </>
  );
}
