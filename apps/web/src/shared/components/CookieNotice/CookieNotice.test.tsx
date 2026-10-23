import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";

import { LanguageProvider } from "@/shared/context/LanguageContext";

import { CookieNotice } from "./index";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("englow3_lang", "vi");
});

function renderNotice() {
  return render(
    <MantineProvider env="test">
      <LanguageProvider>
        <CookieNotice />
      </LanguageProvider>
    </MantineProvider>,
  );
}

it("tells a first-time visitor what is stored and links the policy", async () => {
  renderNotice();

  const notice = await screen.findByRole("region", {
    name: "Thông báo về cookie",
  });
  expect(notice).toHaveTextContent("chỉ dùng cookie cần thiết");
  expect(
    screen.getByRole("link", { name: "Chính sách bảo mật" }),
  ).toHaveAttribute("href", "/privacy");
});

it("goes away once acknowledged and stays away on the next visit", async () => {
  const first = renderNotice();
  await userEvent
    .setup()
    .click(await screen.findByRole("button", { name: "Đã hiểu" }));

  expect(screen.queryByRole("region")).not.toBeInTheDocument();
  first.unmount();

  renderNotice();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});
