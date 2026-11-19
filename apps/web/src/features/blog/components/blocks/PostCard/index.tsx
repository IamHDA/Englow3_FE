"use client";

import { Anchor, Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import {
  POST_STATUS_COLOR,
  countLabel,
  postStatusLabel,
} from "../../../constants/blogLabels";
import type { BlogPostSummaryData } from "../../../types";
import { AuthorChip } from "../../parts/AuthorChip";
import { TagBadges } from "../../parts/TagBadges";
import { Timestamp } from "../../parts/Timestamp";

import classes from "./PostCard.module.css";

/**
 * One post in a list or on a wall: who wrote it and when, the title, an
 * excerpt, the tags, and the counts. A badge says so when a moderator hid or
 * removed it - which only the author's own list ever holds.
 */
export function PostCard({ post }: { post: BlogPostSummaryData }) {
  const { t } = useLanguage();
  const copy = t.blog.card;
  const statusLabel = postStatusLabel(t.blog, post.status);

  return (
    <Paper
      component="article"
      withBorder
      radius="lg"
      p="lg"
      className={classes.card}
      data-dimmed={statusLabel ? "" : undefined}
    >
      <Stack gap="sm">
        <Group
          justify="space-between"
          gap="xs"
          wrap="nowrap"
          align="flex-start"
        >
          <AuthorChip author={post.author} />
          <Group gap="xs" wrap="nowrap">
            {statusLabel && (
              <Badge color={POST_STATUS_COLOR[post.status]} variant="light">
                {statusLabel}
              </Badge>
            )}
            <Timestamp value={post.createdAt} />
          </Group>
        </Group>

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
          <Text c="ink.7" lineClamp={3} className={classes.excerpt}>
            {post.excerpt}
          </Text>
        )}

        <TagBadges tags={post.tags} />

        <Group gap="lg" mt={2}>
          <Group gap={6} wrap="nowrap">
            <Heart
              size={16}
              aria-hidden="true"
              className={classes.icon}
              data-active={post.likedByMe ? "" : undefined}
            />
            <Text size="sm" c="ink.6">
              {countLabel(post.likeCount, copy.likesOne, copy.likesOther)}
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <MessageCircle
              size={16}
              aria-hidden="true"
              className={classes.icon}
            />
            <Text size="sm" c="ink.6">
              {countLabel(
                post.commentCount,
                copy.commentsOne,
                copy.commentsOther,
              )}
            </Text>
          </Group>
          {post.editedAt && (
            <Text size="xs" c="ink.5">
              {copy.edited}
            </Text>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
