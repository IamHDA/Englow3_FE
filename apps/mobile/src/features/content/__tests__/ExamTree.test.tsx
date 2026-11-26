import { fireEvent, render, screen } from "@testing-library/react-native";

import { OptionPicker } from "@/ui/OptionPicker";

import { blankPart, blankQuestion, newSection, normalizeExam } from "../exam";
import { ExamTree } from "../ExamTree";
import type { ExamSection } from "../types";

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

function oneQuestionExam(): ExamSection[] {
  return normalizeExam([
    {
      ...newSection([]),
      parts: [
        {
          ...blankPart(),
          title: "Passage 1",
          questionSets: [
            {
              ...blankPart().questionSets[0]!,
              questions: [blankQuestion("READING")],
            },
          ],
        },
      ],
    },
  ]);
}

describe("ExamTree", () => {
  it("adds a Reading section with one part to an empty exam", async () => {
    const change = jest.fn();
    await render(<ExamTree sections={[]} change={change} errors={{}} />);

    await fireEvent.press(screen.getByText("Thêm kỹ năng"));

    const [sections] = change.mock.calls[0] as [ExamSection[]];
    expect(sections).toHaveLength(1);
    expect(sections[0]?.sectionType).toBe("READING");
    expect(sections[0]?.parts).toHaveLength(1);
  });

  it("asks for media only once the exam is saved", async () => {
    await render(
      <ExamTree sections={oneQuestionExam()} change={jest.fn()} errors={{}} />,
    );
    expect(
      screen.getAllByText("Lưu nháp đề trước khi thêm media.").length,
    ).toBeGreaterThan(0);
  });

  it("switches a question to a gap and shows where its spellings go", async () => {
    const change = jest.fn();
    await render(
      <ExamTree sections={oneQuestionExam()} change={change} errors={{}} />,
    );

    await fireEvent.press(screen.getByText("Điền từ"));

    const [sections] = change.mock.calls[0] as [ExamSection[]];
    const question = sections[0]?.parts[0]?.questionSets[0]?.questions[0];
    expect(question?.questionType).toBe("TEXT_ENTRY");
    expect(question?.options).toEqual([]);
    expect(question?.acceptedAnswers).toHaveLength(1);
  });

  it("shows a field's error from validation", async () => {
    await render(
      <ExamTree
        sections={oneQuestionExam()}
        change={jest.fn()}
        errors={{
          "content.sections[0].parts[0].questionSets[0].questions[0].content":
            "Vui lòng nhập trường này.",
        }}
      />,
    );
    expect(screen.getByText("Vui lòng nhập trường này.")).toBeTruthy();
  });
});

describe("OptionPicker", () => {
  it("shows the pick and changes it from the list", async () => {
    const onChange = jest.fn();
    await render(
      <OptionPicker
        label="Đề Listening + Reading"
        value="a"
        options={[
          { value: "a", label: "Paper A" },
          { value: "b", label: "Paper B" },
        ]}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("Paper A")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Đề Listening + Reading"));
    await fireEvent.press(screen.getByText("Paper B"));

    expect(onChange).toHaveBeenCalledWith("b");
  });
});
