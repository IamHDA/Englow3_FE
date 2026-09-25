import { CombinedGraphQLErrors } from "@apollo/client";
import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { LoadErrorState } from "./index";

vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: true }),
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

  it("takes the page's word for it when told the thing is missing", () => {
    renderState({ kind: "not-found" });

    expect(screen.getByText("Không tìm thấy bộ thẻ")).toBeInTheDocument();
  });
});
