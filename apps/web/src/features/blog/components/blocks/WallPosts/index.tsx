"use client";

import { Button, Flex, Group, Stack, Title } from "@mantine/core";
import { FileText, PenLine } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import type { BlogPostPageData } from "../../../types";
import { BlogEmptyState } from "../../parts/BlogEmptyState";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { BlogPagination } from "../../parts/BlogPagination";
import { PostList } from "../PostList";

import classes from "./WallPosts.module.css";

type WallPostsProps = {
  /** One page of the wall owner's posts; null when they could not be read. */
  posts: BlogPostPageData | null;
  /** Whether it is the viewer's own wall: theirs also lists what a moderator hid or removed, and offers "Write a post". */
  isOwn: boolean;
  /** Another page is on its way; the one on screen is dimmed until it arrives. */
  loading: boolean;
  /** Counted from 1. */
  page: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

/**
 * The "Posts" section of a wall: the owner's posts newest first, the same cards
 * as the blog. On the viewer's own wall the backend lists their hidden and
 * removed posts too - each with its status badge - which is where an author finds
 * out a post of theirs was moderated; that wall also has the "Write a post"
 * button, and says what to do when it is empty. The data is the wall's own
 * query; this only draws it.
 */
export function WallPosts({
  posts,
  isOwn,
  loading,
  page,
  onPageChange,
  onRetry,
}: WallPostsProps) {
  const copy = useLanguage().t.blog.wall;
  const write = (
    <Button
      component={Link}
      href={BLOG_ROUTES.write}
      leftSection={<PenLine size={16} aria-hidden="true" />}
    >
      {copy.write}
    </Button>
  );

  let body;
  if (posts === null) {
    body = (
      <BlogLoadError
        title={copy.loadErrorTitle}
        description={copy.loadErrorDescription}
        retryLabel={copy.retry}
        onRetry={onRetry}
      />
    );
  } else if (posts.items.length === 0) {
    body = (
      <BlogEmptyState
        icon={<FileText size={24} aria-hidden="true" />}
        title={copy.emptyTitle}
        description={
          isOwn ? copy.emptyDescriptionOwn : copy.emptyDescriptionOther
        }
        action={isOwn ? write : undefined}
      />
    );
  } else {
    body = (
      <Stack gap="lg" className={classes.posts} aria-busy={loading}>
        <PostList posts={posts.items} />
        <BlogPagination
          page={page}
          totalPages={posts.totalPages}
          onChange={onPageChange}
        />
      </Stack>
    );
  }

  return (
    <Flex
      component="section"
      direction="column"
      gap="md"
      aria-labelledby="wall-posts-title"
    >
      <Group justify="space-between" gap="sm">
        <Title order={2} fz={20} c="navy.9" id="wall-posts-title">
          {copy.title}
        </Title>
        {isOwn && posts !== null && posts.items.length > 0 && write}
      </Group>
      {body}
    </Flex>
  );
}
