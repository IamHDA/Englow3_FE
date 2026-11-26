import { ExamQuestionType } from "@/lib/graphql/generated";

import { fromDraft, toSubmitInput, type Paper } from "../answers";

function q(
  id: string,
  type: ExamQuestionType,
  orderNo: number,
  options: string[] = [],
) {
  return {
    id,
    questionType: type,
    content: "",
    difficultyLevel: null,
    skillType: null,
    questionCategory: null,
    orderNo,
    maxRawScore: 1,
    numberFrom: orderNo,
    numberTo: orderNo,
    choiceLimit: null,
    options: options.map((option, index) => ({
      id: option,
      content: option,
      orderNo: index,
    })),
  };
}

const paper = {
  id: "p",
  title: "",
  description: null,
  examType: null,
  certificateType: null,
  certificateVariant: null,
  targetLevel: null,
  durationSeconds: 0,
  maxRawScore: 0,
  passScore: null,
  versionNumber: 1,
  sections: [
    {
      id: "s",
      sectionType: "READING",
      orderNo: 1,
      maxRawScore: 0,
      scoredByCriteria: false,
      timeLimitSeconds: null,
      parts: [
        {
          id: "pt",
          orderNo: 1,
          title: "",
          instruction: null,
          content: null,
          audioUrl: null,
          imageUrl: null,
          questionSets: [
            {
              id: "set",
              title: null,
              instruction: null,
              orderNo: 1,
              content: null,
              audioUrl: null,
              imageUrl: null,
              setOptions: [
                { id: "i", label: "i", content: "", orderNo: 1 },
                { id: "ii", label: "ii", content: "", orderNo: 2 },
              ],
              questions: [
                q("single", ExamQuestionType.SINGLE_CHOICE, 1, ["a", "b"]),
                q("multi", ExamQuestionType.MULTIPLE_CHOICE, 2, [
                  "c",
                  "d",
                  "e",
                ]),
                q("typed", ExamQuestionType.TEXT_ENTRY, 3),
                q("match", ExamQuestionType.MATCHING, 4),
                q("skipped", ExamQuestionType.SINGLE_CHOICE, 5, ["f"]),
              ],
            },
          ],
        },
      ],
    },
  ],
} as unknown as Paper;

describe("toSubmitInput", () => {
  it("sends every question once, in paper order, skipped ones empty", () => {
    const input = toSubmitInput(paper, {
      single: "b",
      multi: ["c", "e", "c"],
      typed: { text: "  photosynthesis  " },
      match: "ii",
    });
    expect(input).toEqual([
      { questionId: "single", selectedOptionIds: ["b"] },
      { questionId: "multi", selectedOptionIds: ["c", "e"] },
      {
        questionId: "typed",
        selectedOptionIds: [],
        textAnswer: "photosynthesis",
      },
      { questionId: "match", selectedOptionIds: ["ii"] },
      { questionId: "skipped", selectedOptionIds: [] },
    ]);
  });

  it("drops ids that are not the question's own and caps typed text", () => {
    const input = toSubmitInput(paper, {
      single: "zzz",
      match: "a",
      typed: { text: "x".repeat(500) },
    });
    expect(input[0]?.selectedOptionIds).toEqual([]);
    expect(input[3]?.selectedOptionIds).toEqual([]);
    expect(input[2]?.textAnswer).toHaveLength(200);
  });
});

describe("fromDraft", () => {
  it("restores each type into the shape the screen edits", () => {
    expect(
      fromDraft(
        [
          { questionId: "single", selectedOptionIds: ["a"] },
          { questionId: "multi", selectedOptionIds: ["c", "d"] },
          { questionId: "typed", selectedOptionIds: [], textAnswer: "word" },
          { questionId: "gone", selectedOptionIds: ["a"] },
        ],
        paper,
      ),
    ).toEqual({ single: "a", multi: ["c", "d"], typed: { text: "word" } });
  });
});
