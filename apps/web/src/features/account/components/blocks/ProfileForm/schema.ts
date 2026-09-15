import { z } from "zod";
import { Gender } from "@/lib/graphql/generated";
import {
  DISPLAY_NAME_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
} from "../../../constants/profile";

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên")
    .max(
      FULL_NAME_MAX_LENGTH,
      `Họ và tên không được vượt quá ${FULL_NAME_MAX_LENGTH} ký tự`,
    ),
  displayName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên hiển thị")
    .max(
      DISPLAY_NAME_MAX_LENGTH,
      `Tên hiển thị không được vượt quá ${DISPLAY_NAME_MAX_LENGTH} ký tự`,
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
      { message: "Ngày sinh phải là ngày trong quá khứ" },
    )
    .nullable()
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
