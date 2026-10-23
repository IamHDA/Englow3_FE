import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

const HEADERS = { [CSRF_HEADER]: CSRF_VALUE };

/** What the backend says about the signed-in learner's plan. */
export type Subscription = {
  plan: "FREE" | "PRO";
  billingPeriod: "MONTHLY" | "YEARLY" | null;
  currentPeriodEnd: string | null;
  aiDailyRequestLimit: number;
  aiRequestsToday: number;
};

/** A refusal the learner can act on, as the code the backend gave it. */
export class AccountApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = "AccountApiError";
  }
}

async function failure(response: Response): Promise<AccountApiError> {
  const body: unknown = await response.json().catch(() => null);
  const code =
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    typeof body.code === "string"
      ? body.code
      : "UNKNOWN";
  return new AccountApiError(code, response.status);
}

export async function fetchSubscription(
  signal?: AbortSignal,
): Promise<Subscription> {
  const response = await fetch("/api/account/subscription", {
    headers: HEADERS,
    signal,
  });
  if (!response.ok) throw await failure(response);
  return (await response.json()) as Subscription;
}

/** The whole export as a file's worth of text. */
export async function fetchExport(): Promise<Blob> {
  const response = await fetch("/api/account/export", { headers: HEADERS });
  if (!response.ok) throw await failure(response);
  return await response.blob();
}

/** Removes the account. Resolves once the backend has; the session cookie is cleared by the route. */
export async function eraseAccount(confirmEmail: string): Promise<void> {
  const response = await fetch("/api/account/erase", {
    method: "POST",
    headers: { ...HEADERS, "content-type": "application/json" },
    body: JSON.stringify({ confirmEmail }),
  });
  if (!response.ok) throw await failure(response);
}
