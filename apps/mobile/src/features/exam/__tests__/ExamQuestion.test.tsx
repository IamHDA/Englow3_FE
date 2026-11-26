import { fireEvent, render, screen } from "@testing-library/react-native";

import { ExamQuestionType } from "@/lib/graphql/generated";

import type { PaperQuestion, PaperSet } from "../answers";
import { ExamQuestion, GapText } from "../ExamQuestion";

const set = { id: "s", setOptions: [], questions: [] } as unknown as PaperSet;

function question(extra: Partial<PaperQuestion>): PaperQuestion {
  return {
    id: "q",
    questionType: ExamQuestionType.MULTIPLE_CHOICE,
    content: "Which TWO are true?",
    difficultyLevel: null,
    skillType: null,
    questionCategory: null,
    orderNo: 1,
    maxRawScore: 2,
    numberFrom: 21,
    numberTo: 22,
    choiceLimit: 2,
    options: ["a", "b", "c"].map((id, index) => ({
      id,
      content: `Option ${id}`,
      orderNo: index,
    })),
    ...extra,
  } as PaperQuestion;
}

describe("ExamQuestion", () => {
  it("numbers a two-mark question as a range and stops at the choice limit", async () => {
    const onChange = jest.fn();
    await render(
      <ExamQuestion
        question={question({})}
        set={set}
        answer={["a", "b"]}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("21–22. Which TWO are true?")).toBeTruthy();
    await fireEvent.press(screen.getByText("C. Option c"));
    expect(onChange).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText("A. Option a"));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("clears a single choice when it is tapped again", async () => {
    const onChange = jest.fn();
    await render(
      <ExamQuestion
        question={question({
          questionType: ExamQuestionType.SINGLE_CHOICE,
          choiceLimit: undefined,
          numberTo: 21,
        })}
        set={set}
        answer="a"
        onChange={onChange}
      />,
    );
    await fireEvent.press(screen.getByText("A. Option a"));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});

describe("GapText", () => {
  it("shows what was typed in each numbered gap", async () => {
    const gapSet = {
      id: "s",
      setOptions: [],
      questions: [
        question({ id: "g1", numberFrom: 1, numberTo: 1 }),
        question({ id: "g2", numberFrom: 2, numberTo: 2 }),
      ],
    } as unknown as PaperSet;
    await render(
      <GapText
        content="Born in {{1}}, moved to {{2}}."
        set={gapSet}
        answers={{ g1: { text: "Hanoi" } }}
      />,
    );

    expect(screen.getByText(/\(1\) Hanoi/)).toBeTruthy();
    expect(screen.getByText(/\(2\) ______/)).toBeTruthy();
  });
});
