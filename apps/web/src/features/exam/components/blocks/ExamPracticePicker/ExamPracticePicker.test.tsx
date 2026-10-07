import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ExamOutlineSection } from "../../../types";
import { ExamPracticePicker } from "./index";

const sections = [
  {
    id: "listening",
    sectionType: "LISTENING",
    orderNo: 1,
    parts: [
      { id: "p1", orderNo: 1, title: "Part 1: Photographs", questionCount: 6 },
      {
        id: "p2",
        orderNo: 2,
        title: "Part 2: Question-Response",
        questionCount: 25,
      },
      {
        id: "empty",
        orderNo: 3,
        title: "Part 3: Conversations",
        questionCount: 0,
      },
    ],
  },
  {
    id: "reading",
    sectionType: "READING",
    orderNo: 2,
    parts: [
      {
        id: "p5",
        orderNo: 1,
        title: "Part 5: Incomplete Sentences",
        questionCount: 30,
      },
    ],
  },
] as ExamOutlineSection[];

function renderPicker(onStart = vi.fn()) {
  render(
    <MantineProvider>
      <ExamPracticePicker
        sections={sections}
        loading={false}
        failed={false}
        starting={false}
        onRetry={vi.fn()}
        onStart={onStart}
      />
    </MantineProvider>,
  );
  return onStart;
}

const startButton = () =>
  screen.getByRole("button", { name: /luyện tập|start practice/i });

describe("ExamPracticePicker", () => {
  it("cannot start until a part is chosen", () => {
    renderPicker();
    expect(startButton()).toBeDisabled();
  });

  it("locks a part that holds no questions", () => {
    renderPicker();
    expect(
      screen.getByRole("checkbox", { name: "Part 3: Conversations" }),
    ).toBeDisabled();
  });

  it("starts an untimed practice of exactly the parts ticked", () => {
    const onStart = renderPicker();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Part 1: Photographs" }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Part 5: Incomplete Sentences" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/2 part.*36/);

    fireEvent.click(startButton());
    expect(onStart).toHaveBeenCalledWith(["p1", "p5"], null);
  });

  it("ticks every usable part of a skill at once, skipping empty ones", () => {
    const onStart = renderPicker();

    fireEvent.click(screen.getByRole("checkbox", { name: /Nghe|Listening/ }));
    fireEvent.click(startButton());

    expect(onStart).toHaveBeenCalledWith(["p1", "p2"], null);
  });
});
