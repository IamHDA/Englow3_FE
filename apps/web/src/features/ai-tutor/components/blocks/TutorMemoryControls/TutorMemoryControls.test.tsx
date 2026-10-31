import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { TutorMemoryControls } from "./index";
const mocks = vi.hoisted(() => ({ clear: vi.fn(), refetch: vi.fn() }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useTutorMemoryQuery: () => ({
    data: {
      tutorMemory: {
        enabled: true,
        content: "Synthetic AI notes",
        throughOrder: 20,
        remainingMessages: 24,
        pendingMessageId: null,
        batchSize: 20,
      },
    },
    loading: false,
    refetch: mocks.refetch,
  }),
  useClearTutorMemoryMutation: () => [mocks.clear, { loading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("englow3_lang", "vi");
  mocks.clear.mockResolvedValue({});
  mocks.refetch.mockResolvedValue({});
});
function mount(
  onSummarize = vi.fn().mockResolvedValue(true),
  canSummarize = true,
) {
  render(
    <MantineProvider env="test">
      <LanguageProvider>
        <TutorMemoryControls
          conversationId="owned"
          busy={false}
          updated={0}
          archived={false}
          canSummarize={canSummarize}
          onSummarize={onSummarize}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
  return onSummarize;
}
it("states the AI allowance cost and never starts a summary on its own", async () => {
  const summarize = mount();
  expect(summarize).not.toHaveBeenCalled();
  expect(
    screen.getByText(/Mỗi lần tổng kết dùng 1 lượt AI/),
  ).toBeInTheDocument();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Tổng kết 20 tin · 1 lượt AI" }));
  expect(summarize).toHaveBeenCalledTimes(1);
});
it("allows clearing derived notes even when no AI allowance is left", async () => {
  mount(undefined, false);
  expect(
    screen.getByRole("button", { name: "Tổng kết 20 tin · 1 lượt AI" }),
  ).toBeDisabled();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Ngừng dùng ghi nhớ này" }));
  await waitFor(() =>
    expect(mocks.clear).toHaveBeenCalledWith({
      variables: { conversationId: "owned" },
    }),
  );
  expect(mocks.refetch).toHaveBeenCalledTimes(1);
});
it("retains the visible notes if clearing fails", async () => {
  mocks.clear.mockRejectedValue(new Error("offline"));
  mount();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Ngừng dùng ghi nhớ này" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Nội dung chat được giữ",
  );
  expect(screen.getByText("Synthetic AI notes")).toBeInTheDocument();
});
