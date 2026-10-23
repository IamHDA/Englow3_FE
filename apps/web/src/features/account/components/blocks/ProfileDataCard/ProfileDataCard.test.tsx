import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/shared/context/LanguageContext";

let role = "LEARNER";
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ session: { role } }),
  isBackOfficeRole: (value: string | undefined) =>
    value === "ADMIN" || value === "STAFF",
}));

import { ProfileDataCard } from "./index";

const EMAIL = "learner@example.com";

beforeEach(() => {
  role = "LEARNER";
  localStorage.setItem("englow3_lang", "vi");
});
afterEach(() => vi.unstubAllGlobals());

function renderCard() {
  return render(
    <MantineProvider env="test">
      <LanguageProvider>
        <ProfileDataCard email={EMAIL} />
      </LanguageProvider>
    </MantineProvider>,
  );
}

async function openErase() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Xoá tài khoản" }));
  return user;
}

it("keeps deletion locked until the account's own email is typed", async () => {
  renderCard();
  const user = await openErase();

  const confirm = await screen.findByRole("button", { name: "Xoá vĩnh viễn" });
  expect(confirm).toBeDisabled();

  await user.type(
    screen.getByLabelText("Email của tài khoản"),
    "someone@else.com",
  );
  expect(confirm).toBeDisabled();

  await user.clear(screen.getByLabelText("Email của tài khoản"));
  await user.type(
    screen.getByLabelText("Email của tài khoản"),
    EMAIL.toUpperCase(),
  );
  expect(confirm).toBeEnabled();
});

it("sends the typed email and the CSRF header when deleting", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetcher);
  // The page is left through a full navigation; jsdom cannot perform one.
  const location = { origin: "http://localhost", href: "" };
  vi.stubGlobal("location", location);
  renderCard();
  const user = await openErase();

  await user.type(await screen.findByLabelText("Email của tài khoản"), EMAIL);
  await user.click(screen.getByRole("button", { name: "Xoá vĩnh viễn" }));

  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  const [url, init] = fetcher.mock.calls[0];
  expect(url).toBe("/api/account/erase");
  expect(init.method).toBe("POST");
  expect(init.headers).toHaveProperty("x-englow-request", "1");
  expect(JSON.parse(init.body)).toEqual({ confirmEmail: EMAIL });
  await waitFor(() => expect(location.href).toBe("http://localhost"));
});

it("tells the learner when an AI job is still running, and stays signed in", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ code: "ACCOUNT_AI_WORK_PENDING" }, { status: 409 }),
      ),
  );
  const location = { origin: "http://localhost", href: "" };
  vi.stubGlobal("location", location);
  renderCard();
  const user = await openErase();

  await user.type(await screen.findByLabelText("Email của tài khoản"), EMAIL);
  await user.click(screen.getByRole("button", { name: "Xoá vĩnh viễn" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Một yêu cầu AI của bạn vẫn đang chạy",
  );
  expect(location.href).toBe("");
});

it("offers no self-service deletion to staff, who own published content", () => {
  role = "STAFF";
  renderCard();

  expect(
    screen.queryByRole("button", { name: "Xoá tài khoản" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText(/do quản trị viên xoá/)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Tải dữ liệu của tôi" }),
  ).toBeInTheDocument();
});

it("downloads the export as a file", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ account: [] })),
  );
  const created = vi.fn(() => "blob:export");
  const BrowserURL = URL;
  vi.stubGlobal(
    "URL",
    class extends BrowserURL {
      static createObjectURL = created;
      static revokeObjectURL = vi.fn();
    },
  );
  renderCard();

  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Tải dữ liệu của tôi" }));

  await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
});
