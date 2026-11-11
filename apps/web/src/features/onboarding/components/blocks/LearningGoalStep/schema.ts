import { z } from "zod";

import { CERTIFICATE_SCORE_RANGE } from "@/features/onboarding/constants/onboardingSteps";

import { TargetCertificate } from "@/lib/graphql/generated";

/**
 * Mirror the backend's conditional goal requirements; dates remain optional.
 * Scores use the selected certificate's range and increment.
 */
export function learningGoalSchema(
  isVi: boolean,
  requireTargetLevel = false,
  requireTargetScore = false,
) {
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return z
    .object({
      // Người không thi chứng chỉ cần một trình độ đích thì lộ trình mới có
      // đích để chia giai đoạn.
      targetLevel: z
        .string()
        .refine((value) => !requireTargetLevel || value !== "", {
          message: tr(
            "Chọn trình độ bạn muốn đạt",
            "Pick the level you want to reach",
          ),
        }),
      dailyStudyMinutes: z
        .string()
        .trim()
        .refine(
          (value) =>
            value === "" ||
            (Number.isInteger(Number(value)) &&
              Number(value) >= 10 &&
              Number(value) <= 240),
          {
            message: tr(
              "Thời gian học mỗi ngày từ 10 đến 240 phút",
              "Daily study time is 10 to 240 minutes",
            ),
          },
        ),
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
      if (values.targetScore === "") {
        if (requireTargetScore)
          ctx.addIssue({
            code: "custom",
            path: ["targetScore"],
            message: tr(
              "Chọn mốc điểm để tạo lộ trình",
              "Choose a target score for your roadmap",
            ),
          });
        return;
      }

      const score = Number(values.targetScore);
      const range = CERTIFICATE_SCORE_RANGE[values.certificateType];
      const minimum = Math.max(range.min, range.step);
      if (score < minimum || score > range.max) {
        ctx.addIssue({
          code: "custom",
          path: ["targetScore"],
          message: tr(
            `Mốc điểm mục tiêu ${values.certificateType} nằm trong khoảng ${minimum} - ${range.max}`,
            `A ${values.certificateType} target score is between ${minimum} and ${range.max}`,
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
