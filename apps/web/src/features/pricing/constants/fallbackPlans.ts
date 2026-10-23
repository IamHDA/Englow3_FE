import type { Plan } from "../types";

/**
 * What the pricing page shows when the backend does not answer in time - on
 * the free tier it sleeps, and a visitor should not meet an empty page because
 * of it. These mirror the backend's defaults; the live list wins whenever it
 * arrives.
 */
export const FALLBACK_PLANS: Plan[] = [
  {
    code: "FREE",
    priceVndMonthly: 0,
    priceVndYearly: 0,
    aiDailyRequestLimit: 100,
  },
  {
    code: "PRO",
    priceVndMonthly: 99_000,
    priceVndYearly: 990_000,
    aiDailyRequestLimit: 300,
  },
];
