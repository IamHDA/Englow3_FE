import { QuizQuestionType } from "@/lib/graphql/generated";

import {
  encodeAnswer,
  isAnswered,
  type PaperQuestion,
} from "../answerEncoding";

function question(
  type: QuizQuestionType,
  extra: Partial<PaperQuestion> = {},
): PaperQuestion {
  return {
    id: "q1",
    orderNo: 1,
    questionType: type,
    title: "",
    prompt: "",
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

describe("encodeAnswer", () => {
  it("sends the option id for multiple choice and the text for a blank", () => {
    expect(
      encodeAnswer(question(QuizQuestionType.MULTIPLE_CHOICE), "opt-2"),
    ).toBe("opt-2");
    expect(encodeAnswer(question(QuizQuestionType.FILL_BLANK), "went")).toBe(
      "went",
    );
  });

  it("joins picked words with spaces for reorder and rewrite", () => {
    expect(
      encodeAnswer(question(QuizQuestionType.REORDER), ["I", "am", "here"]),
    ).toBe("I am here");
    expect(
      encodeAnswer(question(QuizQuestionType.REWRITE), ["had", "been"]),
    ).toBe("had been");
  });

  it("orders matching answers by the left column and keeps empty slots", () => {
    const matching = question(QuizQuestionType.MATCHING, {
      leftTexts: ["cat", "dog", "cow"],
    });
    expect(encodeAnswer(matching, { dog: "chó", cat: "mèo" })).toBe("mèo|chó|");
  });

  it("sends an empty answer rather than nothing when the learner skipped", () => {
    expect(
      encodeAnswer(question(QuizQuestionType.MULTIPLE_CHOICE), undefined),
    ).toBe("");
    expect(
      encodeAnswer(
        question(QuizQuestionType.MATCHING, { leftTexts: ["a"] }),
        undefined,
      ),
    ).toBe("");
  });
});

describe("isAnswered", () => {
  it("needs every pair for matching", () => {
    const matching = question(QuizQuestionType.MATCHING, {
      leftTexts: ["a", "b"],
    });
    expect(isAnswered(matching, { a: "1" })).toBe(false);
    expect(isAnswered(matching, { a: "1", b: "2" })).toBe(true);
  });

  it("ignores whitespace-only text", () => {
    expect(isAnswered(question(QuizQuestionType.FILL_BLANK), "   ")).toBe(
      false,
    );
  });
});
