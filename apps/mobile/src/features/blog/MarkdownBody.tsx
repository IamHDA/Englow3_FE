import * as WebBrowser from "expo-web-browser";
import { useMemo } from "react";
import { Image, StyleSheet } from "react-native";
import Markdown, { type RenderRules } from "react-native-markdown-display";

import { env } from "@/lib/env";
import { colors, fontSize, radius, spacing } from "@/ui/theme";

import { resolveImageSrc, resolveLinkHref } from "./markdown";

/** A post body: Markdown, with images limited to the post's own uploads. */
export function MarkdownBody({
  body,
  images,
}: {
  body: string;
  images: { id: string; url: string }[];
}) {
  const byId = useMemo(
    () => new Map(images.map((image) => [image.id.toLowerCase(), image.url])),
    [images],
  );

  const rules: RenderRules = useMemo(
    () => ({
      image: (node) => {
        const src = resolveImageSrc(String(node.attributes.src ?? ""), byId);
        if (!src) return null;
        return (
          <Image
            key={node.key}
            source={{ uri: src }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={String(
              node.attributes.alt ?? "Ảnh trong bài viết",
            )}
          />
        );
      },
    }),
    [byId],
  );

  return (
    <Markdown
      rules={rules}
      style={markdownStyles}
      onLinkPress={(url: string) => {
        const href = resolveLinkHref(url, env.webUrl);
        if (href) void WebBrowser.openBrowserAsync(href);
        return false;
      }}
    >
      {body}
    </Markdown>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    marginVertical: spacing.sm,
  },
});

const markdownStyles = StyleSheet.create({
  body: { color: colors.text, fontSize: fontSize.md, lineHeight: 24 },
  heading1: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginVertical: spacing.sm,
  },
  heading2: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginVertical: spacing.sm,
  },
  link: { color: colors.primary, textDecorationLine: "underline" },
  blockquote: {
    backgroundColor: colors.background,
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    paddingHorizontal: spacing.md,
  },
  code_inline: { backgroundColor: colors.background, borderRadius: 4 },
  fence: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
});
