"use client";

import { Button, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useSavedBlogPostsQuery } from "@/lib/graphql/generated/hooks";
import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES, SAVED_POSTS_PAGE_SIZE } from "../../../constants/blog";
import { useBlogErrorMessage } from "../../../hooks/useBlogErrorMessage";
import { useBlogSave } from "../../../hooks/useBlogSave";
import { PostRowList } from "../../blocks/PostRowList";
import { PostRowListSkeleton } from "../../blocks/PostRowList/PostRowListSkeleton";
import { BlogEmptyState } from "../../parts/BlogEmptyState";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { BlogPagination } from "../../parts/BlogPagination";

import classes from "./BlogSavedView.module.css";

/** What a save or an unsave changes the answer of here: the list itself, so an unsaved post leaves it, and the count on the list page. */
const SAVE_REFETCH = ["SavedBlogPosts", "BlogSavedCount"];

/**
 * /blog/saved: the posts the viewer saved and may still read, the latest save
 * first, ten to a page. Pressing the bookmark of one takes it off the list. A
 * post hidden or removed since, or by someone the viewer now has a block with,
 * is not shown - it is still saved, and comes back if that is undone.
 */
export function BlogSavedView() {
  const { t } = useLanguage();
  const copy = t.blog.saved;
  const messageFor = useBlogErrorMessage();
  const [page, setPage] = useState(1);

  const { data, previousData, loading, error, refetch } =
    useSavedBlogPostsQuery({
      variables: { page: page - 1, size: SAVED_POSTS_PAGE_SIZE },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    });
  const save = useBlogSave({
    refetch: SAVE_REFETCH,
    onError: (failure) =>
      notifications.show({
        color: "warn",
        title: t.blog.actionErrorTitle,
        message: messageFor(failure),
      }),
  });
  const posts = (data ?? previousData)?.savedBlogPosts;

  let body;
  if (posts && (posts.items.length > 0 || posts.totalPages > 0)) {
    body = (
      <Stack gap="lg" className={classes.results} aria-busy={loading}>
        <PostRowList
          posts={posts.items}
          savingId={save.pendingId}
          onToggleSave={(post) => void save.toggle(post)}
        />
        <BlogPagination
          page={page}
          totalPages={posts.totalPages}
          onChange={(next) => {
            setPage(next);
            window.scrollTo({ top: 0 });
          }}
        />
      </Stack>
    );
  } else if (posts) {
    body = (
      <BlogEmptyState
        icon={<Bookmark size={24} aria-hidden="true" />}
        title={copy.emptyTitle}
        description={copy.emptyDescription}
        action={
          <Button component={Link} href={BLOG_ROUTES.list} variant="light">
            {t.blog.backToList}
          </Button>
        }
      />
    );
  } else if (error) {
    body = (
      <BlogLoadError
        title={copy.loadErrorTitle}
        description={copy.loadErrorDescription}
        retryLabel={copy.retry}
        onRetry={() => void refetch().catch(() => undefined)}
      />
    );
  } else {
    body = <PostRowListSkeleton />;
  }

  return (
    <>
      <Button
        component={Link}
        href={BLOG_ROUTES.list}
        variant="subtle"
        color="ink"
        size="compact-md"
        w="fit-content"
        leftSection={<ArrowLeft size={16} aria-hidden="true" />}
      >
        {t.blog.backToList}
      </Button>
      <Stack gap={6}>
        <PageHeader title={copy.title} />
        <Text c="ink.6" maw={560}>
          {copy.subtitle}
        </Text>
      </Stack>
      {body}
    </>
  );
}
