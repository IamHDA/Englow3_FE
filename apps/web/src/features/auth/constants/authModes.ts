/**
 * The two states the auth modal can be in. Named rather than compared as bare
 * strings, so a typo fails to compile instead of silently matching nothing.
 */
export const AUTH_MODES = {
  login: "login",
  signup: "signup",
} as const;

export type AuthMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];

export type AuthModeCopy = {
  /** Label on the gradient submit button. */
  submitLabel: string;
  /** Question in the modal footer, above the link to the other mode. */
  switchPrompt: string;
  switchLabel: string;
  switchTo: AuthMode;
};

export const authModeCopy: Record<AuthMode, AuthModeCopy> = {
  [AUTH_MODES.login]: {
    submitLabel: "Login",
    switchPrompt: "Don't have an account?",
    switchLabel: "Sign up",
    switchTo: AUTH_MODES.signup,
  },
  [AUTH_MODES.signup]: {
    submitLabel: "Sign up",
    switchPrompt: "Already have an account?",
    switchLabel: "Login",
    switchTo: AUTH_MODES.login,
  },
};
