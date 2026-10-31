import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CurrentLevelStep } from "./index";
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: true }),
}));
it("offers a prominent placement action without declaring a level for the learner", () => {
  const placement = vi.fn();
  const save = vi.fn();
  render(
    <MantineProvider>
      <CurrentLevelStep
        initialLevel={null}
        pending={false}
        errorMessage={null}
        onContinue={save}
        onTakePlacementTest={placement}
      />
    </MantineProvider>,
  );
  expect(screen.getByRole("button", { name: "Tiếp tục" })).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "Làm bài kiểm tra đầu vào" }),
  );
  expect(placement).toHaveBeenCalledOnce();
  expect(save).not.toHaveBeenCalled();
});
