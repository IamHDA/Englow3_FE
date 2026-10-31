import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

/** This app's own route, which adds the signed-in administrator's token on the server. */
const REST_URL = "/api/bff/rest/admin/subscriptions";

export type BillingPeriod = "MONTHLY" | "YEARLY";

/** A refusal as the code the backend gave it, so the screen can say something specific. */
export class SubscriptionApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = "SubscriptionApiError";
  }
}

async function send(
  method: "PUT" | "POST",
  path: string,
  body: unknown,
): Promise<void> {
  const response = await fetch(`${REST_URL}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      [CSRF_HEADER]: CSRF_VALUE,
    },
    body: JSON.stringify(body),
    credentials: "same-origin",
    signal: AbortSignal.timeout(20_000),
  });
  if (response.ok) return;
  const answer: unknown = await response.json().catch(() => null);
  const code =
    typeof answer === "object" &&
    answer !== null &&
    "code" in answer &&
    typeof answer.code === "string"
      ? answer.code
      : "UNKNOWN";
  throw new SubscriptionApiError(code, response.status);
}

/** Puts the learner with this email on the paid plan for `days` more days. */
export function grantPaidPlan(
  email: string,
  billingPeriod: BillingPeriod,
  days: number,
) {
  return send("PUT", "", { email, billingPeriod, days });
}

/** Back to the free plan, at once. */
export function revokePaidPlan(email: string) {
  return send("POST", "/revoke", { email });
}
