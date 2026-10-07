import { z } from "zod";
import { Gender } from "@/lib/graphql/generated";
import {
  DISPLAY_NAME_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
} from "../../../constants/profile";

export function profileFormSchema(isVi: boolean) {
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, tr("Vui lòng nhập họ và tên", "Enter your full name"))
      .max(
        FULL_NAME_MAX_LENGTH,
        tr(
          `Họ và tên không được vượt quá ${FULL_NAME_MAX_LENGTH} ký tự`,
          `Full name is at most ${FULL_NAME_MAX_LENGTH} characters`,
        ),
      ),
    displayName: z
      .string()
      .trim()
      .min(1, tr("Vui lòng nhập tên hiển thị", "Enter a display name"))
      .max(
        DISPLAY_NAME_MAX_LENGTH,
        tr(
          `Tên hiển thị không được vượt quá ${DISPLAY_NAME_MAX_LENGTH} ký tự`,
          `Display name is at most ${DISPLAY_NAME_MAX_LENGTH} characters`,
        ),
      ),
    gender: z.nativeEnum(Gender).nullable().optional(),
    birthDate: z
      .string()
      .refine(
        (val) => {
          if (!val || val.trim() === "") return true;
          const date = new Date(val);
          if (Number.isNaN(date.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        },
        {
          message: tr(
            "Ngày sinh phải là ngày trong quá khứ",
            "Date of birth must be in the past",
          ),
        },
      )
      .nullable()
      .optional(),
  });
}

export type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchema>>;
