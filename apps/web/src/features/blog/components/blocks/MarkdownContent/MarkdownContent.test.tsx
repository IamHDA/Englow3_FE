import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderInApp } from "../../../testing/providers";

import { MarkdownContent } from "./index";

const ID = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const IMAGES = [{ id: ID, url: "https://storage.example/blog/a.png?sig=1" }];

/**
 * The rules themselves are tested as pure functions (urls.test.ts). This is the
 * wiring: that react-markdown asks them, for the right attribute, on every path
 * an address can take into the page.
 */
function draw(body: string, images = IMAGES) {
  const { container } = renderInApp(
    <MarkdownContent body={body} images={images} />,
  );
  return container;
}

describe("MarkdownContent", () => {
  it("draws an image the post holds, from the backend's link, lazily", () => {
    const container = draw(`![a cat](blog-image:${ID})`);

    const image = screen.getByRole("img", { name: "a cat" });
    expect(image).toHaveAttribute("src", IMAGES[0].url);
    expect(image).toHaveAttribute("loading", "lazy");
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("draws no image from another site, by any road: no img element, so no request", () => {
    const container = draw(
      [
        "![pixel](https://evil.example/pixel.png)",
        "![data](data:image/png;base64,AAAA)",
        "![proto](//evil.example/p.png)",
        `![elsewhere](https://evil.example/?x=blog-image:${ID})`,
        "![unknown](blog-image:11111111-2222-4333-8444-555555555555)",
        '<img src="https://evil.example/raw.png" alt="raw">',
        "[![linked](https://evil.example/l.png)](https://example.com)",
        "![ref][r]\n\n[r]: https://evil.example/ref.png",
      ].join("\n\n"),
    );

    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.innerHTML).not.toContain("evil.example/p");
    expect(container.innerHTML).not.toContain("raw.png");
  });

  it("draws a blob: preview of a picture just chosen, when it is handed over as one of the post's images", () => {
    const container = draw(`![new](blog-image:${ID})`, [
      { id: ID, url: "blob:http://localhost/abc" },
    ]);

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "blob:http://localhost/abc",
    );
  });

  it("opens an https link in a new tab that tells nothing and endorses nothing", () => {
    draw("[docs](https://example.com/page)");

    const link = screen.getByRole("link", { name: "docs" });
    expect(link).toHaveAttribute("href", "https://example.com/page");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")?.split(" ").sort()).toEqual([
      "nofollow",
      "noopener",
      "noreferrer",
      "ugc",
    ]);
  });

  it("keeps a path on this site in the same tab", () => {
    draw("[a post](/blog/abc)");

    const link = screen.getByRole("link", { name: "a post" });
    expect(link).toHaveAttribute("href", "/blog/abc");
    expect(link).not.toHaveAttribute("target");
  });

  it.each([
    ["javascript:alert(1)"],
    ["//evil.example"],
    ["http://example.com"],
    ["data:text/html,hi"],
    [`blog-image:${ID}`],
  ])("draws a link to %s as plain text, with no href", (address) => {
    const container = draw(`[click me](${address})`);

    expect(container.querySelector("a")).toBeNull();
    expect(screen.getByText("click me")).toBeInTheDocument();
  });

  it("drops the tags of raw HTML instead of drawing them: no element comes out of them", () => {
    const container = draw(
      'before <script>alert(1)</script><b onclick="x()">bold</b> <iframe src="https://evil.example"></iframe> after',
    );

    for (const tag of ["script", "b", "iframe"]) {
      expect(container.querySelector(tag)).toBeNull();
    }
    expect(container.querySelector("[onclick]")).toBeNull();
  });

  it("draws a table that can be scrolled, a list and a quote", () => {
    draw("| a | b |\n|---|---|\n| 1 | 2 |\n\n- one\n- two\n\n> quoted");

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("quoted")).toBeInTheDocument();
  });
});
