"use client";

import { Anchor, Flex, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import { countLabel } from "../../../constants/blogLabels";
import type { BlogPostSummaryData } from "../../../types";
import { AuthorChip } from "../../parts/AuthorChip";
import { TagBadges } from "../../parts/TagBadges";
import { Timestamp } from "../../parts/Timestamp";
import { SaveButton } from "../SaveButton";

import classes from "./PostRow.module.css";

type PostRowProps = {
  post: BlogPostSummaryData;
  savePending: boolean;
  onToggleSave: () => void;
};

/**
 * One post of the list at /blog, a magazine line rather than a card: its tags,
 * the title, two lines of excerpt, who wrote it and when, the counts - and the
 * bookmark beside it. Rows are told apart by a hairline, which the list draws.
 */
export function PostRow({ post, savePending, onToggleSave }: PostRowProps) {
  const { t } = useLanguage();
  const copy = t.blog.card;
  return (
    <Flex component="article" gap="md" align="flex-start" py={24}>
      <Stack gap={10} flex={1} miw={0}>
        <TagBadges tags={post.tags} />
        <Title order={3} className={classes.title}>
          <Anchor
            component={Link}
            href={BLOG_ROUTES.post(post.id)}
            c="navy.9"
            underline="never"
            className={classes.link}
          >
            {post.title}
          </Anchor>
        </Title>
        {post.excerpt && (
          <Text c="ink.6" lineClamp={2} className={classes.excerpt}>
            {post.excerpt}
          </Text>
        )}
        <Group gap="xs" c="ink.5">
          <AuthorChip author={post.author} size={24} />
          <Text span aria-hidden="true">
            ·
          </Text>
          <Timestamp value={post.createdAt} size="sm" />
          <Text span aria-hidden="true">
            ·
          </Text>
          <Text size="sm" c="ink.5">
            {countLabel(post.likeCount, copy.likesOne, copy.likesOther)}
          </Text>
          <Text span aria-hidden="true">
            ·
          </Text>
          <Text size="sm" c="ink.5">
            {countLabel(
              post.commentCount,
              copy.commentsOne,
              copy.commentsOther,
            )}
          </Text>
        </Group>
      </Stack>
      <SaveButton
        saved={post.savedByMe}
        pending={savePending}
        onToggle={onToggleSave}
      />
    </Flex>
  );
}
