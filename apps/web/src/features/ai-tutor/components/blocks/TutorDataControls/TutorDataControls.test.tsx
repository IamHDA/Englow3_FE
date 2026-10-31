import { MantineProvider } from "@mantine/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { TutorDataControls } from "./index";
beforeEach(() => localStorage.setItem("englow3_lang", "vi"));
afterEach(() => vi.unstubAllGlobals());
it("does not download old-account data if the export finishes after the component is removed", async () => {
  let finish: (value: Response) => void = () => {};
  const delayed = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  const fetcher = vi
    .fn()
    .mockImplementation((url: string, options: RequestInit) => {
      if (!options.signal) throw new Error("Export requests must be abortable");
      return url.includes("kind=MEMORY")
        ? delayed
        : Promise.resolve(Response.json({ items: [], hasMore: false }));
    });
  vi.stubGlobal("fetch", fetcher);
  const download = vi.fn(() => "blob:synthetic");
  const BrowserURL = URL;
  vi.stubGlobal(
    "URL",
    class extends BrowserURL {
      static createObjectURL = download;
      static revokeObjectURL = vi.fn();
    },
  );
  const view = render(
    <MantineProvider env="test">
      <LanguageProvider>
        <TutorDataControls
          account="old-account"
          includeMemory
          onPurged={vi.fn()}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Xuất dữ liệu Tutor" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(6));
  view.unmount();
  await act(async () => {
    finish(Response.json({ items: [], hasMore: false }));
  });
  expect(download).not.toHaveBeenCalled();
  const last = fetcher.mock.calls.at(-1)?.[1];
  expect(last?.signal?.aborted).toBe(true);
});
