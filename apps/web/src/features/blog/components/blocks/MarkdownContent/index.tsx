"use client";

import { Box, ScrollArea } from "@mantine/core";
import Link from "next/link";
import { useMemo } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  isExternalHref,
  resolveImageSrc,
  resolveLinkHref,
} from "../../../markdown/urls";
import type { BlogImageData } from "../../../types";

import classes from "./MarkdownContent.module.css";

type MarkdownContentProps = {
  /** The Markdown as written, with `blog-image:<id>` where an image goes. */
  body: string;
  /** The images the text may name, each with the address to draw it from: the backend's link, or a `blob:` for a picture just chosen. */
  images: ReadonlyArray<Pick<BlogImageData, "id" | "url">>;
};

/** The two ends of an external link's `rel`: it opens elsewhere, tells that page nothing, and is not an endorsement. */
const EXTERNAL_REL = "noopener noreferrer nofollow ugc";

/**
 * The text of a post, drawn. What may appear in it is decided here, in two
 * separate rules, because an image and a link are different risks:
 *
 * - An image is drawn only from `blog-image:<id>` for an id in `images`
 *   (`resolveImageSrc`). Any other address - https, data:, a reference the post
 *   does not hold - draws nothing, and no request is made to any other site: an
 *   image from elsewhere would tell its owner who read the post, and when.
 * - A link goes only to https or to a path on this site (`resolveLinkHref`);
 *   anything else is drawn as plain text. One that leaves the site opens a new
 *   tab with `rel="noopener noreferrer nofollow ugc"`.
 *
 * Raw HTML in the text is dropped (`skipHtml`), not escaped into view.
 */
export function MarkdownContent({ body, images }: MarkdownContentProps) {
  const imageMap = useMemo(
    () => new Map(images.map((image) => [image.id.toLowerCase(), image.url])),
    [images],
  );

  const components = useMemo<Components>(
    () => ({
      img: ({ src, alt }) =>
        typeof src === "string" && src !== "" ? (
          // A plain <img>: it is the one place the address was checked, and the
          // address can be a blob: that a framework image loader would refuse.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? ""}
            loading="lazy"
            className={classes.image}
          />
        ) : null,
      a: ({ href, children }) => {
        if (!href) return <span>{children}</span>;
        return isExternalHref(href) ? (
          <a href={href} target="_blank" rel={EXTERNAL_REL}>
            {children}
          </a>
        ) : (
          <Link href={href}>{children}</Link>
        );
      },
      table: ({ children }) => (
        <ScrollArea type="auto" className={classes.table}>
          <table>{children}</table>
        </ScrollArea>
      ),
    }),
    [],
  );

  return (
    <Box className={classes.content}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={(url, key) => {
          switch (key) {
            case "src":
              return resolveImageSrc(url, imageMap);
            case "href":
              return resolveLinkHref(url);
            default:
              // Nothing else carries an address in what Markdown can make.
              return "";
          }
        }}
        components={components}
      >
        {body}
      </Markdown>
    </Box>
  );
}
