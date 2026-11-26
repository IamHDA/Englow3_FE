import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { OnceOnlyAudio } from "./OnceOnlyAudio";

function renderAudio(
  attemptId = "attempt-1",
  audioId = "set-1",
  extra: { autoPlay?: boolean; onEnded?: () => void } = {},
) {
  localStorage.setItem("englow3_lang", "en");
  return render(
    <MantineProvider>
      <LanguageProvider>
        <OnceOnlyAudio
          src="https://example.test/a.mp3"
          audioId={audioId}
          attemptId={attemptId}
          label="Listening"
          {...extra}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
}

describe("OnceOnlyAudio", () => {
  const play = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    sessionStorage.clear();
    play.mockReset().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.play = play;
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it("offers no player controls: no pause, no seeking", () => {
    const { container } = renderAudio();
    expect(container.querySelector("audio")?.hasAttribute("controls")).toBe(
      false,
    );
  });

  it("plays once and then cannot be started again", () => {
    const { container } = renderAudio();
    fireEvent.click(
      screen.getByRole("button", { name: /Play \(one listen only\)/ }),
    );
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.ended(container.querySelector("audio")!);

    const played = screen.getByRole("button", { name: "Played" });
    expect(played).toBeDisabled();
    fireEvent.click(played);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("remembers a clip that was started, even after the page is reloaded", () => {
    const first = renderAudio();
    fireEvent.click(
      screen.getByRole("button", { name: /Play \(one listen only\)/ }),
    );
    fireEvent.playing(first.container.querySelector("audio")!);
    first.unmount();

    renderAudio();

    expect(screen.getByRole("button", { name: "Played" })).toBeDisabled();
  });

  it("keeps the memory per attempt and per clip", () => {
    const first = renderAudio("attempt-1", "set-1");
    fireEvent.click(
      screen.getByRole("button", { name: /Play \(one listen only\)/ }),
    );
    first.unmount();

    renderAudio("attempt-2", "set-1");
    expect(
      screen.getByRole("button", { name: /Play \(one listen only\)/ }),
    ).toBeEnabled();
  });

  it("allows retry and reload after the first play request fails", async () => {
    play.mockRejectedValueOnce(new Error("network unavailable"));
    const first = renderAudio();
    fireEvent.click(
      screen.getByRole("button", { name: /Play \(one listen only\)/ }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Retry audio" })).toBeEnabled(),
    );
    expect(
      sessionStorage.getItem("englow3_exam_audio_played_attempt-1"),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry audio" }));
    fireEvent.playing(first.container.querySelector("audio")!);
    expect(play).toHaveBeenCalledTimes(2);
    first.unmount();
    renderAudio();
    expect(screen.getByRole("button", { name: "Played" })).toBeDisabled();
  });

  it("resumes from the interrupted position after a media error", () => {
    const { container } = renderAudio();
    const element = container.querySelector("audio")!;
    fireEvent.click(
      screen.getByRole("button", { name: /Play \(one listen only\)/ }),
    );
    fireEvent.playing(element);
    element.currentTime = 17;
    fireEvent.timeUpdate(element);
    fireEvent.error(element);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "continues from where it stopped",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry audio" }));
    element.currentTime = 0;
    fireEvent.loadedMetadata(element);
    expect(element.currentTime).toBe(17);
  });

  it("recovers an interrupted clip after remount without replaying the part already heard", () => {
    const first = renderAudio();
    const element = first.container.querySelector("audio")!;
    fireEvent.click(
      screen.getByRole("button", { name: /Play \(one listen only\)/ }),
    );
    fireEvent.playing(element);
    element.currentTime = 23;
    fireEvent.timeUpdate(element);
    fireEvent.error(element);
    first.unmount();
    const restored = renderAudio();
    fireEvent.click(screen.getByRole("button", { name: "Retry audio" }));
    const audio = restored.container.querySelector("audio")!;
    fireEvent.loadedMetadata(audio);
    expect(audio.currentTime).toBe(23);
    fireEvent.playing(audio);
    fireEvent.ended(audio);
    restored.unmount();
    renderAudio();
    expect(screen.getByRole("button", { name: "Played" })).toBeDisabled();
  });

  describe("autoPlay", () => {
    it("starts a clip that has not been heard, without a click", () => {
      const { container } = renderAudio("attempt-1", "set-1", {
        autoPlay: true,
      });
      expect(play).toHaveBeenCalledTimes(1);
      fireEvent.playing(container.querySelector("audio")!);
      expect(screen.getByRole("button", { name: "Playing…" })).toBeDisabled();
    });

    it("does not start a clip already heard in this attempt", () => {
      const first = renderAudio();
      fireEvent.click(
        screen.getByRole("button", { name: /Play \(one listen only\)/ }),
      );
      fireEvent.playing(first.container.querySelector("audio")!);
      first.unmount();
      play.mockClear();

      renderAudio("attempt-1", "set-1", { autoPlay: true });

      expect(play).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Played" })).toBeDisabled();
    });

    it("leaves the Play button, and the one listen, when the browser blocks autoplay", async () => {
      play.mockRejectedValueOnce(
        new DOMException("needs a gesture", "NotAllowedError"),
      );
      renderAudio("attempt-1", "set-1", { autoPlay: true });

      await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
      expect(
        screen.getByRole("button", { name: /Play \(one listen only\)/ }),
      ).toBeEnabled();
      expect(screen.queryByRole("alert")).toBeNull();
      expect(
        sessionStorage.getItem("englow3_exam_audio_played_attempt-1"),
      ).toBeNull();
    });

    it("starts once it is asked to after mounting, as the next clip of a page", () => {
      const view = renderAudio();
      expect(play).not.toHaveBeenCalled();
      view.rerender(
        <MantineProvider>
          <LanguageProvider>
            <OnceOnlyAudio
              src="https://example.test/a.mp3"
              audioId="set-1"
              attemptId="attempt-1"
              label="Listening"
              autoPlay
            />
          </LanguageProvider>
        </MantineProvider>,
      );
      expect(play).toHaveBeenCalledTimes(1);
    });

    it("says when the clip has played to its end", () => {
      const onEnded = vi.fn();
      const { container } = renderAudio("attempt-1", "set-1", { onEnded });
      fireEvent.click(
        screen.getByRole("button", { name: /Play \(one listen only\)/ }),
      );
      fireEvent.playing(container.querySelector("audio")!);
      fireEvent.ended(container.querySelector("audio")!);
      expect(onEnded).toHaveBeenCalledTimes(1);
    });
  });
});
