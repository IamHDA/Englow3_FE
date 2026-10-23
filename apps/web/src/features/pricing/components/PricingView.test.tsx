import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";

import { LanguageProvider } from "@/shared/context/LanguageContext";

import { FALLBACK_PLANS } from "../constants/fallbackPlans";
import { PricingView } from "./PricingView";

beforeEach(() => localStorage.setItem("englow3_lang", "vi"));

function renderPricing(live = true) {
  return render(
    <MantineProvider env="test">
      <LanguageProvider>
        <PricingView plans={FALLBACK_PLANS} live={live} />
      </LanguageProvider>
    </MantineProvider>,
  );
}

it("shows each plan with its own daily AI allowance", () => {
  renderPricing();

  expect(screen.getByText("100 lượt AI mỗi ngày")).toBeInTheDocument();
  expect(screen.getByText("300 lượt AI mỗi ngày")).toBeInTheDocument();
  expect(screen.getByText("0đ")).toBeInTheDocument();
});

it("switches the paid price between monthly and yearly", async () => {
  renderPricing();
  expect(screen.getByText(/99\.000đ/)).toBeInTheDocument();

  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Theo năm" }));

  expect(screen.getByText(/990\.000đ/)).toBeInTheDocument();
});

it("does not pretend payment works: the upgrade button is off with no contact address", () => {
  renderPricing();

  expect(
    screen.getByRole("button", { name: "Thanh toán sắp mở" }),
  ).toBeDisabled();
  expect(screen.getByText(/Thanh toán trực tuyến chưa mở/)).toBeInTheDocument();
});

it("says so when it is showing reference prices", () => {
  renderPricing(false);

  expect(screen.getByText(/đang hiển thị giá tham khảo/)).toBeInTheDocument();
});
