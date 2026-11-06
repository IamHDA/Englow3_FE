import { z } from "zod";
import { CertificateVariant } from "@/lib/graphql/generated/schemaTypes";
import {
  FULL_TEST_DESCRIPTION_MAX_LENGTH,
  FULL_TEST_TITLE_MAX_LENGTH,
} from "../../../constants/fullTest";

export function fullTestFormSchema(isVi: boolean) {
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const pick = z.string().min(1, tr("Chọn một đề.", "Pick one."));
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, tr("Nhập tên full test.", "Enter a title."))
      .max(
        FULL_TEST_TITLE_MAX_LENGTH,
        tr(
          `Tên tối đa ${FULL_TEST_TITLE_MAX_LENGTH} ký tự.`,
          `At most ${FULL_TEST_TITLE_MAX_LENGTH} characters.`,
        ),
      ),
    description: z
      .string()
      .trim()
      .max(
        FULL_TEST_DESCRIPTION_MAX_LENGTH,
        tr(
          `Mô tả tối đa ${FULL_TEST_DESCRIPTION_MAX_LENGTH} ký tự.`,
          `At most ${FULL_TEST_DESCRIPTION_MAX_LENGTH} characters.`,
        ),
      ),
    certificateVariant: z.enum([
      CertificateVariant.ACADEMIC,
      CertificateVariant.GENERAL,
    ]),
    examId: pick,
    writingTask1Id: pick,
    writingTask2Id: pick,
    speakingPart1Id: pick,
    speakingPart2Id: pick,
    speakingPart3Id: pick,
  });
}

export type FullTestFormValues = z.infer<ReturnType<typeof fullTestFormSchema>>;
