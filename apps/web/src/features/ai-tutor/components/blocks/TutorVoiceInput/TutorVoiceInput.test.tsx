import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { TutorVoiceInput } from "./index";
const mocks = vi.hoisted(() => ({
  audio: {
    recording: false,
    preparing: false,
    blob: new Blob(["synthetic"]),
    url: "blob:test",
    error: null,
    seconds: 2,
    restored: true,
    storageError: false,
    clientKey: { current: "fe5e8d82-22ec-44eb-a71c-6b82c66c9d37" },
    start: vi.fn(),
    stop: vi.fn(),
    discard: vi.fn().mockResolvedValue(true),
    renewClientKey: vi.fn(),
  },
}));
vi.mock("@/shared/audio/useAudioRecorder", () => ({
  useAudioRecorder: () => mocks.audio,
}));
beforeEach(() => {
  localStorage.setItem("englow3_lang", "vi");
  vi.clearAllMocks();
  mocks.audio.clientKey.current = "fe5e8d82-22ec-44eb-a71c-6b82c66c9d37";
});
afterEach(() => vi.unstubAllGlobals());
function mount(onConfirm = vi.fn().mockResolvedValue(false)) {
  render(
    <MantineProvider theme={theme} env="test">
      <LanguageProvider>
        <TutorVoiceInput
          account="test"
          disabled={false}
          onConfirm={onConfirm}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
  return onConfirm;
}
it("restores only a receipt and requires explicit confirmation of an editable transcript", async () => {
  const fetcher = vi.fn().mockResolvedValue(
    Response.json({
      id: "test",
      status: "READY",
      transcript: "Explain articles.",
    }),
  );
  vi.stubGlobal("fetch", fetcher);
  const onConfirm = mount();
  const user = userEvent.setup();
  const input = await screen.findByRole("textbox", {
    name: "Kiểm tra và sửa bản phiên âm",
  });
  expect(onConfirm).not.toHaveBeenCalled();
  expect(fetcher.mock.calls.every((call) => call[1].method === "GET")).toBe(
    true,
  );
  await user.clear(input);
  await user.type(input, "Explain the present perfect.");
  await user.click(
    screen.getByRole("button", { name: "Xác nhận và gửi cho Tutor" }),
  );
  expect(onConfirm).toHaveBeenCalledWith("Explain the present perfect.");
  expect(mocks.audio.discard).not.toHaveBeenCalled();
  expect(input).toHaveValue("Explain the present perfect.");
});
it("keeps the recording when delivery confirmation is unavailable and never auto uploads", async () => {
  const fetcher = vi
    .fn()
    .mockRejectedValue(new TypeError("Network unavailable"));
  vi.stubGlobal("fetch", fetcher);
  const onConfirm = mount();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Chưa xác nhận được kết quả",
  );
  expect(onConfirm).not.toHaveBeenCalled();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][1].method).toBe("GET");
  expect(mocks.audio.discard).not.toHaveBeenCalled();
});

it("removes the recording after a lost send response is confirmed through receipt recovery", async () => {
  const fetcher = vi.fn().mockImplementation((_url, options) =>
    options.method === "DELETE"
      ? Promise.resolve(new Response(null, { status: 204 }))
      : Promise.resolve(
          Response.json({
            id: "recording",
            status: "READY",
            transcript: "Explain articles.",
          }),
        ),
  );
  vi.stubGlobal("fetch", fetcher);
  const onConfirm = vi.fn().mockResolvedValue(false);
  const ui = (acceptedDelivery: { key: string; message: string } | null) => (
    <MantineProvider theme={theme} env="test">
      <LanguageProvider>
        <TutorVoiceInput
          account="test"
          disabled={false}
          onConfirm={onConfirm}
          acceptedDelivery={acceptedDelivery}
        />
      </LanguageProvider>
    </MantineProvider>
  );
  const view = render(ui(null));
  await screen.findByRole("textbox", { name: "Kiểm tra và sửa bản phiên âm" });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Xác nhận và gửi cho Tutor" }));
  expect(mocks.audio.discard).not.toHaveBeenCalled();
  view.rerender(
    ui({ key: "recovered-delivery", message: "Explain articles." }),
  );
  await waitFor(() => expect(mocks.audio.discard).toHaveBeenCalledTimes(1));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(
    fetcher.mock.calls.filter((call) => call[1].method === "DELETE"),
  ).toHaveLength(1);
});

it("retries the retained audio with a fresh identity only after a terminal transcription failure", async () => {
  const newKey = "de5e8d82-22ec-44eb-a71c-6b82c66c9d38";
  mocks.audio.renewClientKey.mockImplementation(async () => {
    mocks.audio.clientKey.current = newKey;
    return newKey;
  });
  const fetcher = vi
    .fn()
    .mockImplementation((url: string, options: RequestInit) => {
      if (options.method === "DELETE")
        return Promise.resolve(new Response(null, { status: 204 }));
      if (options.method === "POST")
        return Promise.resolve(
          Response.json({
            id: "new-recording",
            status: "READY",
            transcript: "Explain articles.",
          }),
        );
      if (url.includes(newKey))
        return Promise.resolve(
          Response.json({ code: "NOT_FOUND" }, { status: 404 }),
        );
      return Promise.resolve(
        Response.json({ id: "old-recording", status: "FAILED" }),
      );
    });
  vi.stubGlobal("fetch", fetcher);
  const onConfirm = mount();
  await userEvent.setup().click(
    await screen.findByRole("button", {
      name: "Phiên âm lại · một lượt AI mới",
    }),
  );
  await screen.findByRole("textbox", { name: "Kiểm tra và sửa bản phiên âm" });
  const upload = fetcher.mock.calls.find((call) => call[1].method === "POST");
  expect(upload?.[0]).toContain(newKey);
  expect(upload?.[1].body).toBe(mocks.audio.blob);
  expect(onConfirm).not.toHaveBeenCalled();
  expect(mocks.audio.discard).not.toHaveBeenCalled();
});
