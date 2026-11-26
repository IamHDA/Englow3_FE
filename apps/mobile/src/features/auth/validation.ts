import { z } from "zod";

/**
 * The web app's registration rules (apps/web/src/features/auth/validation.ts).
 * The web checks them on its server route; mobile talks to Supabase directly,
 * so it checks them here before sending, with messages a learner can act on.
 */
export const authEmail = z
  .string()
  .trim()
  .email("Email không hợp lệ.")
  .max(320, "Email quá dài.");

export const newAuthPassword = z
  .string()
  .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
  .max(1024, "Mật khẩu quá dài.")
  .regex(/[A-Z]/, "Mật khẩu cần ít nhất một chữ hoa.")
  .regex(/[a-z]/, "Mật khẩu cần ít nhất một chữ thường.")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu cần ít nhất một ký tự đặc biệt.");

export const loginRequest = z.object({
  email: authEmail,
  password: z.string().min(1, "Nhập mật khẩu."),
});

export const registrationRequest = z.object({
  email: authEmail,
  password: newAuthPassword,
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên cần ít nhất 2 ký tự.")
    .max(200, "Họ tên quá dài."),
  displayName: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9_]{3,20}$/,
      "Tên hiển thị gồm 3-20 ký tự: chữ không dấu, số hoặc dấu gạch dưới.",
    ),
  birthDate: z.iso
    .date("Ngày sinh theo dạng YYYY-MM-DD.")
    .refine(
      (date) => date <= new Date().toISOString().slice(0, 10),
      "Ngày sinh không thể ở tương lai.",
    ),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], "Chọn giới tính."),
  acceptedTerms: z.literal(true, "Bạn cần đồng ý với điều khoản sử dụng."),
});

export type RegistrationInput = z.infer<typeof registrationRequest>;

/** The first message per field, for showing under each input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
