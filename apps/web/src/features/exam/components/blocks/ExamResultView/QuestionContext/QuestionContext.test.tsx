import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuestionContext, type QuestionContextProps } from "./index";

function renderContext(overrides: Partial<QuestionContextProps> = {}) {
  const props = {
    part: {
      title: "Part 3",
      instruction: null,
      content: null,
      audioUrl: null,
      imageUrl: null,
    },
    questionSet: {
      title: null,
      instruction: null,
      content: null,
      imageUrl: null,
      audioUrl: "https://example.test/conversation.mp3",
      questions: [],
    },
    questionId: "q33",
    typedAnswers: {},
    ...overrides,
  } as unknown as QuestionContextProps;
  return render(
    <MantineProvider>
      <QuestionContext {...props} />
    </MantineProvider>,
  );
}

describe("QuestionContext", () => {
  it("gives a reviewed question its conversation back, with every control", () => {
    const { container } = renderContext();
    const audio = container.querySelector("audio");
    expect(audio).toHaveAttribute(
      "src",
      "https://example.test/conversation.mp3",
    );
    expect(audio).toHaveAttribute("controls");
  });

  it("shows the passage with the reviewed question's gap and what was typed", () => {
    renderContext({
      questionSet: {
        title: "Complete the notes",
        instruction: null,
        content: "Name: Sarah {{1}}",
        imageUrl: null,
        audioUrl: null,
        questions: [{ id: "q1", orderNo: 1, numberFrom: 14, numberTo: 14 }],
      } as unknown as QuestionContextProps["questionSet"],
      questionId: "q1",
      typedAnswers: { q1: "Mitchell" },
    });
    expect(screen.getByText("Complete the notes")).toBeInTheDocument();
    expect(screen.getByText(/Mitchell/, { selector: "span" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("shows nothing for a question with no material of its own", () => {
    const { container } = renderContext({
      questionSet: {
        title: null,
        instruction: null,
        content: null,
        imageUrl: null,
        audioUrl: null,
        questions: [],
      } as unknown as QuestionContextProps["questionSet"],
    });
    expect(screen.queryByText("Ngữ liệu của câu")).toBeNull();
    expect(container.querySelector("audio")).toBeNull();
  });
});
