import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";

import type { DictationSubmission, MistakeSentence } from "../../../types";
import { DictationMistakeQueue } from "./index";

// jsdom has no media pipeline; the player is not what these tests are about.
vi.mock("../../../hooks/useDictationAudio", () => ({
  useDictationAudio: () => ({
    isPlaying: false,
    currentTime: 0,
    duration: 4,
    playbackSpeed: 1,
    replayCount: 0,
    togglePlay: vi.fn(),
    replay: vi.fn(),
    back5: vi.fn(),
    forward5: vi.fn(),
    changeSpeed: vi.fn(),
    stopAudio: vi.fn(),
  }),
}));

const LINE: MistakeSentence = {
  __typename: "MistakeSentence",
  sentenceId: "s1",
  audioUrl: "https://storage.example/a.mp3",
  audioDurationSeconds: 4,
  audioStartMs: null,
  audioEndMs: null,
  lessonId: "l1",
  lessonTitle: "At the airport",
  bestAccuracyPercent: 40,
  attemptCount: 2,
  lastResponse: "the cat",
} as MistakeSentence;

function submission(
  overrides: Partial<DictationSubmission>,
): DictationSubmission {
  return {
    __typename: "DictationSubmission",
    sentenceId: "s1",
    correctText: "The cat sat on the mat.",
    translationVi: null,
    response: "",
    accuracyPercent: 100,
    correctWordCount: 6,
    totalWordCount: 6,
    cleared: true,
    ...overrides,
  } as DictationSubmission;
}

function renderQueue(onCheck = vi.fn()) {
  render(
    <MantineProvider theme={theme}>
      <LanguageProvider>
        <DictationMistakeQueue mistakes={[LINE]} onCheck={onCheck} />
      </LanguageProvider>
    </MantineProvider>,
  );
  return { onCheck };
}

async function typeAndCheck(text: string) {
  await userEvent.type(screen.getByRole("textbox"), text);
  await userEvent.click(
    screen.getByRole("button", { name: /kiểm tra kết quả|check/i }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DictationMistakeQueue", () => {
  // The answer is not in the list any more. It arrives in the result of a
  // submission, so there is nothing to read before the learner has typed.
  it("shows no answer before the learner has checked", () => {
    renderQueue();

    expect(screen.queryByText(/The cat sat on the mat/)).toBeNull();
  });

  // Review used to grade in the browser and tell the server nothing, so a
  // cleared line came back on the next visit. It submits now, like practice.
  it("sends the answer to the server to be marked", async () => {
    const { onCheck } = renderQueue(vi.fn().mockResolvedValue(submission({})));

    await typeAndCheck("The cat sat on the mat");

    expect(onCheck).toHaveBeenCalledWith("s1", "The cat sat on the mat");
  });

  it("shows the answer once the server has returned it", async () => {
    renderQueue(vi.fn().mockResolvedValue(submission({})));

    await typeAndCheck("The cat sat on the mat");

    expect(await screen.findByText(/The cat sat on the mat\./)).toBeTruthy();
  });

  // Five words of six. The server calls that cleared; this screen used to
  // demand 100% and call it wrong.
  it("takes the server's word for whether the line is cleared", async () => {
    renderQueue(
      vi
        .fn()
        .mockResolvedValue(
          submission({ accuracyPercent: 83.33, cleared: true }),
        ),
    );

    await typeAndCheck("The cat sat on the");

    expect(await screen.findByText(/Chính xác|Correct!/)).toBeTruthy();
  });

  it("says a line is not yet cleared when the server says so", async () => {
    renderQueue(
      vi
        .fn()
        .mockResolvedValue(
          submission({ accuracyPercent: 33.33, cleared: false }),
        ),
    );

    await typeAndCheck("The dog");

    expect(
      await screen.findByText(/Chưa hoàn toàn chính xác|Not quite right/),
    ).toBeTruthy();
  });

  // No result means no result - not a guess made in the browser.
  it("says it could not check rather than inventing an outcome", async () => {
    renderQueue(vi.fn().mockResolvedValue(null));

    await typeAndCheck("anything");

    await waitFor(() =>
      expect(screen.getByText(/Chưa chấm được|Could not check/)).toBeTruthy(),
    );
    expect(screen.queryByText(/Chính xác|Correct!/)).toBeNull();
  });
});
