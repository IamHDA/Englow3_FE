import { rest, RestError } from "@/lib/rest";

/** The BFF's REST routes for the account, the same ones the web calls through its proxy. */
export type Subscription = {
  plan: "FREE" | "PRO";
  billingPeriod: "MONTHLY" | "YEARLY" | null;
  currentPeriodEnd: string | null;
  aiDailyRequestLimit: number;
  aiRequestsToday: number;
};

export type Plan = {
  code: "FREE" | "PRO";
  priceVndMonthly: number;
  priceVndYearly: number;
  aiDailyRequestLimit: number;
};

export { RestError as AccountApiError };

export const fetchSubscription = () =>
  rest<Subscription>("/account/subscription");
export const fetchPlans = () => rest<Plan[]>("/plans");
export const eraseAccount = (confirmEmail: string) =>
  rest<void>("/account/erase", { method: "POST", body: { confirmEmail } });
