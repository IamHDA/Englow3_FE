import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { AdminLevelCheckWeightsView } from "./index";

const row = (
  purposeCode: string,
  vocabulary: number,
  listening: number,
  speaking: number,
  priority: number,
) => ({
  id: `${purposeCode}-row`,
  purposeCode,
  vocabulary,
  listening,
  speaking,
  priority,
  effectiveFrom: "2026-01-01T00:00:00Z",
  changedBy: null,
});

const data = {
  levelCheckWeights: {
    purposes: [
      {
        purposeCode: "DEFAULT",
        displayName: null,
        inForce: row("DEFAULT", 40, 30, 30, 0),
      },
      {
        purposeCode: "TRAVEL",
        displayName: "Du lịch",
        inForce: row("TRAVEL", 35, 30, 35, 10),
      },
      { purposeCode: "SCHOOL", displayName: "Học ở trường", inForce: null },
    ],
    history: [row("TRAVEL", 35, 30, 35, 10)],
  },
};

const hooks = vi.hoisted(() => ({
  save: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAdminLevelCheckWeightsQuery: () => ({
    data,
    loading: false,
    refetch: hooks.refetch,
  }),
  useSetLevelCheckWeightMutation: () => [hooks.save, { loading: false }],
}));
vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }));

function renderView() {
  render(
    <MantineProvider theme={theme}>
      <AdminLevelCheckWeightsView />
    </MantineProvider>,
  );
}

async function editRow(name: string) {
  // The first match is the table row; the name may appear again in the history.
  const cell = screen.getAllByText(name)[0];
  fireEvent.click(
    cell.closest("tr")!.querySelector("button") as HTMLButtonElement,
  );
  await screen.findByRole("dialog");
}

beforeEach(() => {
  hooks.save.mockReset().mockResolvedValue({});
  hooks.refetch.mockReset().mockResolvedValue({});
});

describe("AdminLevelCheckWeightsView", () => {
  it("shows a purpose without weights of its own as using the default", () => {
    renderView();

    const school = screen.getAllByText("Học ở trường")[0].closest("tr")!;
    expect(school.textContent).toContain("40%");
    expect(school.textContent).toMatch(/theo mặc định|uses default/);
  });

  it("refuses weights that do not add up to 100 before sending them", async () => {
    renderView();
    await editRow("Du lịch");

    fireEvent.change(await screen.findByLabelText(/^Nói|^Speaking/), {
      target: { value: "20" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Lưu|Save/ }));

    expect(
      await screen.findByText(/cộng lại bằng 100|add up to 100/),
    ).toBeTruthy();
    expect(hooks.save).not.toHaveBeenCalled();
  });

  it("saves the purpose's new weights", async () => {
    renderView();
    await editRow("Học ở trường");

    fireEvent.change(await screen.findByLabelText(/^Từ vựng|^Vocabulary/), {
      target: { value: "50" },
    });
    fireEvent.change(await screen.findByLabelText(/^Nói|^Speaking/), {
      target: { value: "20" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Lưu|Save/ }));

    await waitFor(() =>
      expect(hooks.save).toHaveBeenCalledWith({
        variables: {
          input: {
            purposeCode: "SCHOOL",
            vocabulary: 50,
            listening: 30,
            speaking: 20,
            priority: 0,
          },
        },
      }),
    );
  });
});
