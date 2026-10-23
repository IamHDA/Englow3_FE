import type { Metadata } from "next";

import { PricingView } from "@/features/pricing";
import { loadPlans } from "@/features/pricing/api/loadPlans";

export const metadata: Metadata = {
  title: "Bảng giá — Englow3",
  description: "So sánh gói Miễn phí và gói Pro của Englow3.",
};

export default async function PricingPage() {
  const { plans, live } = await loadPlans();
  return <PricingView plans={plans} live={live} />;
}
