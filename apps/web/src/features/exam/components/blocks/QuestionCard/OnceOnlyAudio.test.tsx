import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { OnceOnlyAudio } from "./OnceOnlyAudio";

function renderAudio(attemptId = "attempt-1", audioId = "set-1") {
  localStorage.setItem("englow3_lang", "en");
  return render(
    <MantineProvider>
      <LanguageProvider>
        <OnceOnlyAudio
          src="https://example.test/a.mp3"
          audioId={audioId}
          attemptId={attemptId}
          label="Listening"
        />
      </LanguageProvider>
    </MantineProvider>,
  );
}

describe("OnceOnlyAudio", () => {
  const play = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    sessionStorage.clear();
    play.mockClear();
    window.HTMLMediaElement.prototype.play = play;
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
});
