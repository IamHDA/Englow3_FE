import { z } from "zod";

import { AUTH_MODES, type AuthMode } from "@/features/auth/constants/authModes";

const PASSWORD_MIN_LENGTH = 8;

/**
 * Supabase signs in with email and password, so the field is an email even
 * though the Figma mock labels it "Username" — its placeholder already shows
 * an email. Username sign-in would need a lookup the backend does not expose.
 *
 * Both modes share one field set so the form keeps a single value shape and
 * can be reset by remounting. Only signup enforces the minimum password length
 * - an existing account may predate that rule - and only signup checks the
 * confirmation, which login never renders.
 */
export function createAuthSchema(mode: AuthMode) {
  const isSignup = mode === AUTH_MODES.signup;

  return z
    .object({
      email: z
        .string()
        .trim()
        .min(1, "Enter your email")
        .refine(
          (value) => z.email().safeParse(value).success,
          "Enter a valid email address",
        ),
      password: isSignup
        ? z
            .string()
            .min(
              PASSWORD_MIN_LENGTH,
              `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
            )
        : z.string().min(1, "Enter your password"),
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if (isSignup && values.confirmPassword !== values.password) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    });
}

export type AuthFormValues = z.infer<ReturnType<typeof createAuthSchema>>;
