import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/shared/context/LanguageContext";

import { AdminSubscriptionsView } from "./index";

beforeEach(() => localStorage.setItem("englow3_lang", "vi"));
afterEach(() => vi.unstubAllGlobals());

function renderView() {
  return render(
    <MantineProvider env="test">
      <LanguageProvider>
        <AdminSubscriptionsView />
      </LanguageProvider>
    </MantineProvider>,
  );
}

it("keeps both buttons off until an email is entered", () => {
  renderView();

  expect(screen.getByRole("button", { name: "Cấp gói Pro" })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Thu hồi về Free" }),
  ).toBeDisabled();
});

it("grants the plan with the chosen period and days", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetcher);
  renderView();
  const user = userEvent.setup();

  await user.type(
    screen.getByLabelText(/Email học viên/),
    "learner@example.com",
  );
  await user.click(screen.getByText("Theo năm"));
  await user.click(screen.getByRole("button", { name: "Cấp gói Pro" }));

  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  const [url, init] = fetcher.mock.calls[0];
  expect(url).toBe("/api/bff/rest/admin/subscriptions");
  expect(init.method).toBe("PUT");
  expect(init.headers).toHaveProperty("x-englow-request", "1");
  expect(JSON.parse(init.body)).toEqual({
    email: "learner@example.com",
    billingPeriod: "YEARLY",
    days: 365,
  });
});

it("revokes through the revoke route", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetcher);
  renderView();
  const user = userEvent.setup();

  await user.type(
    screen.getByLabelText(/Email học viên/),
    "learner@example.com",
  );
  await user.click(screen.getByRole("button", { name: "Thu hồi về Free" }));

  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  expect(fetcher.mock.calls[0][0]).toBe(
    "/api/bff/rest/admin/subscriptions/revoke",
  );
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
    email: "learner@example.com",
  });
});

it("says so when no account has that email", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ code: "USER_NOT_FOUND" }, { status: 404 }),
      ),
  );
  renderView();
  const user = userEvent.setup();

  await user.type(
    screen.getByLabelText(/Email học viên/),
    "nobody@example.com",
  );
  await user.click(screen.getByRole("button", { name: "Cấp gói Pro" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Không có tài khoản nào dùng email này",
  );
});
