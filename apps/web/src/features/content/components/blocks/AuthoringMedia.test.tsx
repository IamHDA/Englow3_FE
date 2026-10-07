import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthoringMedia } from "./AuthoringMedia";
const mocks = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock("../../api/authoring", () => ({ authoringRequest: mocks.upload }));
afterEach(() => {
  vi.restoreAllMocks();
  mocks.upload.mockReset();
});
it("keeps the previous preview after a failed upload and releases the form lock", async () => {
  mocks.upload.mockRejectedValueOnce(new Error("outage"));
  const busy = vi.fn(),
    uploaded = vi.fn();
  render(
    <MantineProvider>
      <AuthoringMedia
        kind="EXAM"
        id="exam"
        image
        url="http://localhost/previous.png"
        onBusyChange={busy}
        onUploaded={uploaded}
      />
    </MantineProvider>,
  );
  fireEvent.change(document.querySelector('input[type="file"]')!, {
    target: { files: [new File(["data"], "photo.png", { type: "image/png" })] },
  });
  await screen.findByText(/Không tải được file/);
  expect(screen.getByAltText("Ảnh trong đề")).toHaveAttribute(
    "src",
    "http://localhost/previous.png",
  );
  expect(busy.mock.calls).toEqual([[true], [false]]);
  expect(uploaded).not.toHaveBeenCalled();
});
it("does not open a request for a file exceeding the stated limit", async () => {
  const uploaded = vi.fn();
  render(
    <MantineProvider>
      <AuthoringMedia kind="FLASHCARD_SET" onUploaded={uploaded} />
    </MantineProvider>,
  );
  const file = new File(["x"], "voice.wav", { type: "audio/wav" });
  Object.defineProperty(file, "size", { value: 12 * 1024 * 1024 + 1 });
  fireEvent.change(document.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });
  await waitFor(() =>
    expect(screen.getByText(/Không tải được file/)).toBeInTheDocument(),
  );
  expect(mocks.upload).not.toHaveBeenCalled();
});
