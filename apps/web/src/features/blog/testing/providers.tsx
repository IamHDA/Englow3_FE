import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";

export type TestLanguage = "vi" | "en";

/**
 * A screen of the blog as the app draws it: inside the Mantine theme and the
 * language provider, in the language the test names. The language is read from
 * the same storage the app reads it from. `env="test"` is Mantine's own switch
 * for tests: no transitions, so a dropdown is in the accessibility tree the
 * moment it opens.
 */
export function renderInApp(ui: ReactElement, language: TestLanguage = "vi") {
  localStorage.setItem("englow3_lang", language);
  return render(
    <MantineProvider theme={theme} env="test">
      <LanguageProvider>{ui}</LanguageProvider>
    </MantineProvider>,
  );
}

/** Puts the interface language back after a test that changed it. */
export function resetLanguage() {
  localStorage.setItem("englow3_lang", "vi");
}
