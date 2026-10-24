import { CombinedGraphQLErrors } from "@apollo/client";
import { MantineProvider } from "@mantine/core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { LearnerStartCard } from "./index";

const state = vi.hoisted(() => ({
  requiresOnboarding: false,
  hasError: false,
  profile: { id: "application-id", role: "LEARNER" } as {
    id: string;
    role: string;
  } | null,
  load: vi.fn(),
  replay: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/features/account", () => ({
  useAccountProfile: () => ({
    profile: state.profile,
    hasError: state.hasError,
    loading: false,
    refresh: state.refresh,
  }),
}));
vi.mock("@/features/onboarding", () => ({
  useOnboarding: () => ({
    requiresOnboarding: state.requiresOnboarding,
    open: state.open,
    close: state.close,
  }),
}));
vi.mock("@/features/tour", () => ({
  useUserTour: () => ({
    canReplay: !state.requiresOnboarding,
    replay: state.replay,
  }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: true }),
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  usePlacementExamLazyQuery: () => [state.load],
}));
beforeEach(() => {
  vi.clearAllMocks();
  state.requiresOnboarding = false;
  state.profile = { id: "application-id", role: "LEARNER" };
  state.hasError = false;
  state.load.mockResolvedValue({
    data: { placementExam: { id: "published-paper" } },
  });
});
const show = () =>
  render(
    <MantineProvider>
      <LearnerStartCard />
    </MantineProvider>,
  );

it("keeps the guide and placement test visible after setup was completed", () => {
  show();
  fireEvent.click(screen.getByRole("button", { name: "Xem hướng dẫn" }));
  expect(state.replay).toHaveBeenCalledOnce();
  expect(
    screen.getByRole("button", { name: "Làm bài test đầu vào" }),
  ).toBeVisible();
  expect(state.load).not.toHaveBeenCalled();
});
it("shows missing published content explicitly instead of hiding the feature", async () => {
  state.load.mockRejectedValue(
    new CombinedGraphQLErrors({
      errors: [
        {
          message: "Missing",
          extensions: { backendCode: "PLACEMENT_EXAM_NOT_FOUND" },
        },
      ],
    }),
  );
  show();
  fireEvent.click(screen.getByRole("button", { name: "Làm bài test đầu vào" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Chưa có đề kiểm tra đầu vào được phát hành",
  );
  expect(state.push).not.toHaveBeenCalled();
  expect(state.close).not.toHaveBeenCalled();
});
it("can retry after a temporary failure and opens the actual published paper", async () => {
  state.load.mockRejectedValueOnce(new Error("Network offline"));
  show();
  fireEvent.click(screen.getByRole("button", { name: "Làm bài test đầu vào" }));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Làm bài test đầu vào" }));
  await waitFor(() =>
    expect(state.push).toHaveBeenCalledWith("/exams/published-paper"),
  );
  expect(state.close).toHaveBeenCalledOnce();
});
it("prevents repeated clicks from starting parallel requests", async () => {
  let resolve!: (value: unknown) => void;
  state.load.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  show();
  const button = screen.getByRole("button", { name: "Làm bài test đầu vào" });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(state.load).toHaveBeenCalledOnce();
  await act(async () => resolve({ data: { placementExam: { id: "paper" } } }));
});
it("lets an unfinished learner reopen setup and explains when the guide appears", () => {
  state.requiresOnboarding = true;
  show();
  expect(screen.getByRole("button", { name: "Xem hướng dẫn" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục thiết lập" }));
  expect(state.open).toHaveBeenCalledOnce();
});
it("offers recovery if a slow backend prevented profile loading", () => {
  state.profile = null;
  state.hasError = true;
  show();
  fireEvent.click(screen.getByRole("button", { name: "Thử tải lại hồ sơ" }));
  expect(state.refresh).toHaveBeenCalledOnce();
});
