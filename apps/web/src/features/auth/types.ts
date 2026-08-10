import type { AuthFormValues } from "./schemas/authSchema";

export type AuthCredentials = Pick<AuthFormValues, "email" | "password">;

export type AuthFieldErrors = Partial<Record<keyof AuthFormValues, string>>;

/**
 * What a submit handler hands back to the form. Field errors land on their
 * inputs via `setError`; `message` is shown as a form-level alert.
 *
 * `notice` is a success that must not close the modal: signing up on a project
 * with email confirmation turned on creates the account but no session, and
 * silently closing would look like the user was signed in when they are not.
 */
export type AuthSubmitResult =
  | { status: "success" }
  | { status: "notice"; message: string }
  | { status: "error"; message?: string; fieldErrors?: AuthFieldErrors };

export type AuthErrorResult = Extract<AuthSubmitResult, { status: "error" }>;

export type AuthSubmitHandler = (
  values: AuthCredentials,
) => Promise<AuthSubmitResult>;
