import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { translations, type Language } from "@/shared/constants/translations";
import { DictationAudioPlayer } from "./index";

it.each<Language>(["vi", "en"])(
  "uses the selected %s language for audio controls",
  (language) => {
    localStorage.setItem("englow3_lang", language);
    render(
      <MantineProvider>
        <LanguageProvider>
          <DictationAudioPlayer
            isPlaying={false}
            currentTime={0}
            duration={30}
            playbackSpeed={1}
            replayCount={1}
            onTogglePlay={vi.fn()}
            onReplay={vi.fn()}
            onBack5={vi.fn()}
            onForward5={vi.fn()}
            onChangeSpeed={vi.fn()}
          />
        </LanguageProvider>
      </MantineProvider>,
    );
    const copy = translations[language].dictation;
    expect(
      screen.getByRole("button", { name: copy.playAudioAria }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: copy.replaySentence }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.speedLabel + ":")).toBeInTheDocument();
  },
);
