import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PartSheet, type PartSheetProps } from "./index";

function question(id: string, number: number, type = "SINGLE_CHOICE") {
  return {
    id,
    questionType: type,
    content: `Question ${number} prompt`,
    orderNo: number,
    numberFrom: number,
    numberTo: number,
    choiceLimit: 1,
    options:
      type === "TEXT_ENTRY"
        ? []
        : [
            { id: `${id}-a`, content: "First" },
            { id: `${id}-b`, content: "Second" },
          ],
  };
}

/** A listening part with its own recording and two sets, the second with a recording of its own. */
function props(overrides: Partial<PartSheetProps> = {}): PartSheetProps {
  return {
    section: { sectionType: "LISTENING" },
    part: {
      id: "p1",
      title: "Part 1",
      instruction: "Listen and answer.",
      audioUrl: "https://example.test/part.mp3",
      questionSets: [
        {
          id: "s1",
          content: "Name: Sarah {{1}}",
          questions: [question("q1", 1, "TEXT_ENTRY"), question("q2", 2)],
        },
        {
          id: "s2",
          audioUrl: "https://example.test/set.mp3",
          questions: [question("q3", 3)],
        },
      ],
    },
    answers: { q1: { text: "Mitchell" } },
    flaggedIds: new Set(),
    currentQuestionId: "q1",
    onSelectOption: vi.fn(),
    onChangeText: vi.fn(),
    onToggleFlag: vi.fn(),
    audioOnceForAttempt: "attempt-1",
    autoPlayFirstClip: false,
    onPrevPart: vi.fn(),
    onNextPart: vi.fn(),
    hasPrevPart: false,
    hasNextPart: true,
    ...overrides,
  } as unknown as PartSheetProps;
}

function renderSheet(overrides: Partial<PartSheetProps> = {}) {
  const given = props(overrides);
  const view = render(
    <MantineProvider>
      <PartSheet {...given} />
    </MantineProvider>,
  );
  return { ...view, props: given };
}

describe("PartSheet", () => {
  const play = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    sessionStorage.clear();
    play.mockReset().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.play = play;
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it("shows every question of the part on one page, each answered for itself", () => {
    const { props: given } = renderSheet();

    expect(screen.getByText("Question 1 prompt")).toBeInTheDocument();
    expect(screen.getByText("Question 2 prompt")).toBeInTheDocument();
    expect(screen.getByText("Question 3 prompt")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("radio")[3]);
    expect(given.onSelectOption).toHaveBeenCalledWith("q3", "q3-b");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Mitchel" },
    });
    expect(given.onChangeText).toHaveBeenCalledWith("q1", "Mitchel");
  });

  it("shows what was typed in its gap in the passage", () => {
    renderSheet();
    expect(
      screen.getByText(/Mitchell/, { selector: "span" }),
    ).toBeInTheDocument();
  });

  it("says which questions a set's material is for when it is for more than one", () => {
    renderSheet();
    // The notes of the first set are for 1–2; the second set's recording is for
    // question 3 alone, which its question already says.
    expect(screen.getByText("Câu 1–2")).toBeInTheDocument();
    expect(screen.getAllByText("Câu 3")).toHaveLength(1);
  });

  it("goes on to the next part from the bottom of the page", () => {
    const { props: given } = renderSheet();
    fireEvent.click(screen.getByRole("button", { name: /Part tiếp theo/ }));
    expect(given.onNextPart).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Part trước/ })).toBeDisabled();
  });

  it("starts nothing by itself when the learner jumped to the part", () => {
    renderSheet({ autoPlayFirstClip: false });
    expect(play).not.toHaveBeenCalled();
  });

  it("starts the first clip when the learner went on to the part, then the next once it ends", () => {
    const { container } = renderSheet({ autoPlayFirstClip: true });
    const [partClip, setClip] = Array.from(container.querySelectorAll("audio"));

    expect(play).toHaveBeenCalledTimes(1);
    expect(play.mock.contexts[0]).toBe(partClip);

    fireEvent.playing(partClip);
    fireEvent.ended(partClip);

    expect(play).toHaveBeenCalledTimes(2);
    expect(play.mock.contexts[1]).toBe(setClip);
  });

  it("chains the clips in practice too, with ordinary players", () => {
    const { container } = renderSheet({
      autoPlayFirstClip: true,
      audioOnceForAttempt: undefined,
    });
    const [partClip, setClip] = Array.from(container.querySelectorAll("audio"));
    expect(partClip).toHaveAttribute("controls");

    expect(play.mock.contexts[0]).toBe(partClip);
    fireEvent.ended(partClip);
    expect(play.mock.contexts[1]).toBe(setClip);
  });
});
