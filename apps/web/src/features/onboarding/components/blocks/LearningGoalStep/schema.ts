import { z } from "zod";

import { CERTIFICATE_SCORE_RANGE } from "@/features/onboarding/constants/onboardingSteps";

import { TargetCertificate } from "@/lib/graphql/generated";

/**
 * Backend nhận `certificateType` bắt buộc, `targetScore` và `targetDate` tuỳ ý
 * (@Positive và @Future). Mốc điểm được kiểm theo thang của đúng chứng chỉ
 * đang chọn - 9.5 hợp lệ với TOEIC nhưng vô nghĩa với IELTS.
 */
export function learningGoalSchema(isVi: boolean) {
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return z
    .object({
      certificateType: z.nativeEnum(TargetCertificate, {
        message: tr("Vui lòng chọn chứng chỉ", "Pick a certificate"),
      }),
      targetScore: z
        .string()
        .trim()
        .refine((value) => value === "" || !Number.isNaN(Number(value)), {
          message: tr(
            "Mốc điểm phải là một số",
            "The target score must be a number",
          ),
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
          {
            message: tr(
              "Hạn hoàn thành phải là một ngày trong tương lai",
              "The deadline must be a future date",
            ),
          },
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
          message: tr(
            `Mốc điểm ${values.certificateType} nằm trong khoảng ${range.min} - ${range.max}`,
            `A ${values.certificateType} score is between ${range.min} and ${range.max}`,
          ),
        });
        return;
      }
      // Cùng luật với backend: IELTS đi theo nửa band, TOEIC theo bước 5. Không
      // chặn ở đây thì 6.3 chỉ bị từ chối sau khi đã gửi đi.
      const steps = (score - range.min) / range.step;
      if (Math.abs(steps - Math.round(steps)) > 1e-9) {
        ctx.addIssue({
          code: "custom",
          path: ["targetScore"],
          message: tr(
            `Mốc điểm ${values.certificateType} đi theo bước ${range.step}`,
            `A ${values.certificateType} score goes in steps of ${range.step}`,
          ),
        });
      }
    });
}

export type LearningGoalFormValues = z.infer<
  ReturnType<typeof learningGoalSchema>
>;
