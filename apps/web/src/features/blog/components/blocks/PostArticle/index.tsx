"use client";

import {
  Button,
  Divider,
  Flex,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Flag, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import { countLabel } from "../../../constants/blogLabels";
import type { Ownership } from "../../../hooks/useBlogViewer";
import type { BlogPostData } from "../../../types";
import { AuthorChip } from "../../parts/AuthorChip";
import { TagBadges } from "../../parts/TagBadges";
import { Timestamp } from "../../parts/Timestamp";
import { LikeButton } from "../LikeButton";
import { MarkdownContent } from "../MarkdownContent";

import classes from "./PostArticle.module.css";
import { PostStatusBanner } from "./PostStatusBanner";

type PostArticleProps = {
  post: BlogPostData;
  /**
   * Whether the viewer wrote it. Delete is for `own`, Report for `other`; while
   * that is not known (`loading`, or `unavailable` when the profile failed) neither
   * is offered - a Report button on a moderator's own post, even for a moment,
   * is the mistake.
   */
  ownership: Ownership;
  likePending: boolean;
  onToggleLike: () => void;
  onReport: () => void;
  onDelete: () => void;
};

/**
 * One post, read: title, who wrote it and when, the tags, the text with its
 * images, and the likes. What the viewer may do comes from the backend's own
 * answers: Edit only when `canEdit`, the likes and the Report button only when
 * `canInteract` - a hidden or removed post, which only its author opens, has
 * neither - and Delete for its author in every state.
 */
export function PostArticle({
  post,
  ownership,
  likePending,
  onToggleLike,
  onReport,
  onDelete,
}: PostArticleProps) {
  const { t } = useLanguage();
  const copy = t.blog.post;
  const canDelete = ownership === "own";
  const canReport = ownership === "other" && post.canInteract;
  const waiting = ownership === "loading";

  return (
    <Flex component="article" direction="column" gap="lg">
      <PostStatusBanner status={post.status} note={post.moderationNote} />

      <Stack gap="sm">
        <Title
          order={1}
          fz={{ base: 26, md: 34 }}
          lh={1.2}
          c="navy.9"
          className={classes.title}
        >
          {post.title}
        </Title>
        <Group gap="md" wrap="wrap">
          <AuthorChip author={post.author} size={32} />
          <Timestamp value={post.createdAt} size="sm" />
          {post.editedAt && (
            <Text size="sm" c="ink.5">
              {copy.edited}
            </Text>
          )}
        </Group>
        <TagBadges tags={post.tags} />
      </Stack>

      {(post.canEdit || canDelete || canReport || waiting) && (
        <Group gap="xs">
          {post.canEdit && (
            <Button
              component={Link}
              href={BLOG_ROUTES.edit(post.id)}
              variant="default"
              leftSection={<Pencil size={16} aria-hidden="true" />}
            >
              {copy.edit}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="default"
              color="warn"
              leftSection={<Trash2 size={16} aria-hidden="true" />}
              onClick={onDelete}
            >
              {copy.delete}
            </Button>
          )}
          {waiting && (
            <Skeleton height={36} width={96} radius="md" aria-hidden="true" />
          )}
          {canReport && (
            <Button
              variant="subtle"
              color="ink"
              leftSection={<Flag size={16} aria-hidden="true" />}
              onClick={onReport}
            >
              {copy.report}
            </Button>
          )}
        </Group>
      )}

      <Divider />

      <MarkdownContent body={post.body} images={post.images} />

      <Divider />

      <Group gap="md" justify="space-between">
        <Group gap="md">
          {post.canInteract ? (
            <LikeButton
              liked={post.likedByMe}
              count={post.likeCount}
              pending={likePending}
              onToggle={onToggleLike}
            />
          ) : (
            <Text size="sm" c="ink.6">
              {countLabel(post.likeCount, copy.likesOne, copy.likesOther)}
            </Text>
          )}
          <Text size="sm" c="ink.6">
            {countLabel(
              post.commentCount,
              copy.commentsOne,
              copy.commentsOther,
            )}
          </Text>
        </Group>
        {!post.canInteract && (
          <Text size="sm" c="ink.5">
            {copy.interactionClosed}
          </Text>
        )}
      </Group>
    </Flex>
  );
}
