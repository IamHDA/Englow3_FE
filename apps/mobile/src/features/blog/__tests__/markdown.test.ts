import {
  imageMarkdown,
  imageReferenceIds,
  resolveImageSrc,
  resolveLinkHref,
} from "../markdown";

const ID = "0b8f1a52-3c41-4a7e-9e0f-5d2b7c9a1e33";

describe("blog markdown safety", () => {
  it("resolves only the post's own image references", () => {
    const images = new Map([[ID, "https://cdn.test/a.png"]]);
    expect(resolveImageSrc(`blog-image:${ID.toUpperCase()}`, images)).toBe(
      "https://cdn.test/a.png",
    );
    expect(resolveImageSrc("https://evil.test/track.png", images)).toBe("");
    expect(
      resolveImageSrc(
        "blog-image:00000000-0000-0000-0000-000000000000",
        images,
      ),
    ).toBe("");
  });

  it("opens https and site paths, nothing else", () => {
    expect(resolveLinkHref("https://example.com/x", "https://web.test")).toBe(
      "https://example.com/x",
    );
    expect(resolveLinkHref("/blog/1", "https://web.test")).toBe(
      "https://web.test/blog/1",
    );
    expect(resolveLinkHref("javascript:alert(1)", "https://web.test")).toBe("");
    expect(resolveLinkHref("//evil.test", "https://web.test")).toBe("");
    expect(resolveLinkHref("http://plain.test", "https://web.test")).toBe("");
  });

  it("finds each referenced image once and writes safe alt text", () => {
    expect(
      imageReferenceIds(`![a](blog-image:${ID}) ![b](blog-image:${ID})`),
    ).toEqual([ID]);
    expect(imageMarkdown(`blog-image:${ID}`, "a [b]\nc")).toBe(
      `![a b c](blog-image:${ID})`,
    );
  });
});
