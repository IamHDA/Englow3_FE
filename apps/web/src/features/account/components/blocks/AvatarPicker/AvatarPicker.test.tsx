import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/shared/context/LanguageContext";

const state = vi.hoisted(() => ({
  choose: vi.fn(),
  refresh: vi.fn(),
  onClose: vi.fn(),
}));

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAvatarPresetsQuery: () => ({
    loading: false,
    error: undefined,
    data: {
      avatarPresets: [
        { id: "fox", url: "/avatars/fox.svg" },
        { id: "owl", url: "/avatars/owl.svg" },
      ],
    },
  }),
  useChooseAvatarMutation: () => [state.choose, { loading: false }],
}));
vi.mock("../../../hooks/useAccountProfile", () => ({
  useAccountProfile: () => ({ refresh: state.refresh }),
}));

import { AvatarPicker } from "./index";

beforeEach(() => {
  localStorage.setItem("englow3_lang", "vi");
  state.choose.mockReset().mockResolvedValue({ data: {} });
  state.refresh.mockReset().mockResolvedValue(undefined);
  state.onClose.mockReset();
});

function renderPicker(currentUrl: string | null) {
  return render(
    <MantineProvider env="test">
      <LanguageProvider>
        <AvatarPicker opened onClose={state.onClose} currentUrl={currentUrl} />
      </LanguageProvider>
    </MantineProvider>,
  );
}

it("marks the picture the profile already wears", () => {
  renderPicker("/avatars/owl.svg");

  expect(screen.getByRole("radio", { name: "owl" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getByRole("button", { name: "Lưu ảnh" })).toBeDisabled();
});

it("saves the chosen preset, reloads the profile and closes", async () => {
  const user = userEvent.setup();
  renderPicker(null);

  await user.click(screen.getByRole("radio", { name: "fox" }));
  await user.click(screen.getByRole("button", { name: "Lưu ảnh" }));

  await waitFor(() => expect(state.onClose).toHaveBeenCalled());
  expect(state.choose).toHaveBeenCalledWith({ variables: { preset: "fox" } });
  expect(state.refresh).toHaveBeenCalled();
});

it("stays open and says so when saving fails", async () => {
  state.choose.mockRejectedValue(new Error("down"));
  const user = userEvent.setup();
  renderPicker(null);

  await user.click(screen.getByRole("radio", { name: "fox" }));
  await user.click(screen.getByRole("button", { name: "Lưu ảnh" }));

  expect(await screen.findByText(/Không đổi được ảnh/)).toBeInTheDocument();
  expect(state.onClose).not.toHaveBeenCalled();
});
