import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { TutorPolicyControls } from "./index";

const mocks = vi.hoisted(() => ({ save: vi.fn(), refetch: vi.fn() }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useTutorPolicyQuery: () => ({
    data: {
      tutorPolicy: {
        accepting: true,
        allowedModes: ["GENERAL"],
        version: 4,
        environmentEnabled: true,
        model: "configured-model",
        dailyLimit: 20,
        streamingEnabled: false,
        voiceEnabled: false,
      },
    },
    loading: false,
    refetch: mocks.refetch,
  }),
  useUpdateTutorPolicyMutation: () => [mocks.save, { loading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("englow3_lang", "vi");
  mocks.save.mockResolvedValue({});
  mocks.refetch.mockResolvedValue({});
});
function mount() {
  render(
    <MantineProvider env="test">
      <LanguageProvider>
        <TutorPolicyControls />
      </LanguageProvider>
    </MantineProvider>,
  );
}
it("sends only editable settings with their original version and a required reason", async () => {
  mount();
  const user = userEvent.setup();
  await user.click(screen.getByRole("switch"));
  expect(
    screen.getByRole("button", { name: "Lưu điều khiển Tutor" }),
  ).toBeDisabled();
  await user.type(
    screen.getByRole("textbox", { name: "Lý do thay đổi" }),
    "Bảo trì dịch vụ",
  );
  await user.click(
    screen.getByRole("button", { name: "Lưu điều khiển Tutor" }),
  );
  await waitFor(() =>
    expect(mocks.save).toHaveBeenCalledWith({
      variables: {
        input: {
          accepting: false,
          allowedModes: ["GENERAL"],
          version: 4,
          reason: "Bảo trì dịch vụ",
        },
      },
    }),
  );
  expect(await screen.findByText("Đã lưu cấu hình.")).toBeInTheDocument();
});
it("keeps an unsaved draft when optimistic concurrency rejects the update", async () => {
  mocks.save.mockRejectedValue(new Error("TUTOR_POLICY_STALE"));
  mount();
  const user = userEvent.setup();
  await user.click(screen.getByRole("switch"));
  await user.type(
    screen.getByRole("textbox", { name: "Lý do thay đổi" }),
    "Bảo trì dịch vụ",
  );
  await user.click(
    screen.getByRole("button", { name: "Lưu điều khiển Tutor" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Bản nháp vẫn được giữ",
  );
  expect(screen.getByRole("switch")).not.toBeChecked();
  expect(screen.getByRole("textbox", { name: "Lý do thay đổi" })).toHaveValue(
    "Bảo trì dịch vụ",
  );
  expect(mocks.refetch).not.toHaveBeenCalled();
});
