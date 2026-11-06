import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { CertificateVariant } from "@/lib/graphql/generated/schemaTypes";
import type { FullTestComponentsQuery } from "@/lib/graphql/generated/documents";
import { FullTestForm, type FullTestFormValues } from "./index";

const task = (id: string, taskType: string, extra: object = {}) => ({
  __typename: "AssessmentTask" as const,
  id,
  title: `Task ${id}`,
  taskType,
  certificateType: "IELTS",
  ...extra,
});

const components = {
  papers: {
    items: [
      {
        id: "academic-paper",
        title: "Academic mock 1",
        certificateType: "IELTS",
        certificateVariant: CertificateVariant.ACADEMIC,
      },
      {
        id: "general-paper",
        title: "General mock 1",
        certificateType: "IELTS",
        certificateVariant: CertificateVariant.GENERAL,
      },
      {
        id: "toeic-paper",
        title: "TOEIC mock",
        certificateType: "TOEIC",
        certificateVariant: CertificateVariant.LR,
      },
    ],
  },
  writingTasks: {
    items: [
      task("w1", "TASK_1", { imageUrl: null }),
      task("w2", "TASK_2", { imageUrl: null }),
    ],
  },
  speakingTasks: {
    items: [task("s1", "PART_1"), task("s2", "PART_2"), task("s3", "PART_3")],
  },
} as unknown as FullTestComponentsQuery;

const empty: FullTestFormValues = {
  title: "",
  description: "",
  certificateVariant: CertificateVariant.ACADEMIC,
  examId: "",
  writingTask1Id: "",
  writingTask2Id: "",
  speakingPart1Id: "",
  speakingPart2Id: "",
  speakingPart3Id: "",
};

function renderForm(initial: FullTestFormValues = empty) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <MantineProvider theme={theme}>
      <FullTestForm
        initial={initial}
        components={components}
        submitting={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    </MantineProvider>,
  );
  return { onSubmit };
}

describe("FullTestForm", () => {
  it("asks for a title and every part before saving", async () => {
    const { onSubmit } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Nhập tên full test.")).toBeInTheDocument();
    expect(screen.getAllByText("Chọn một đề.")).toHaveLength(6);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("offers only IELTS papers of the chosen variant", async () => {
    renderForm();
    fireEvent.click(
      screen.getByRole("combobox", { name: /Đề Listening \+ Reading/ }),
    );
    expect(
      await screen.findByRole("option", { name: "Academic mock 1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "General mock 1" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "TOEIC mock" }),
    ).not.toBeInTheDocument();
  });

  it("flags an Academic Task 1 that has no chart yet", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("combobox", { name: /Writing Task 1/ }));
    expect(
      await screen.findByRole("option", { name: "Task w1 (chưa có biểu đồ)" }),
    ).toBeInTheDocument();
  });

  it("saves a complete full test and keeps a pick that is no longer published", async () => {
    const filled: FullTestFormValues = {
      ...empty,
      title: "IELTS Academic 1",
      examId: "academic-paper",
      writingTask1Id: "w1",
      writingTask2Id: "retired-task",
      speakingPart1Id: "s1",
      speakingPart2Id: "s2",
      speakingPart3Id: "s3",
    };
    const { onSubmit } = renderForm(filled);
    expect(
      screen.getByRole("combobox", { name: /Writing Task 2/ }),
    ).toHaveValue("(không còn là đề đã phát hành)");
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(filled, expect.anything()),
    );
  });
});
