import "server-only";

import { bffRestUrl } from "@/server/bff";

import { FALLBACK_PLANS } from "../constants/fallbackPlans";
import type { Plan } from "../types";

/** Short: a visitor reading prices should not wait on a backend that is waking up. */
const TIMEOUT_MS = 6_000;

function isPlan(value: unknown): value is Plan {
  if (typeof value !== "object" || value === null) return false;
  const plan = value as Record<string, unknown>;
  return (
    (plan.code === "FREE" || plan.code === "PRO") &&
    typeof plan.priceVndMonthly === "number" &&
    typeof plan.priceVndYearly === "number" &&
    typeof plan.aiDailyRequestLimit === "number"
  );
}

/** The live price list, or the built-in one when the backend cannot be reached. */
export async function loadPlans(): Promise<{ plans: Plan[]; live: boolean }> {
  try {
    const response = await fetch(`${bffRestUrl}/plans`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`plans answered ${response.status}`);
    const body: unknown = await response.json();
    if (!Array.isArray(body) || !body.every(isPlan)) {
      throw new Error("plans answered an unexpected shape");
    }
    return { plans: body, live: true };
  } catch {
    return { plans: FALLBACK_PLANS, live: false };
  }
}
