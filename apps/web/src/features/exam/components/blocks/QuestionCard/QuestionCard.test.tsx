import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { QuestionCard, type QuestionCardProps } from "./index";
function fixture(type: string): QuestionCardProps {
  return {
    questionSet: { setOptions: [], questions: [] },
    question: {
      id: "q",
      questionType: type,
      content: "Choose the answer",
      numberFrom: 1,
      numberTo: 1,
      choiceLimit: 2,
      options: [
        { id: "a", content: "First" },
        { id: "b", content: "Second" },
      ],
    },
    isFlagged: false,
    isCurrent: false,
    onToggleFlag: vi.fn(),
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

describe("IELTS question shapes", () => {
  it("types the answer of a text-entry question", () => {
    const onChangeText = vi.fn();
    const props = {
      ...fixture("TEXT_ENTRY"),
      question: {
        id: "q",
        questionType: "TEXT_ENTRY",
        content: "Surname",
        orderNo: 1,
        numberFrom: 14,
        numberTo: 14,
        choiceLimit: 0,
        options: [],
      },
    } as unknown as QuestionCardProps;
    render(
      <MantineProvider>
        <QuestionCard
          {...props}
          textAnswer="Mitchel"
          onChangeText={onChangeText}
        />
      </MantineProvider>,
    );

    expect(screen.getByRole("textbox")).toHaveValue("Mitchel");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Mitchell" },
    });
    expect(onChangeText).toHaveBeenCalledWith("Mitchell");
  });

  it("offers a matching question the set's shared list under its own labels", () => {
    const props = {
      ...fixture("MATCHING"),
      questionSet: {
        setOptions: [
          { id: "i", label: "i", content: "A new beginning", orderNo: 1 },
          { id: "ii", label: "ii", content: "An old problem", orderNo: 2 },
        ],
        questions: [],
      },
      question: {
        id: "q",
        questionType: "MATCHING",
        content: "Paragraph A",
        orderNo: 1,
        numberFrom: 1,
        numberTo: 1,
        choiceLimit: 1,
        options: [],
      },
    } as unknown as QuestionCardProps;
    render(
      <MantineProvider>
        <QuestionCard {...props} selectedOptionIds={[]} />
      </MantineProvider>,
    );

    const choices = screen.getAllByRole("radio");
    expect(choices).toHaveLength(2);
    expect(screen.getByText("ii")).toBeInTheDocument();
    fireEvent.click(choices[1]);
    expect(props.onSelectOption).toHaveBeenCalledWith("ii");
  });
});
