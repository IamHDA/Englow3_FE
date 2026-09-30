import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeakingPractice } from "./useSpeakingPractice";

const start = vi.fn();
const submit = vi.fn();
const fetchAttempt = vi.fn();
const stopTrack = vi.fn();
const revoke = vi.fn();
const microphone = vi.fn();
let processor: {
  disconnect: () => void;
  connect: () => void;
  onaudioprocess?: (event: {
    inputBuffer: { getChannelData: () => Float32Array };
  }) => void;
};

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useStartSpeakingAttemptMutation: () => [start],
  useSubmitSpeakingAttemptMutation: () => [submit],
  useSpeakingAttemptLazyQuery: () => [fetchAttempt],
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  microphone.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: microphone } });
  vi.stubGlobal(
    "AudioContext",
    class {
      sampleRate = 16000;
      destination = {};
      createMediaStreamSource() {
        return { connect: vi.fn() };
      }
      createScriptProcessor() {
        processor = { disconnect: vi.fn(), connect: vi.fn() };
        return processor;
      }
      close() {
        return Promise.resolve();
      }
    },
  );
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL() {
        return "blob:recording";
      }
      static revokeObjectURL = revoke;
    },
  );
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  start.mockResolvedValue({
    data: {
      startSpeakingAttempt: {
        attemptId: "attempt",
        uploadUrl: "https://storage.test/upload",
        contentType: "audio/wav",
      },
    },
  });
  submit.mockResolvedValue({
    data: { submitSpeakingAttempt: { id: "attempt", status: "PENDING" } },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("speech failure recovery", () => {
  it("reports microphone denial and allows another attempt", async () => {
    microphone.mockRejectedValueOnce(new Error("denied"));
    const { result } = renderHook(() =>
      useSpeakingPractice({ promptId: "prompt", referenceText: "Hello" }),
    );
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.phase).toBe("error");
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.phase).toBe("recording");
  });

  it("retries a failed result lookup without uploading or charging another assessment", async () => {
    fetchAttempt
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({
        data: { speakingAttempt: { id: "attempt", status: "ASSESSED" } },
      });
    const { result, unmount } = renderHook(() =>
      useSpeakingPractice({ promptId: "prompt", referenceText: "Hello" }),
    );
    await act(async () => {
      await result.current.startRecording();
    });
    processor.onaudioprocess?.({
      inputBuffer: { getChannelData: () => new Float32Array(1600) },
    });
    await act(async () => {
      await result.current.stopRecording();
    });
    expect(result.current.phase).toBe("assessing");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(result.current.phase).toBe("error");
    expect(result.current.attempt?.id).toBe("attempt");
    act(() => {
      result.current.retryAssessment();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(result.current.phase).toBe("done");
    expect(start).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledTimes(1);
    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:recording");
    expect(stopTrack).toHaveBeenCalled();
  });

  it("releases a microphone permission result arriving after unmount", async () => {
    let finish!: (value: {
      getTracks: () => { stop: typeof stopTrack }[];
    }) => void;
    microphone.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { result, unmount } = renderHook(() =>
      useSpeakingPractice({ promptId: "prompt", referenceText: "Hello" }),
    );
    let request!: Promise<void>;
    act(() => {
      request = result.current.startRecording();
    });
    unmount();
    await act(async () => {
      finish({ getTracks: () => [{ stop: stopTrack }] });
      await request;
    });
    expect(stopTrack).toHaveBeenCalledTimes(1);
  });
});
