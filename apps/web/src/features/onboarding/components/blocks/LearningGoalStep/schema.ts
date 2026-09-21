import { z } from "zod";

import { CERTIFICATE_SCORE_RANGE } from "@/features/onboarding/constants/onboardingSteps";

import { TargetCertificate } from "@/lib/graphql/generated";

/**
 * Backend nhận `certificateType` bắt buộc, `targetScore` và `targetDate` tuỳ ý
 * (@Positive và @Future). Mốc điểm được kiểm theo thang của đúng chứng chỉ
 * đang chọn - 9.5 hợp lệ với TOEIC nhưng vô nghĩa với IELTS.
 */
export const learningGoalSchema = z
  .object({
    certificateType: z.nativeEnum(TargetCertificate, {
      message: "Vui lòng chọn chứng chỉ",
    }),
    targetScore: z
      .string()
      .trim()
      .refine((value) => value === "" || !Number.isNaN(Number(value)), {
        message: "Mốc điểm phải là một số",
      }),
    targetDate: z
      .string()
      .trim()
      .refine(
        (value) => {
          if (value === "") return true;
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date > today;
        },
        { message: "Hạn hoàn thành phải là một ngày trong tương lai" },
      ),
  })
  .superRefine((values, ctx) => {
    if (values.targetScore === "") return;

    const score = Number(values.targetScore);
    const range = CERTIFICATE_SCORE_RANGE[values.certificateType];
    if (score < range.min || score > range.max) {
      ctx.addIssue({
        code: "custom",
        path: ["targetScore"],
        message: `Mốc điểm ${values.certificateType} nằm trong khoảng ${range.min} - ${range.max}`,
      });
    }
  });

export type LearningGoalFormValues = z.infer<typeof learningGoalSchema>;
