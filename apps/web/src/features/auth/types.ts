import type { LoginValues } from "./schemas/loginSchema";

export type LoginFieldErrors = Partial<Record<keyof LoginValues, string>>;

/**
 * What a submit handler hands back to the form. Field errors land on their
 * inputs via `setError`; `message` is shown as a form-level alert. This is the
 * seam the BFF sign-in mutation plugs into once it exists — a `BAD_USER_INPUT`
 * error maps onto `fieldErrors`, every other code onto `message`.
 */
export type LoginSubmitResult =
  | { status: "success" }
  | { status: "error"; message?: string; fieldErrors?: LoginFieldErrors };

export type LoginErrorResult = Extract<LoginSubmitResult, { status: "error" }>;

export type LoginSubmitHandler = (
  values: LoginValues,
) => Promise<LoginSubmitResult>;
