import {
  editableDocument,
  entriesOf,
  initialDocument,
  isAuthoringKind,
  makeEntry,
  metadataFields,
  saveBody,
  withEntries,
} from "../document";
import {
  blankPart,
  blankQuestion,
  changeQuestionType,
  newSection,
  normalizeExam,
} from "../exam";
import { parseReport } from "../importApi";
import type { ExamSection } from "../types";

describe("authoring documents", () => {
  it("starts each kind with what its editor expects", () => {
    expect(initialDocument("FLASHCARD_SET").content?.cards).toHaveLength(1);
    expect(initialDocument("QUIZ").content?.questions).toHaveLength(1);
    expect(initialDocument("DICTATION_LESSON").sentences).toHaveLength(1);
    expect(initialDocument("EXAM").content?.sections).toEqual([]);
    expect(initialDocument("SPEAKING_PROMPT").content).toBeUndefined();
  });

  it("moves top-level cards and questions from the server under content", () => {
    const card = makeEntry("FLASHCARD_SET");
    const loaded = editableDocument("FLASHCARD_SET", {
      version: 3,
      metadata: {},
      cards: [card],
    });
    expect(loaded.content?.cards).toEqual([card]);
    expect(entriesOf("FLASHCARD_SET", loaded)).toEqual([card]);
  });

  it("puts entries back where each kind keeps them", () => {
    const doc = initialDocument("DICTATION_LESSON");
    const sentence = { ...makeEntry("DICTATION_LESSON"), text: "Hello" };
    expect(withEntries("DICTATION_LESSON", doc, [sentence]).sentences).toEqual([
      sentence,
    ]);
    expect(
      withEntries("QUIZ", initialDocument("QUIZ"), []).content?.questions,
    ).toEqual([]);
  });

  it("asks for a topic on dictation, a description on a quiz, both required on an exam", () => {
    expect(metadataFields("DICTATION_LESSON").map((f) => f.key)).toEqual([
      "title",
      "topic",
    ]);
    expect(metadataFields("QUIZ").map((f) => f.key)).toEqual([
      "title",
      "description",
    ]);
    expect(
      metadataFields("EXAM").find((f) => f.key === "description")?.required,
    ).toBe(true);
    expect(
      metadataFields("EXAM").find((f) => f.key === "title")?.maxLength,
    ).toBe(100);
  });

  it("fills a missing slug, totals an exam and leaves media out of the body", () => {
    const doc = {
      ...initialDocument("EXAM"),
      media: { key: "https://cdn/x.mp3" },
      content: {
        sections: normalizeExam([
          {
            ...newSection([]),
            parts: [
              {
                ...blankPart(),
                questionSets: [
                  {
                    ...blankPart().questionSets[0]!,
                    questions: [
                      { ...blankQuestion("READING"), maxRawScore: 2 },
                      { ...blankQuestion("READING"), maxRawScore: 1.5 },
                    ],
                  },
                ],
              },
            ],
          },
        ]),
      },
    };
    const body = saveBody("EXAM", doc, () => "abc");
    expect(body.metadata.slug).toBe("lesson-abc");
    expect(body.metadata.maxRawScore).toBe(3.5);
    expect(body.media).toBeUndefined();
    expect(doc.metadata.slug).toBe("");
  });

  it("knows the authoring kinds", () => {
    expect(isAuthoringKind("EXAM")).toBe(true);
    expect(isAuthoringKind("ASSESSMENT_TASK")).toBe(false);
  });
});

describe("exam tree", () => {
  it("numbers questions across the whole exam and totals each section", () => {
    const section = (score: number): ExamSection => ({
      ...newSection([]),
      parts: [
        {
          ...blankPart(),
          questionSets: [
            {
              ...blankPart().questionSets[0]!,
              questions: [
                { ...blankQuestion("READING"), maxRawScore: score },
                { ...blankQuestion("READING"), maxRawScore: score },
              ],
            },
          ],
        },
      ],
    });
    const [first, second] = normalizeExam([section(1), section(2)]);
    expect(first?.maxRawScore).toBe(2);
    expect(second?.maxRawScore).toBe(4);
    expect(
      second?.parts[0]?.questionSets[0]?.questions.map((q) => q.orderNo),
    ).toEqual([3, 4]);
    expect(second?.orderNo).toBe(2);
  });

  it("adds Listening once Reading is there", () => {
    const reading = newSection([]);
    expect(reading.sectionType).toBe("READING");
    expect(newSection([reading]).sectionType).toBe("LISTENING");
  });

  it("drops what a new answer type cannot hold", () => {
    const choice = blankQuestion("READING");
    const gap = changeQuestionType(choice, "TEXT_ENTRY");
    expect(gap.options).toEqual([]);
    expect(gap.acceptedAnswers).toHaveLength(1);
    const back = changeQuestionType(gap, "SINGLE_CHOICE");
    expect(back.options).toHaveLength(2);
    expect(back.acceptedAnswers).toEqual([]);
  });
});

describe("import reports", () => {
  it("accepts the backend's report", () => {
    expect(
      parseReport(
        JSON.stringify({
          committed: false,
          acceptedCount: 3,
          rejectedCount: 1,
          rejections: [{ index: 4, lemma: "run", reason: "No sense" }],
        }),
      ).acceptedCount,
    ).toBe(3);
  });

  it("refuses anything that is not one", () => {
    expect(() => parseReport("not json")).toThrow(/không hợp lệ/);
    expect(() => parseReport(JSON.stringify({ committed: true }))).toThrow();
  });
});
