"use client";

import { Button, Stack, Text } from "@mantine/core";
import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAdminBlogActionsQuery } from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { errorCodeOf } from "@/shared/network/loadError";

import { ADMIN_ACTIONS_PAGE_SIZE, BLOG_ROUTES } from "../../../constants/blog";
import { ModerationHistory } from "../../blocks/ModerationHistory";
import { BlogEmptyState } from "../../parts/BlogEmptyState";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { BlogPagination } from "../../parts/BlogPagination";
import { AdminBlogActionsViewSkeleton } from "./AdminBlogActionsViewSkeleton";

const FORBIDDEN = "FORBIDDEN";

/**
 * /admin/blog/actions: what moderators did lately, newest first - hides,
 * restores, removals and the dismissals of reports - each with its reason, who
 * did it and a link to the content it was done to.
 */
export function AdminBlogActionsView() {
  const { t } = useLanguage();
  const copy = t.blog.admin.actions;
  const [page, setPage] = useState(1);
  const { data, previousData, loading, error, refetch } =
    useAdminBlogActionsQuery({
      variables: { page: page - 1, size: ADMIN_ACTIONS_PAGE_SIZE },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    });
  const history = (data ?? previousData)?.adminBlogActions;

  if (!history && error && errorCodeOf(error) === FORBIDDEN) {
    return (
      <LoadErrorState
        error={error}
        thing={copy.title}
        back={{ href: BLOG_ROUTES.adminQueue, label: copy.back }}
      />
    );
  }

  let body;
  if (history && history.items.length > 0) {
    body = (
      <Stack gap="lg" aria-busy={loading}>
        <ModerationHistory
          emptyText={copy.emptyDescription}
          entries={history.items.map((item) => ({
            id: item.id,
            action: item.action,
            reason: item.reason,
            createdAt: item.createdAt,
            moderator: item.moderator,
            target: { type: item.targetType, id: item.targetId },
          }))}
        />
        <BlogPagination
          page={page}
          totalPages={history.totalPages}
          onChange={setPage}
        />
      </Stack>
    );
  } else if (history) {
    body = (
      <BlogEmptyState
        icon={<History size={24} aria-hidden="true" />}
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
        onRetry={() => void refetch().catch(() => undefined)}
      />
    );
  } else {
    body = <AdminBlogActionsViewSkeleton />;
  }

  return (
    <>
      <PageHeader
        title={copy.title}
        actions={
          <Button
            component={Link}
            href={BLOG_ROUTES.adminQueue}
            variant="default"
            fullWidth
            leftSection={<ArrowLeft size={16} aria-hidden="true" />}
          >
            {copy.back}
          </Button>
        }
      />
      <Text c="ink.6">{copy.subtitle}</Text>
      {body}
    </>
  );
}
