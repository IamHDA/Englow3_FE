import { describe, expect, it } from "vitest";

import { imageMarkdown, imageReferenceIds } from "./references";
import { isExternalHref, resolveImageSrc, resolveLinkHref } from "./urls";

const ID = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const OTHER = "11111111-2222-4333-8444-555555555555";
const images = new Map([
  [ID, "https://storage.example/blog/posts/u1/a.png?sig=1"],
]);

describe("resolveImageSrc", () => {
  it("is the link for a blog-image reference the post holds", () => {
    expect(resolveImageSrc(`blog-image:${ID}`, images)).toBe(
      "https://storage.example/blog/posts/u1/a.png?sig=1",
    );
  });

  it("finds the image whatever the case of the id in the text", () => {
    expect(resolveImageSrc(`blog-image:${ID.toUpperCase()}`, images)).toBe(
      "https://storage.example/blog/posts/u1/a.png?sig=1",
    );
    expect(resolveImageSrc(`BLOG-IMAGE:${ID}`, images)).not.toBe("");
  });

  it("is a blob address for a picture just chosen in the editor", () => {
    const preview = new Map([[OTHER, "blob:http://localhost/abc"]]);
    expect(resolveImageSrc(`blog-image:${OTHER}`, preview)).toBe(
      "blob:http://localhost/abc",
    );
  });

  it("is empty for a blog-image reference the post does not hold", () => {
    expect(resolveImageSrc(`blog-image:${OTHER}`, images)).toBe("");
    expect(resolveImageSrc("blog-image:", images)).toBe("");
    expect(resolveImageSrc("blog-image:not-an-id", images)).toBe("");
  });

  /** The point of the whole rule: nothing is ever fetched from another site. */
  it("is empty for an image on another site, so the reader's browser never asks that site for it", () => {
    expect(resolveImageSrc("https://evil.example/pixel.png", images)).toBe("");
    expect(resolveImageSrc("http://evil.example/pixel.png", images)).toBe("");
    expect(resolveImageSrc("//evil.example/pixel.png", images)).toBe("");
    expect(resolveImageSrc("/images/local.png", images)).toBe("");
    expect(resolveImageSrc("pixel.png", images)).toBe("");
  });

  it("is empty for a data:, blob: or javascript: address written in the text", () => {
    expect(resolveImageSrc("data:image/png;base64,AAAA", images)).toBe("");
    expect(resolveImageSrc("blob:http://localhost/abc", images)).toBe("");
    expect(resolveImageSrc("javascript:alert(1)", images)).toBe("");
  });

  it("is empty for an address that merely contains the scheme", () => {
    expect(
      resolveImageSrc(`https://evil.example/?u=blog-image:${ID}`, images),
    ).toBe("");
  });

  it("is empty when the post has no images at all", () => {
    expect(resolveImageSrc(`blog-image:${ID}`, new Map())).toBe("");
  });
});

describe("resolveLinkHref", () => {
  it("keeps an https address and a path on this site", () => {
    expect(resolveLinkHref("https://example.com/a?b=1#c")).toBe(
      "https://example.com/a?b=1#c",
    );
    expect(resolveLinkHref("HTTPS://example.com")).toBe("HTTPS://example.com");
    expect(resolveLinkHref("/blog/abc")).toBe("/blog/abc");
    expect(resolveLinkHref("/people/u1?x=1")).toBe("/people/u1?x=1");
  });

  it("is empty for javascript:, data:, vbscript: and http", () => {
    expect(resolveLinkHref("javascript:alert(1)")).toBe("");
    expect(resolveLinkHref("JaVaScRiPt:alert(1)")).toBe("");
    expect(resolveLinkHref("data:text/html,<script>1</script>")).toBe("");
    expect(resolveLinkHref("vbscript:x")).toBe("");
    expect(resolveLinkHref("http://example.com")).toBe("");
    expect(resolveLinkHref("mailto:a@example.com")).toBe("");
  });

  it("is empty for a protocol-relative address, however it is written", () => {
    expect(resolveLinkHref("//evil.example")).toBe("");
    expect(resolveLinkHref("/\\evil.example")).toBe("");
    expect(resolveLinkHref("/\t/evil.example")).toBe("");
    expect(resolveLinkHref("/\n/evil.example")).toBe("");
    expect(resolveLinkHref(" //evil.example")).toBe("");
  });

  it("is empty for a blog-image reference used as a link, and for a relative or empty address", () => {
    expect(resolveLinkHref(`blog-image:${ID}`)).toBe("");
    expect(resolveLinkHref("page.html")).toBe("");
    expect(resolveLinkHref("#section")).toBe("");
    expect(resolveLinkHref("")).toBe("");
  });

  it("is empty for an address with a space or a control character in it", () => {
    expect(resolveLinkHref("https://example.com/a b")).toBe("");
    expect(resolveLinkHref("https://example.com/\u0000")).toBe("");
    expect(resolveLinkHref("https://")).toBe("");
  });
});

describe("isExternalHref", () => {
  it("is true for https addresses and false for paths on this site", () => {
    expect(isExternalHref("https://example.com")).toBe(true);
    expect(isExternalHref("/blog")).toBe(false);
  });
});

describe("imageReferenceIds", () => {
  it("lists each well-formed id once, lower case, in order", () => {
    const body = `a ![](blog-image:${ID.toUpperCase()}) b ![x](blog-image:${OTHER}) ![](blog-image:${ID})`;
    expect(imageReferenceIds(body)).toEqual([ID, OTHER]);
  });

  it("ignores text that only looks like a reference", () => {
    expect(imageReferenceIds("blog-image:oops and blog-image:1234")).toEqual(
      [],
    );
  });
});

describe("imageMarkdown", () => {
  it("writes the reference as the backend gave it, with the description", () => {
    expect(imageMarkdown(`blog-image:${ID}`, "a cat")).toBe(
      `![a cat](blog-image:${ID})`,
    );
  });

  it("does not let a description end the image early", () => {
    expect(imageMarkdown(`blog-image:${ID}`, "a] [cat\nhere")).toBe(
      `![a cat here](blog-image:${ID})`,
    );
  });
});
