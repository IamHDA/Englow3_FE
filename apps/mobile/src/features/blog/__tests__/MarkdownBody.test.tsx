import { fireEvent, render, screen } from "@testing-library/react-native";
import * as WebBrowser from "expo-web-browser";

import { MarkdownBody } from "../MarkdownBody";

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({ type: "opened" })),
}));

const IMAGE_ID = "3f2a7c1e-9b4d-4e8a-a1c2-0d5e6f7a8b9c";

// Renders through react-native-markdown-display with the markdown-it the
// workspace override pins, so a parser upgrade that breaks the renderer's
// token handling fails here rather than on a phone.
describe("MarkdownBody", () => {
  it("renders headings, emphasis, lists and autolinked text", async () => {
    await render(
      <MarkdownBody
        body={[
          "# Study plan",
          "",
          "Practise **every** day.",
          "",
          "- Listening",
          "- Reading",
          "",
          "> Keep going",
        ].join("\n")}
        images={[]}
      />,
    );

    expect(screen.getByText("Study plan")).toBeTruthy();
    expect(screen.getByText("every")).toBeTruthy();
    expect(screen.getByText("Listening")).toBeTruthy();
    expect(screen.getByText("Reading")).toBeTruthy();
    expect(screen.getByText("Keep going")).toBeTruthy();
  });

  it("opens safe links in the browser and ignores unsafe ones", async () => {
    await render(
      <MarkdownBody
        body={
          "[guide](https://example.com/guide) and [bad](javascript:alert(1))"
        }
        images={[]}
      />,
    );

    await fireEvent.press(screen.getByText("guide"));
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      "https://example.com/guide",
    );

    jest.mocked(WebBrowser.openBrowserAsync).mockClear();
    const bad = screen.queryByText("bad");
    if (bad) await fireEvent.press(bad);
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it("shows only the post's own uploaded images", async () => {
    await render(
      <MarkdownBody
        body={[
          `![chart](blog-image:${IMAGE_ID})`,
          "",
          "![tracker](https://evil.example/pixel.png)",
        ].join("\n")}
        images={[{ id: IMAGE_ID, url: "https://cdn.example/chart.png" }]}
      />,
    );

    expect(screen.getByLabelText("chart")).toBeTruthy();
    expect(screen.queryByLabelText("tracker")).toBeNull();
  });
});
