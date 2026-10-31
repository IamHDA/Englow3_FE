/** One plan as the backend lists it. Prices are whole VND; 0 is free. */
export type Plan = {
  code: "FREE" | "PRO";
  priceVndMonthly: number;
  priceVndYearly: number;
  aiDailyRequestLimit: number;
};
