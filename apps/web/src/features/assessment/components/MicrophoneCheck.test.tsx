import { MantineProvider } from "@mantine/core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MicrophoneCheck } from "./MicrophoneCheck";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function device() {
  const stop = vi.fn();
  const media = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  const getUserMedia = vi.fn().mockResolvedValue(media);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  const close = vi.fn().mockResolvedValue(undefined);
  const resume = vi.fn().mockResolvedValue(undefined);
  const analyser = {
    fftSize: 256,
    getByteTimeDomainData: (samples: Uint8Array) => samples.fill(128),
  };
  const Audio = vi.fn(function () {
    return {
      close,
      resume,
      createAnalyser: () => analyser,
      createMediaStreamSource: () => ({ connect: vi.fn() }),
    };
  });
  vi.stubGlobal("AudioContext", Audio);
  return { stop, media, getUserMedia, close, Audio };
}

it("releases the microphone and audio context when recording starts", async () => {
  const d = device();
  const view = render(
    <MantineProvider>
      <MicrophoneCheck disabled={false} />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Kiểm tra micro" }));
  await screen.findByRole("button", { name: "Dừng kiểm tra micro" });
  view.rerender(
    <MantineProvider>
      <MicrophoneCheck disabled />
    </MantineProvider>,
  );
  await waitFor(() => expect(d.stop).toHaveBeenCalledOnce());
  expect(d.close).toHaveBeenCalledOnce();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("stops a permission request that resolves after leaving the page", async () => {
  const d = device();
  let resolve!: (value: MediaStream) => void;
  d.getUserMedia.mockReturnValue(
    new Promise<MediaStream>((r) => {
      resolve = r;
    }),
  );
  const view = render(
    <MantineProvider>
      <MicrophoneCheck disabled={false} />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Kiểm tra micro" }));
  view.unmount();
  await act(async () => resolve(d.media));
  expect(d.stop).toHaveBeenCalledOnce();
  expect(d.Audio).not.toHaveBeenCalled();
});

it("shows a retryable failure after permission is denied", async () => {
  const d = device();
  d.getUserMedia.mockRejectedValueOnce(new Error("denied"));
  render(
    <MantineProvider>
      <MicrophoneCheck disabled={false} />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Kiểm tra micro" }));
  expect(await screen.findByText(/Không mở được micro/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Kiểm tra micro" }));
  await screen.findByRole("button", { name: "Dừng kiểm tra micro" });
  expect(d.getUserMedia).toHaveBeenCalledTimes(2);
});
