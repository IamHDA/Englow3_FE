import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import {
  TutorMessageRole,
  TutorMessageStatus,
} from "@/lib/graphql/generated/schemaTypes";
import { TutorMessageBubble } from "./index";
it("renders useful Markdown while refusing executable links, HTML and tracking images", () => {
  const { container } = render(
    <MantineProvider theme={theme} env="test">
      <LanguageProvider>
        <TutorMessageBubble
          onReport={vi.fn()}
          message={{
            id: "test",
            orderNo: 2,
            role: TutorMessageRole.ASSISTANT,
            status: TutorMessageStatus.READY,
            reported: false,
            revision: 0,
            restartCount: 0,
            createdAt: "2026-10-20T00:00:00Z",
            sources: [],
            summary: false,
            errorCode: null,
            model: null,
            answeredAt: null,
            correction: null,
            reportStatus: null,
            content:
              '**Explanation**\n\n[unsafe](javascript:alert(1))\n\n[safe](https://example.com/material)\n\n<img src="https://tracker.invalid/a" onerror="alert(1)">\n\n![tracking](https://tracker.invalid/b)\n\n<script>alert(1)</script>',
          }}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
  expect(screen.getByText("Explanation").tagName).toBe("STRONG");
  expect(screen.getByRole("link", { name: "safe" })).toHaveAttribute(
    "href",
    "https://example.com/material",
  );
  expect(
    screen.queryByRole("link", { name: "unsafe" }),
  ).not.toBeInTheDocument();
  expect(container.querySelector("img,script,iframe")).toBeNull();
});
