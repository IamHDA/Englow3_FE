import { z } from "zod";

/**
 * Supabase signs in with email and password, so the field is an email even
 * though the Figma mock labels it "Username" — its placeholder already shows
 * an email. Username sign-in would need a lookup the backend does not expose.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .refine(
      (value) => z.email().safeParse(value).success,
      "Enter a valid email address",
    ),
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;
