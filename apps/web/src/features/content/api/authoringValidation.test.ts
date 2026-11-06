import { describe, expect, it } from "vitest";
import { validateAuthoring } from "./authoringValidation";
import type {
  AuthoringDocument,
  Entry,
  ExamQuestion,
  ExamSetOption,
} from "../types/authoring";
import { changeQuestionType } from "../components/blocks/ExamTreeEditor";
const document = (entry: Entry): AuthoringDocument => ({
  version: 0,
  metadata: {
    title: "Vocabulary",
    category: "Practice",
    timeLimitSeconds: 600,
    passingScorePercent: 60,
  },
  content: {
    questions: [
      { title: "Question", prompt: "Build the sentence", points: 1, ...entry },
    ],
  },
});

it("rejects a word bank missing a repeated answer token", () => {
  const result = validateAuthoring(
    "QUIZ",
    document({
      questionType: "REWRITE",
      originalSentence: "It is very very good",
      correctWords: ["very", "very", "good"],
      wordBank: ["very", "good"],
    }),
    false,
  );
  expect(result["content.questions[0].wordBank"]).toMatch(/repeated/);
});

it("allows optional banks but rejects reorder tiles that add words", () => {
  const entry = { questionType: "REORDER", correctOrder: ["I", "like", "tea"] };
  expect(validateAuthoring("QUIZ", document(entry), false)).toEqual({});
  expect(
    validateAuthoring(
      "QUIZ",
      document({ ...entry, scrambledWords: ["tea", "like", "I", "too"] }),
      false,
    )["content.questions[0].scrambledWords"],
  ).toBeTruthy();
  expect(
    validateAuthoring(
      "QUIZ",
      document({ ...entry, scrambledWords: ["tea", "I", "like"] }),
      false,
    ),
  ).toEqual({});
});

describe("IELTS exam questions", () => {
  const question = (extra: Partial<ExamQuestion>): ExamQuestion => ({
    questionType: "SINGLE_CHOICE",
    content: "Question",
    difficultyLevel: "MEDIUM",
    skillType: "READING",
    orderNo: 1,
    maxRawScore: 1,
    options: [],
    ...extra,
  });
  const exam = (
    questions: ExamQuestion[],
    setOptions?: ExamSetOption[],
  ): AuthoringDocument => ({
    version: 0,
    metadata: { title: "IELTS", description: "Mock", durationSeconds: 3600 },
    content: {
      sections: [
        {
          sectionType: "READING",
          orderNo: 1,
          maxRawScore: 1,
          scoredByCriteria: false,
          parts: [
            {
              title: "Passage 1",
              orderNo: 1,
              questionSets: [{ orderNo: 1, questions, setOptions }],
            },
          ],
        },
      ],
    },
  });
  const path = "content.sections[0].parts[0].questionSets[0]";
  const entries = [
    { label: "i", content: "Heading one", orderNo: 1 },
    { label: "ii", content: "Heading two", orderNo: 2 },
  ];

  it("accepts a gap with a spelling and no options", () => {
    const gap = question({
      questionType: "TEXT_ENTRY",
      acceptedAnswers: [{ text: "museum", caseSensitive: false, orderNo: 1 }],
    });
    expect(validateAuthoring("EXAM", exam([gap]), false)).toEqual({});
  });

  it("asks a gap for a spelling and refuses empty rows", () => {
    const none = question({ questionType: "TEXT_ENTRY", acceptedAnswers: [] });
    const blank = question({
      questionType: "TEXT_ENTRY",
      acceptedAnswers: [
        { text: "museum", caseSensitive: false, orderNo: 1 },
        { text: " ", caseSensitive: false, orderNo: 2 },
      ],
    });
    expect(
      validateAuthoring("EXAM", exam([none]), false)[
        `${path}.questions[0].acceptedAnswers`
      ],
    ).toMatch(/at least one/);
    expect(
      validateAuthoring("EXAM", exam([blank]), false)[
        `${path}.questions[0].acceptedAnswers`
      ],
    ).toMatch(/empty/);
  });

  it("accepts a matching question answered by a label of its group", () => {
    const match = question({
      questionType: "MATCHING",
      matchingLabels: ["ii"],
    });
    expect(validateAuthoring("EXAM", exam([match], entries), false)).toEqual(
      {},
    );
  });

  it("refuses a matching label the group's list does not have", () => {
    const match = question({ questionType: "MATCHING", matchingLabels: ["v"] });
    expect(
      validateAuthoring("EXAM", exam([match], entries), false)[
        `${path}.questions[0].matchingLabels`
      ],
    ).toBeDefined();
  });

  it("refuses two list entries sharing a label", () => {
    const twice = [entries[0], { ...entries[1], label: " i " }];
    expect(
      validateAuthoring("EXAM", exam([], twice), false)[`${path}.setOptions`],
    ).toBeDefined();
  });
});

describe("changing a question's type", () => {
  const choice: ExamQuestion = {
    questionType: "SINGLE_CHOICE",
    content: "Q",
    difficultyLevel: "MEDIUM",
    skillType: "READING",
    orderNo: 1,
    maxRawScore: 1,
    options: [
      { label: "A", content: "yes", correct: true, orderNo: 1 },
      { label: "B", content: "no", correct: false, orderNo: 2 },
    ],
  };

  it("drops options for a gap and starts one empty spelling", () => {
    const gap = changeQuestionType(choice, "TEXT_ENTRY");
    expect(gap.options).toEqual([]);
    expect(gap.acceptedAnswers).toEqual([
      { text: "", caseSensitive: false, orderNo: 1 },
    ]);
    expect(gap.matchingLabels).toEqual([]);
  });

  it("drops spellings when a gap becomes a matching question", () => {
    const gap = changeQuestionType(choice, "TEXT_ENTRY");
    const match = changeQuestionType(gap, "MATCHING");
    expect(match.acceptedAnswers).toEqual([]);
    expect(match.options).toEqual([]);
  });

  it("gives a choice question two blank options back", () => {
    const back = changeQuestionType(
      changeQuestionType(choice, "MATCHING"),
      "MULTIPLE_CHOICE",
    );
    expect(back.options).toHaveLength(2);
    expect(back.matchingLabels).toEqual([]);
  });
});
