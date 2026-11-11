import { MantineProvider } from "@mantine/core";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FullTestSittingView } from "./index";
const mocks = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: false }),
}));
vi.mock("@/features/exam", () => ({
  paperForFullTestPath: () => "/exams/paper",
}));
vi.mock("../../blocks/FullTestBands", () => ({ FullTestBands: () => null }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useFullTestSittingQuery: () => ({
    data: {
      fullTestSitting: {
        id: "sitting",
        title: "IELTS",
        status: "IN_PROGRESS",
        examId: "paper",
        examAttemptId: null,
        parts: [],
        deadlineAt: "2026-11-18T12:00:00Z",
        bandRevision: 0,
      },
    },
    loading: false,
    startPolling: mocks.start,
    stopPolling: mocks.stop,
    refetch: vi.fn(),
  }),
}));
afterEach(() => vi.restoreAllMocks());
it("stops polling in hidden and offline tabs and cleans up listeners", () => {
  const visibility = vi
    .spyOn(document, "visibilityState", "get")
    .mockReturnValue("visible");
  const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  const view = render(
    <MantineProvider>
      <FullTestSittingView sittingId="sitting" />
    </MantineProvider>,
  );
  expect(mocks.start).toHaveBeenLastCalledWith(30000);
  visibility.mockReturnValue("hidden");
  fireEvent(document, new Event("visibilitychange"));
  expect(mocks.stop).toHaveBeenCalled();
  visibility.mockReturnValue("visible");
  online.mockReturnValue(false);
  mocks.start.mockClear();
  fireEvent(window, new Event("offline"));
  expect(mocks.start).not.toHaveBeenCalled();
  online.mockReturnValue(true);
  fireEvent(window, new Event("online"));
  expect(mocks.start).toHaveBeenCalledOnce();
  view.unmount();
  mocks.start.mockClear();
  fireEvent(window, new Event("online"));
  expect(mocks.start).not.toHaveBeenCalled();
});
