import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GenerationRequestFieldsFragment } from "@/lib/graphql/generated/documents";
import {
  GenerationKind,
  GenerationStatus,
} from "@/lib/graphql/generated/schemaTypes";
import { theme } from "@/lib/mantine/theme";

import { GenerationRequestList } from "./index";

/** The case seen on testing: every part written, stopped at the Task 1 chart. */
function failedAtChart(
  overrides: Partial<GenerationRequestFieldsFragment> = {},
): GenerationRequestFieldsFragment {
  return {
    __typename: "GenerationRequest",
    id: "r1",
    kind: GenerationKind.IELTS_FULL_TEST,
    status: GenerationStatus.FAILED,
    step: "chart",
    stepIndex: 12,
    stepsTotal: 18,
    attempt: 0,
    brief: null,
    requestedByName: "Staff",
    title: "Rivers and cities",
    examId: "e1",
    taskIds: ["t1", "t2", "t3", "t4", "t5"],
    fullTestId: null,
    failureCode: "AI_JOB_EXPIRED",
    failureMessage: "A step stopped and was not retried: AI_JOB_EXPIRED",
    lastProblems: [],
    resumeCount: 0,
    resumable: true,
    createdAt: "2026-11-21T05:30:00Z",
    completedAt: "2026-11-21T05:44:07Z",
    ...overrides,
  } as GenerationRequestFieldsFragment;
}

function renderList(
  request: GenerationRequestFieldsFragment,
  props: { onResume?: (id: string) => void; inProgress?: boolean } = {},
) {
  render(
    <MantineProvider theme={theme}>
      <GenerationRequestList requests={[request]} {...props} />
    </MantineProvider>,
  );
}

const resumeButton = () =>
  screen.queryByRole("button", {
    name: /Chạy tiếp từ bước lỗi|Resume from this step/,
  });

describe("GenerationRequestList", () => {
  it("resumes a failed request from the step it stopped at", () => {
    const onResume = vi.fn();
    renderList(failedAtChart(), { onResume });

    fireEvent.click(resumeButton()!);

    expect(onResume).toHaveBeenCalledWith("r1");
  });

  it("offers no resume for a request the backend says cannot resume", () => {
    renderList(failedAtChart({ resumable: false, resumeCount: 3 }), {
      onResume: vi.fn(),
    });

    expect(resumeButton()).toBeNull();
  });

  it("waits while another request of the author is running", () => {
    const onResume = vi.fn();
    renderList(failedAtChart(), { onResume, inProgress: true });

    expect(resumeButton()).toHaveProperty("disabled", true);
  });
});
