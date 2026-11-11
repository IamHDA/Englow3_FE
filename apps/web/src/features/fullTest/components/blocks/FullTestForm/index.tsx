"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Flex,
  Group,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  CertificateVariant,
  FullTestSlot,
} from "@/lib/graphql/generated/schemaTypes";
import type { FullTestComponentsQuery } from "@/lib/graphql/generated/documents";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  FULL_TEST_DESCRIPTION_MAX_LENGTH,
  FULL_TEST_TITLE_MAX_LENGTH,
  IELTS_CERTIFICATE,
  SLOT_COPY,
  SLOT_TASKS,
} from "../../../constants/fullTest";
import { fullTestFormSchema, type FullTestFormValues } from "./schema";

export type { FullTestFormValues } from "./schema";

type Choice = { value: string; label: string };

/**
 * Keeps a saved pick visible even when it is no longer a published component -
 * a draft may name a task still being written; review is where it is checked.
 */
function withCurrent(choices: Choice[], current: string, missing: string) {
  return !current || choices.some((c) => c.value === current)
    ? choices
    : [{ value: current, label: missing }, ...choices];
}

export function FullTestForm({
  initial,
  components,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: FullTestFormValues;
  components: FullTestComponentsQuery | undefined;
  submitting: boolean;
  onSubmit: (values: FullTestFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const schema = useMemo(() => fullTestFormSchema(isVi), [isVi]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FullTestFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const variant = useWatch({ control, name: "certificateVariant" });
  const missing = tr("(không còn là đề đã phát hành)", "(no longer published)");

  const papers: Choice[] = (components?.papers.items ?? [])
    .filter(
      (paper) =>
        paper.certificateType === IELTS_CERTIFICATE &&
        paper.certificateVariant === variant,
    )
    .map((paper) => ({ value: paper.id, label: paper.title }));
  const ielts = <T extends { certificateType?: string | null }>(list: T[]) =>
    list.filter((task) => task.certificateType === IELTS_CERTIFICATE);
  const tasksBySkill = {
    WRITING: ielts(components?.writingTasks.items ?? []),
    SPEAKING: ielts(components?.speakingTasks.items ?? []).map((task) => ({
      ...task,
      imageUrl: null,
    })),
  };

  return (
    <Flex
      component="form"
      direction="column"
      gap="md"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
    >
      <TextInput
        label={tr("Tên full test", "Title")}
        required
        maxLength={FULL_TEST_TITLE_MAX_LENGTH}
        disabled={submitting}
        error={errors.title?.message}
        {...register("title")}
      />
      <Textarea
        label={tr("Mô tả", "Description")}
        autosize
        minRows={2}
        maxLength={FULL_TEST_DESCRIPTION_MAX_LENGTH}
        disabled={submitting}
        error={errors.description?.message}
        {...register("description")}
      />
      <Controller
        control={control}
        name="certificateVariant"
        render={({ field }) => (
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {tr("Loại đề", "Variant")}
            </Text>
            <SegmentedControl
              value={field.value}
              onChange={field.onChange}
              disabled={submitting}
              data={[
                { value: CertificateVariant.ACADEMIC, label: "Academic" },
                {
                  value: CertificateVariant.GENERAL,
                  label: "General Training",
                  disabled: true,
                },
              ]}
            />
            <Text size="xs" c="dimmed">
              {tr(
                "Hiện hỗ trợ bộ IELTS Academic.",
                "IELTS Academic sets are currently supported.",
              )}
            </Text>
          </Stack>
        )}
      />
      <Controller
        control={control}
        name="examId"
        render={({ field }) => (
          <Select
            label={tr("Đề Listening + Reading", "Listening + Reading paper")}
            description={tr(
              "Đề thi thử IELTS đã phát hành, cùng loại Academic/General.",
              "A published IELTS mock of the same variant.",
            )}
            required
            searchable
            data={withCurrent(papers, field.value, missing)}
            value={field.value || null}
            onChange={(value) => field.onChange(value ?? "")}
            disabled={submitting}
            error={errors.examId?.message}
            nothingFoundMessage={tr("Chưa có đề phù hợp", "No matching paper")}
          />
        )}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {SLOT_TASKS.map((slot) => (
          <Controller
            key={slot.slot}
            control={control}
            name={slot.field}
            render={({ field }) => (
              <Select
                label={isVi ? SLOT_COPY[slot.slot].vi : SLOT_COPY[slot.slot].en}
                required
                searchable
                data={withCurrent(
                  tasksBySkill[slot.skill]
                    .filter((task) => task.taskType === slot.taskType)
                    .map((task) => ({
                      value: task.id,
                      label:
                        slot.slot === FullTestSlot.WRITING_TASK_1 &&
                        variant === CertificateVariant.ACADEMIC &&
                        !task.imageUrl
                          ? `${task.title} ${tr("(chưa có biểu đồ)", "(no chart)")}`
                          : task.title,
                    })),
                  field.value,
                  missing,
                )}
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? "")}
                disabled={submitting}
                error={errors[slot.field]?.message}
                nothingFoundMessage={tr(
                  "Chưa có đề phù hợp",
                  "No matching task",
                )}
              />
            )}
          />
        ))}
      </SimpleGrid>
      <Text size="xs" c="dimmed">
        {tr(
          "Lưu thành bản nháp. Khi gửi duyệt, hệ thống kiểm tra từng thành phần đã phát hành và đúng loại.",
          "Saved as a draft. Sending it for review checks every part is published and of the right kind.",
        )}
      </Text>
      <Group justify="flex-end">
        <Button variant="default" disabled={submitting} onClick={onCancel}>
          {tr("Hủy", "Cancel")}
        </Button>
        <Button type="submit" loading={submitting}>
          {tr("Lưu", "Save")}
        </Button>
      </Group>
    </Flex>
  );
}
