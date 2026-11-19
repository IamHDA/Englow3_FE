"use client";

import { Button, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { History, Inbox } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BlogQueueSort, BlogTargetType } from "@/lib/graphql/generated";
import { useAdminBlogQueueQuery } from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { PageHeader, PageTabs } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { errorCodeOf } from "@/shared/network/loadError";

import { ADMIN_QUEUE_PAGE_SIZE, BLOG_ROUTES } from "../../../constants/blog";
import { ModerationQueueList } from "../../blocks/ModerationQueueList";
import { ModerationQueueListSkeleton } from "../../blocks/ModerationQueueList/ModerationQueueListSkeleton";
import { BlogEmptyState } from "../../parts/BlogEmptyState";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { BlogPagination } from "../../parts/BlogPagination";

/** The tabs of the queue: everything, or one type of content. */
const ALL = "all";
const TAB_TYPE: Record<string, BlogTargetType | null> = {
  [ALL]: null,
  post: BlogTargetType.POST,
  comment: BlogTargetType.COMMENT,
};
type Tab = "all" | "post" | "comment";

/** The code the BFF gives a call the backend refused to a learner. The shell keeps learners out; this is the second gate. */
const FORBIDDEN = "FORBIDDEN";

/**
 * /admin/blog: what has been reported and waits for a moderator - one row for
 * each piece of content, however many reports it has - oldest first or most
 * reported first, all of it or only the posts or only the comments. An account
 * the backend refuses (a learner who got in anyway) gets the "no access" page.
 */
export function AdminBlogQueueView() {
  const { t } = useLanguage();
  const copy = t.blog.admin.queue;
  const [tab, setTab] = useState<Tab>(ALL);
  const [sort, setSort] = useState<BlogQueueSort>(BlogQueueSort.OLDEST);
  const [page, setPage] = useState(1);

  const { data, previousData, loading, error, refetch } =
    useAdminBlogQueueQuery({
      variables: {
        type: TAB_TYPE[tab],
        sort,
        page: page - 1,
        size: ADMIN_QUEUE_PAGE_SIZE,
      },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    });
  const queue = (data ?? previousData)?.adminBlogQueue;
  const retry = () => void refetch().catch(() => undefined);

  if (!queue && error && errorCodeOf(error) === FORBIDDEN) {
    return (
      <LoadErrorState
        error={error}
        thing={copy.title}
        back={{ href: "/admin", label: copy.title }}
      />
    );
  }

  let body;
  if (queue && queue.items.length > 0) {
    body = (
      <Stack gap="lg" aria-busy={loading}>
        <ModerationQueueList items={queue.items} />
        <BlogPagination
          page={page}
          totalPages={queue.totalPages}
          onChange={setPage}
        />
      </Stack>
    );
  } else if (queue) {
    body = (
      <BlogEmptyState
        icon={<Inbox size={24} aria-hidden="true" />}
        title={copy.emptyTitle}
        description={copy.emptyDescription}
      />
    );
  } else if (error) {
    body = (
      <BlogLoadError
        title={copy.loadErrorTitle}
        description={copy.loadErrorDescription}
        retryLabel={copy.retry}
        onRetry={retry}
      />
    );
  } else {
    body = <ModerationQueueListSkeleton />;
  }

  return (
    <>
      <PageHeader
        title={copy.title}
        actions={
          <Button
            component={Link}
            href={BLOG_ROUTES.adminActions}
            variant="default"
            fullWidth
            leftSection={<History size={16} aria-hidden="true" />}
          >
            {copy.historyLink}
          </Button>
        }
      />
      <Text c="ink.6">{copy.subtitle}</Text>

      <PageTabs<Tab>
        value={tab}
        onChange={(next) => {
          setTab(next);
          setPage(1);
        }}
        tabs={[
          { value: "all", label: copy.tabs.all },
          { value: "post", label: copy.tabs.post },
          { value: "comment", label: copy.tabs.comment },
        ]}
      />
      <Group gap="sm">
        <Text size="sm" c="ink.6">
          {copy.sort.label}
        </Text>
        <SegmentedControl
          aria-label={copy.sort.label}
          value={sort}
          onChange={(next) => {
            setSort(
              next === BlogQueueSort.MOST_REPORTED
                ? BlogQueueSort.MOST_REPORTED
                : BlogQueueSort.OLDEST,
            );
            setPage(1);
          }}
          data={[
            { value: BlogQueueSort.OLDEST, label: copy.sort.oldest },
            {
              value: BlogQueueSort.MOST_REPORTED,
              label: copy.sort.mostReported,
            },
          ]}
        />
      </Group>

      {body}
    </>
  );
}
