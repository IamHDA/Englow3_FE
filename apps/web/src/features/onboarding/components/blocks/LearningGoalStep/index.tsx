"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Flex,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  CERTIFICATE_SCORE_RANGE,
  LEARNING_GOAL_COPY,
  TARGET_CERTIFICATE_CHOICES,
} from "@/features/onboarding/constants/onboardingSteps";

import { OnboardingChoiceTile } from "../../parts/OnboardingChoiceTile";
import { OnboardingStepFooter } from "../../parts/OnboardingStepFooter";
import { OnboardingStepShell } from "../../parts/OnboardingStepShell";
import { learningGoalSchema, type LearningGoalFormValues } from "./schema";

import { OnboardingStep, TargetCertificate } from "@/lib/graphql/generated";
import type { LearningGoalInput } from "@/lib/graphql/generated";

type LearningGoalStepProps = {
  /**
   * Người học không chọn mục đích "luyện chứng chỉ" thì backend từ chối mốc
   * điểm với TARGET_SCORE_NOT_APPLICABLE, nên ô điểm không được hiện.
   */
  certificateLearner: boolean;
  initialCertificate: TargetCertificate | null;
  initialTargetScore: number | null;
  initialTargetDate: string | null;
  pending: boolean;
  errorMessage: string | null;
  onContinue: (input: LearningGoalInput) => void;
};

/**
 * Vẫn hỏi chứng chỉ ở đây dù bước 2 đã hỏi: backend bắt buộc `certificateType`
 * cho mọi người học, kể cả người vừa bị bỏ qua bước 2 vì không luyện chứng chỉ.
 */
export function LearningGoalStep({
  certificateLearner,
  initialCertificate,
  initialTargetScore,
  initialTargetDate,
  pending,
  errorMessage,
  onContinue,
}: LearningGoalStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LearningGoalFormValues>({
    resolver: zodResolver(learningGoalSchema),
    defaultValues: {
      certificateType: initialCertificate ?? TargetCertificate.IELTS,
      targetScore: initialTargetScore == null ? "" : String(initialTargetScore),
      targetDate: initialTargetDate ?? "",
    },
  });

  // `useWatch` chứ không phải `watch()`: cái sau trả về một hàm mà React
  // Compiler không memo hoá được, nên nó bỏ tối ưu cả component.
  const certificateType = useWatch({ control, name: "certificateType" });
  const range = CERTIFICATE_SCORE_RANGE[certificateType];

  function handleValidSubmit(values: LearningGoalFormValues) {
    onContinue({
      certificateType: values.certificateType,
      // Chuỗi rỗng nghĩa là bỏ qua - gửi null chứ không gửi 0, vì backend
      // kiểm @Positive và 0 sẽ bị từ chối.
      targetScore:
        certificateLearner && values.targetScore !== ""
          ? Number(values.targetScore)
          : null,
      targetDate: values.targetDate === "" ? null : values.targetDate,
    });
  }

  return (
    <OnboardingStepShell
      step={OnboardingStep.LEARNING_GOAL}
      title={LEARNING_GOAL_COPY.title}
      subtitle={LEARNING_GOAL_COPY.subtitle}
      footer={
        <OnboardingStepFooter
          pending={pending}
          errorMessage={errorMessage}
          onContinue={() => handleSubmit(handleValidSubmit)()}
        />
      }
    >
      <Flex component="form" direction="column" gap={24} noValidate>
        <Controller
          name="certificateType"
          control={control}
          render={({ field }) => (
            <Stack gap={10}>
              <Text size="sm" fw={700} c="ink.9">
                Định dạng chứng chỉ
              </Text>
              <Box role="group" aria-label="Định dạng chứng chỉ">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
                  {TARGET_CERTIFICATE_CHOICES.map((choice) => (
                    <OnboardingChoiceTile
                      key={choice.certificate}
                      label={choice.label}
                      description={choice.description}
                      selected={field.value === choice.certificate}
                      disabled={pending}
                      onSelect={() => field.onChange(choice.certificate)}
                    />
                  ))}
                </SimpleGrid>
              </Box>
              {errors.certificateType && (
                <Text size="xs" c="warn.6">
                  {errors.certificateType.message}
                </Text>
              )}
            </Stack>
          )}
        />

        {certificateLearner && (
          <Controller
            name="targetScore"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Mốc điểm muốn đạt"
                description={`Để trống nếu chưa quyết định. Thang ${certificateType}: ${range.min} - ${range.max}.`}
                placeholder={`Ví dụ ${range.max}`}
                min={range.min}
                max={range.max}
                step={range.step}
                radius="md"
                size="md"
                disabled={pending}
                error={errors.targetScore?.message}
                value={field.value}
                onChange={(value) => field.onChange(String(value))}
                onBlur={field.onBlur}
              />
            )}
          />
        )}

        <Controller
          name="targetDate"
          control={control}
          render={({ field }) => (
            <TextInput
              type="date"
              label="Hạn hoàn thành"
              description="Để trống nếu bạn chưa đặt hạn."
              radius="md"
              size="md"
              disabled={pending}
              error={errors.targetDate?.message}
              {...field}
            />
          )}
        />
      </Flex>
    </OnboardingStepShell>
  );
}
