import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { QuestionCard, type QuestionCardProps } from "./index";
function fixture(type: string): QuestionCardProps {
  return {
    section: { sectionType: "READING" },
    part: { title: "Passage", content: "Read this passage before answering." },
    questionSet: {},
    question: {
      id: "q",
      questionType: type,
      content: "Choose the answer",
      options: [
        { id: "a", content: "First" },
        { id: "b", content: "Second" },
      ],
    },
    questionIndex: 0,
    totalQuestions: 1,
    isFlagged: false,
    onToggleFlag: vi.fn(),
    onPrevQuestion: vi.fn(),
    onNextQuestion: vi.fn(),
    hasPrev: false,
    hasNext: false,
    onSelectOption: vi.fn(),
  } as unknown as QuestionCardProps;
}
describe("exam answer selection", () => {
  it("lets a learner select two choices and uncheck one without losing the other", () => {
    const props = fixture("MULTIPLE_CHOICE");
    function Sitting() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <QuestionCard
          {...props}
          selectedOptionIds={selected}
          onSelectOption={(id) =>
            setSelected((old) =>
              old.includes(id) ? old.filter((o) => o !== id) : [...old, id],
            )
          }
        />
      );
    }
    render(
      <MantineProvider>
        <Sitting />
      </MantineProvider>,
    );
    const choices = screen.getAllByRole("checkbox");
    fireEvent.click(choices[0]);
    fireEvent.click(choices[1]);
    expect(choices[0]).toHaveAttribute("aria-checked", "true");
    expect(choices[1]).toHaveAttribute("aria-checked", "true");
    fireEvent.click(choices[0]);
    expect(choices[0]).toHaveAttribute("aria-checked", "false");
    expect(choices[1]).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByText("Read this passage before answering."),
    ).toBeInTheDocument();
  });
  it("supports arrow navigation between single-choice answers", () => {
    const props = fixture("SINGLE_CHOICE");
    render(
      <MantineProvider>
        <QuestionCard {...props} />
      </MantineProvider>,
    );
    const choices = screen.getAllByRole("radio");
    choices[0].focus();
    fireEvent.keyDown(choices[0], { key: "ArrowRight" });
    expect(props.onSelectOption).toHaveBeenCalledWith("b");
    expect(choices[1]).toHaveFocus();
  });
});
