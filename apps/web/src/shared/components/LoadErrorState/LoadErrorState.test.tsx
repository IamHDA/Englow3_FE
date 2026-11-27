import { CombinedGraphQLErrors } from "@apollo/client";
import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { vi as viCopy } from "@/shared/constants/translations/vi";

import { LoadErrorState } from "./index";

vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: true, t: viCopy }),
}));

const BACK = { href: "/study/flashcards", label: "Về thư viện bộ thẻ" };
const THING = { vi: "bộ thẻ", en: "deck" };

function errorWithCode(code: string) {
  return new CombinedGraphQLErrors({
    errors: [{ message: "failed", extensions: { code } }],
  });
}

function renderState(props: Partial<Parameters<typeof LoadErrorState>[0]>) {
  render(
    <MantineProvider theme={theme}>
      <LoadErrorState thing={THING} back={BACK} {...props} />
    </MantineProvider>,
  );
}

describe("LoadErrorState", () => {
  /** A missing deck is not a connection problem, and retrying will not find it. */
  it("says a missing thing does not exist and offers only the way back", () => {
    renderState({ error: errorWithCode("NOT_FOUND"), onRetry: vi.fn() });

    expect(screen.getByText("Không tìm thấy bộ thẻ")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Về thư viện bộ thẻ/ }),
    ).toHaveAttribute("href", "/study/flashcards");
    expect(screen.queryByRole("button", { name: /Thử lại/ })).toBeNull();
  });

  it("says the server did not answer and offers to try again", () => {
    const onRetry = vi.fn();
    renderState({ error: errorWithCode("BACKEND_UNAVAILABLE"), onRetry });

    expect(screen.getByText("Không tải được bộ thẻ")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Thử lại/ }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  /** "Pick one from the library" is nonsense for a person: such a page words its own. */
  it("says what the page says when a missing thing is not in a library", () => {
    renderState({
      kind: "not-found",
      thing: "người dùng",
      notFoundDescription: "Người dùng này không tồn tại.",
    });

    expect(screen.getByText("Không tìm thấy người dùng")).toBeInTheDocument();
    expect(
      screen.getByText("Người dùng này không tồn tại."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/chọn lại từ thư viện/)).toBeNull();
  });

  it("takes the page's word for it when told the thing is missing", () => {
    renderState({ kind: "not-found" });

    expect(screen.getByText("Không tìm thấy bộ thẻ")).toBeInTheDocument();
  });
});
