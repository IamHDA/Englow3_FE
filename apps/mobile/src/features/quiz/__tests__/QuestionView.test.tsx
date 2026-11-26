import { fireEvent, render, screen } from "@testing-library/react-native";

import { QuizQuestionType } from "@/lib/graphql/generated";

import type { PaperQuestion, QuizAnswer } from "../answerEncoding";
import { QuestionView } from "../QuestionView";

function question(extra: Partial<PaperQuestion>): PaperQuestion {
  return {
    id: "q",
    orderNo: 1,
    questionType: QuizQuestionType.REORDER,
    title: "",
    prompt: "Put the words in order",
    points: 1,
    beforeText: null,
    afterText: null,
    originalSentence: null,
    rewriteKeyword: null,
    options: [],
    wordBank: [],
    scrambledWords: [],
    leftTexts: [],
    rightTexts: [],
    ...extra,
  };
}

describe("QuestionView", () => {
  it("builds a reorder answer word by word, a repeated word counted once per tap", async () => {
    const onChange = jest.fn();
    let answer: QuizAnswer = ["the"];
    const view = await render(
      <QuestionView
        question={question({ scrambledWords: ["the", "cat", "the"] })}
        answer={answer}
        onChange={onChange}
      />,
    );

    // One "the" is used; the other is still in the pool.
    expect(screen.getAllByText("the")).toHaveLength(2);
    await fireEvent.press(screen.getByText("cat"));
    expect(onChange).toHaveBeenLastCalledWith(["the", "cat"]);

    answer = ["the", "cat"];
    await view.rerender(
      <QuestionView
        question={question({ scrambledWords: ["the", "cat", "the"] })}
        answer={answer}
        onChange={onChange}
      />,
    );
    // Tapping a picked word takes it back out.
    await fireEvent.press(screen.getAllByText("cat")[0]!);
    expect(onChange).toHaveBeenLastCalledWith(["the"]);
  });

  it("gives each right-hand half to one left item at a time when matching", async () => {
    const onChange = jest.fn();
    await render(
      <QuestionView
        question={question({
          questionType: QuizQuestionType.MATCHING,
          leftTexts: ["cat", "dog"],
          rightTexts: ["mèo", "chó"],
        })}
        answer={{ cat: "mèo" }}
        onChange={onChange}
      />,
    );

    // Choosing "mèo" for dog moves it away from cat.
    await fireEvent.press(screen.getAllByText("mèo")[1]!);
    expect(onChange).toHaveBeenLastCalledWith({ dog: "mèo" });
  });

  it("reports the chosen option id for multiple choice", async () => {
    const onChange = jest.fn();
    await render(
      <QuestionView
        question={question({
          questionType: QuizQuestionType.MULTIPLE_CHOICE,
          options: [
            { id: "o1", orderNo: 1, label: "A", content: "went" },
            { id: "o2", orderNo: 2, label: "B", content: "gone" },
          ],
        })}
        answer={undefined}
        onChange={onChange}
      />,
    );
    await fireEvent.press(screen.getByText("B. gone"));
    expect(onChange).toHaveBeenLastCalledWith("o2");
  });
});
